import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "overview",
  path: "/overview",
  component: () =>
    import("./overview-page.ts").then(() => ({
      header: true,
      render: () => html`<marketingclaw-overview-page></marketingclaw-overview-page>`,
    })),
});
