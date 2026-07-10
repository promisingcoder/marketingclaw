import { definePage } from "@openclaw/uirouter";
import { html } from "lit";

export const page = definePage({
  id: "instances",
  path: "/instances",
  component: () =>
    import("./instances-page.ts").then(() => ({
      header: true,
      render: () => html`<marketingclaw-instances-page></marketingclaw-instances-page>`,
    })),
});
