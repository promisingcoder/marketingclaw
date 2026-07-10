#!/usr/bin/env bash
# Build and send a Postiz public API post (POST /public/v1/posts).
# Helper around the nested {type,date,posts:[{integration,value,settings}]} payload —
# see ../SKILL.md for the full field reference and the approval-first rule.
set -euo pipefail

print_usage() {
  cat <<'USAGE'
Usage:
  postiz-post.sh --integration ID --content TEXT [--integration ID --content TEXT ...] \
                  [--now | --date 2026-07-15T14:00:00Z] [--platform TYPE] \
                  [--image UPLOAD_ID] [--tag TAG_ID] [--short-link] [--dry-run]

Options:
  --integration ID    Integration id (repeatable). Paired by position with --content/--platform.
  --content TEXT      Post text for the matching --integration (repeatable). If fewer --content
                       than --integration are given, the last --content is reused for the rest.
  --platform TYPE     settings.__type for the matching --integration, e.g. x, linkedin, facebook
                       (repeatable, optional; omitted if not given for that position).
  --now               type=now (publish immediately).
  --date TIMESTAMP    type=schedule, ISO-8601 UTC timestamp (e.g. 2026-07-15T14:00:00Z). Default
                       mode unless --now is given; --date is required in that case.
  --image UPLOAD_ID   Media id from `POST /public/v1/upload`, attached to every post (repeatable).
  --tag TAG_ID        Tag id attached to the whole post (repeatable).
  --short-link        Enable Postiz short links (shortLink=true).
  --dry-run           Print the JSON payload and exit; do not call the API.
  -h, --help          Show this help.

Env:
  POSTIZ_BASE_URL   Self-hosted backend URL, or https://api.postiz.com for cloud.
  POSTIZ_API_KEY    Authorization header value.

This script only sends the request you build — it does not decide when a post is approved.
Run with --dry-run and get explicit human sign-off on the draft BEFORE running it with --now
or a --date that puts it on the real queue.
USAGE
}

INTEGRATIONS=()
CONTENTS=()
PLATFORMS=()
IMAGES=()
TAGS=()
POST_TYPE="schedule"
POST_DATE=""
SHORT_LINK="false"
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --integration) INTEGRATIONS+=("$2"); shift 2 ;;
    --content) CONTENTS+=("$2"); shift 2 ;;
    --platform) PLATFORMS+=("$2"); shift 2 ;;
    --image) IMAGES+=("$2"); shift 2 ;;
    --tag) TAGS+=("$2"); shift 2 ;;
    --now) POST_TYPE="now"; shift ;;
    --date) POST_TYPE="schedule"; POST_DATE="$2"; shift 2 ;;
    --short-link) SHORT_LINK="true"; shift ;;
    --dry-run) DRY_RUN="true"; shift ;;
    -h|--help) print_usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; print_usage >&2; exit 1 ;;
  esac
done

if [[ ${#INTEGRATIONS[@]} -eq 0 ]]; then
  echo "Error: at least one --integration is required." >&2
  exit 1
fi
if [[ ${#CONTENTS[@]} -eq 0 ]]; then
  echo "Error: at least one --content is required." >&2
  exit 1
fi
if [[ "$POST_TYPE" == "schedule" && -z "$POST_DATE" ]]; then
  echo "Error: --date is required unless --now is set." >&2
  exit 1
fi
: "${POSTIZ_BASE_URL:?Set POSTIZ_BASE_URL}"
: "${POSTIZ_API_KEY:?Set POSTIZ_API_KEY}"

IMAGES_JSON="[]"
for id in "${IMAGES[@]:-}"; do
  [[ -z "$id" ]] && continue
  IMAGES_JSON=$(jq -c --arg id "$id" '. + [{id: $id}]' <<<"$IMAGES_JSON")
done

TAGS_JSON="[]"
for tag in "${TAGS[@]:-}"; do
  [[ -z "$tag" ]] && continue
  TAGS_JSON=$(jq -c --arg t "$tag" '. + [$t]' <<<"$TAGS_JSON")
done

last_content_index=$(( ${#CONTENTS[@]} - 1 ))
POSTS_JSON="[]"
for i in "${!INTEGRATIONS[@]}"; do
  integration="${INTEGRATIONS[$i]}"
  if [[ $i -le $last_content_index ]]; then
    content="${CONTENTS[$i]}"
  else
    content="${CONTENTS[$last_content_index]}"
  fi
  platform="${PLATFORMS[$i]:-}"
  if [[ -n "$platform" ]]; then
    settings=$(jq -cn --arg t "$platform" '{__type: $t}')
  else
    settings="{}"
  fi
  POSTS_JSON=$(jq -c \
    --arg integration "$integration" \
    --arg content "$content" \
    --argjson images "$IMAGES_JSON" \
    --argjson settings "$settings" \
    '. + [{
      integration: {id: $integration},
      value: [{content: $content, image: $images}],
      settings: $settings
    }]' <<<"$POSTS_JSON")
done

PAYLOAD=$(jq -n \
  --arg type "$POST_TYPE" \
  --arg date "$POST_DATE" \
  --argjson shortLink "$SHORT_LINK" \
  --argjson tags "$TAGS_JSON" \
  --argjson posts "$POSTS_JSON" \
  '{type: $type, shortLink: $shortLink, tags: $tags, posts: $posts} +
   (if $date != "" then {date: $date} else {} end)')

if [[ "$DRY_RUN" == "true" ]]; then
  echo "$PAYLOAD" | jq .
  exit 0
fi

curl -sS -X POST "${POSTIZ_BASE_URL%/}/public/v1/posts" \
  -H "Authorization: ${POSTIZ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | jq .
