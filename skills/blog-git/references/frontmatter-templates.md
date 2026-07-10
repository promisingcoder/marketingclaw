# Front-matter templates

Pick the template matching the target static-site generator. All three use YAML front matter
delimited by `---` at the top of the markdown file unless noted.

## Hugo

Path convention: `content/posts/<slug>.md` (or `content/<section>/<slug>/index.md` for
page bundles).

```yaml
---
title: "5 Things We Learned Shipping v2"
date: 2026-07-15T09:00:00-00:00
description: "A short summary for the meta description and post list."
slug: "5-things-shipping-v2"
tags: ["product", "engineering"]
categories: ["updates"]
draft: true
cover:
  image: "images/v2-launch-hero.jpg"
  alt: "v2 launch hero image"
---
Post body in markdown starts here.
```

Notes:

- `draft: true` keeps it out of the built site until flipped to `false`; many Hugo setups build
  drafts into a preview deploy for review.
- Some themes use `image:`/`featured_image:` instead of `cover.image` — check the theme's
  archetype file at `archetypes/default.md` for the actual expected keys.

## Jekyll

Path convention: `_posts/YYYY-MM-DD-slug.md` (the date **must** be in the filename).

```yaml
---
layout: post
title: "5 Things We Learned Shipping v2"
date: 2026-07-15 09:00:00 -0000
description: "A short summary for the meta description and post list."
categories: [updates]
tags: [product, engineering]
published: false
image: /assets/images/v2-launch-hero.jpg
---
Post body in markdown starts here.
```

Notes:

- `published: false` hides the post from the built site; set to `true` (or remove the key) to
  go live.
- File must be named `_posts/2026-07-15-5-things-shipping-v2.md` — Jekyll parses the date from
  the filename, not just the front matter.

## Astro (content collections)

Path convention: `src/content/blog/<slug>.md` (or `.mdx`), matching the collection's schema in
`src/content/config.ts`.

```yaml
---
title: "5 Things We Learned Shipping v2"
description: "A short summary for the meta description and post list."
pubDate: 2026-07-15
updatedDate: 2026-07-15
heroImage: "/images/v2-launch-hero.jpg"
tags: ["product", "engineering"]
draft: true
---
Post body in markdown/MDX starts here.
```

Notes:

- Field names must match the zod schema in `src/content/config.ts` exactly — read that file
  before writing front matter; astro build fails hard on schema mismatches (missing required
  field, wrong type).
- `draft: true` only excludes the post automatically if the blog's index/listing page explicitly
  filters on it (Astro doesn't do this for you) — check `src/pages/blog/index.astro` (or
  equivalent) for a `.filter(post => !post.data.draft)` pattern.

## Generic fallback

If the generator isn't one of the above, grep 2-3 existing posts in the repo for their front
matter keys and mirror them exactly — do not invent new keys, and match the existing date/tag
formatting conventions verbatim.
