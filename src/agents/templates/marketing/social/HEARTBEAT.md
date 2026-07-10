<!-- Riley (Social) mention-triage task. This runs on a heartbeat so mentions and -->
<!-- DMs get a timely, human reply without a live posting decision. Keep the -->
<!-- indentation exactly as-is: two spaces before "- name", four before fields. -->

tasks:

- name: mentions-check
  interval: 12h
  prompt: "Check social mentions and DMs via xurl and Postiz. Triage them, draft any replies to ~/.marketingclaw/marketing/content/replies/, and notify the CMO (or the human) for approval before anything is sent. If nothing needs attention, reply HEARTBEAT_OK."
