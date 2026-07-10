<!-- Heartbeat template; comments-only content skips heartbeat API calls. -->
<!-- Jordan (Email) has no default heartbeat task - the weekly-email-health cron -->
<!-- job covers list monitoring. Add a check below only if you want one. -->

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Example: uncomment for an ad-hoc deliverability watch between cron runs.

# tasks:

# - name: deliverability-watch

# interval: 12h

# prompt: "Check Listmonk for a bounce or unsubscribe spike since the last check. Notify only if anomalous; otherwise HEARTBEAT_OK."
