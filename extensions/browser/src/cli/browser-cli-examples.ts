/**
 * Help examples shown by the Browser CLI root command.
 */
/** Core Browser CLI examples for lifecycle and inspection commands. */
export const browserCoreExamples = [
  "marketingclaw browser status",
  "marketingclaw browser start",
  "marketingclaw browser start --headless",
  "marketingclaw browser stop",
  "marketingclaw browser tabs",
  "marketingclaw browser open https://example.com",
  "marketingclaw browser focus abcd1234",
  "marketingclaw browser close abcd1234",
  "marketingclaw browser screenshot",
  "marketingclaw browser screenshot --full-page",
  "marketingclaw browser screenshot --ref 12",
  "marketingclaw browser snapshot",
  "marketingclaw browser snapshot --format aria --limit 200",
  "marketingclaw browser snapshot --efficient",
  "marketingclaw browser snapshot --labels",
];

/** Browser CLI examples for interaction/action commands. */
export const browserActionExamples = [
  "marketingclaw browser navigate https://example.com",
  "marketingclaw browser resize 1280 720",
  "marketingclaw browser click 12 --double",
  "marketingclaw browser click-coords 120 340",
  'marketingclaw browser type 23 "hello" --submit',
  "marketingclaw browser press Enter",
  "marketingclaw browser hover 44",
  "marketingclaw browser drag 10 11",
  "marketingclaw browser select 9 OptionA OptionB",
  "marketingclaw browser upload /tmp/marketingclaw/uploads/file.pdf",
  "marketingclaw browser upload media://inbound/file.pdf",
  'marketingclaw browser fill --fields \'[{"ref":"1","value":"Ada"}]\'',
  "marketingclaw browser dialog --accept",
  'marketingclaw browser wait --text "Done"',
  "marketingclaw browser evaluate --fn '(el) => el.textContent' --ref 7",
  "marketingclaw browser evaluate --fn 'const title = document.title; return title;'",
  "marketingclaw browser console --level error",
  "marketingclaw browser pdf",
];
