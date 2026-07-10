<!-- Heartbeat template; comments-only content skips heartbeat API calls. -->
<!-- Alex (Analyst) has no default heartbeat task - the weekly-analytics-report -->
<!-- cron job covers regular reporting. Add a check below only if you want one. -->

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Example: uncomment for an ad-hoc anomaly watch between weekly reports.

# tasks:

# - name: anomaly-watch

# interval: 24h

# prompt: "Check GA4/GSC for an unusual traffic or conversion swing since the last check. Notify only if notable; otherwise HEARTBEAT_OK."
