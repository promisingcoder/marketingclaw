---
summary: "Install MarketingClaw - installer script, npm/pnpm/bun, from source, Docker, and more"
read_when:
  - You need an install method other than the Getting Started quickstart
  - You want to deploy to a cloud platform
  - You need to update, migrate, or uninstall
title: "Install"
---

## System requirements

- **Node 22.19+, 23.11+, or 24+** - Node 24 is the default target; the installer script handles this automatically.
- **macOS, Linux, or Windows** - Windows users can start with the native Windows Hub app, the PowerShell CLI installer, or a WSL2 Gateway. See [Windows](/platforms/windows).
- `pnpm` is only needed if you build from source.

## Recommended: installer script

The fastest way to install. It detects your OS, installs Node if needed, installs MarketingClaw, and launches onboarding.

<Note>
Windows desktop users can also install the native [Windows Hub](/platforms/windows#recommended-windows-hub) companion app, which includes setup, tray status, chat, node mode, and local MCP mode.
</Note>

<Tabs>
  <Tab title="macOS / Linux / WSL2">
    ```bash
    curl -fsSL https://marketingclaw.ai/install.sh | bash
    ```
  </Tab>
  <Tab title="Windows (PowerShell)">
    ```powershell
    iwr -useb https://marketingclaw.ai/install.ps1 | iex
    ```
  </Tab>
</Tabs>

To install without running onboarding:

<Tabs>
  <Tab title="macOS / Linux / WSL2">
    ```bash
    curl -fsSL https://marketingclaw.ai/install.sh | bash -s -- --no-onboard
    ```
  </Tab>
  <Tab title="Windows (PowerShell)">
    ```powershell
    & ([scriptblock]::Create((iwr -useb https://marketingclaw.ai/install.ps1))) -NoOnboard
    ```
  </Tab>
</Tabs>

For all flags and CI/automation options, see [Installer internals](/install/installer).

## Alternative install methods

### Local prefix installer (`install-cli.sh`)

Use this when you want MarketingClaw and Node kept under a local prefix such as
`~/.marketingclaw`, without depending on a system-wide Node install:

```bash
curl -fsSL https://marketingclaw.ai/install-cli.sh | bash
```

It supports npm installs by default, plus git-checkout installs under the same
prefix flow. Full reference: [Installer internals](/install/installer#install-clish).

Already installed? Switch between package and git installs with
`marketingclaw update --channel dev` and `marketingclaw update --channel stable`. See
[Updating](/install/updating#switch-between-npm-and-git-installs).

### npm, pnpm, or bun

If you already manage Node yourself:

<Tabs>
  <Tab title="npm">
    ```bash
    npm install -g openclaw@latest
    marketingclaw onboard --install-daemon
    ```

    <Note>
    The hosted installer clears npm freshness filters such as `min-release-age`
    for the MarketingClaw package install. If you install manually with npm, your own
    npm policy still applies.
    </Note>

  </Tab>
  <Tab title="pnpm">
    ```bash
    pnpm add -g openclaw@latest
    pnpm approve-builds -g
    marketingclaw onboard --install-daemon
    ```

    <Note>
    pnpm requires explicit approval for packages with build scripts. Run `pnpm approve-builds -g` after the first install.
    </Note>

  </Tab>
  <Tab title="bun">
    ```bash
    bun add -g openclaw@latest
    marketingclaw onboard --install-daemon
    ```

    <Note>
    Bun is supported for the global CLI install path. For the Gateway runtime, Node remains the recommended daemon runtime.
    </Note>

  </Tab>
</Tabs>

### From source

For contributors or anyone who wants to run from a local checkout:

```bash
git clone https://github.com/promisingcoder/marketingclaw.git
cd marketingclaw
pnpm install && pnpm build && pnpm ui:build
pnpm link --global
marketingclaw onboard --install-daemon
```

Or skip the link and use `pnpm marketingclaw ...` from inside the repo. See [Setup](/start/setup) for full development workflows.

### Install from the GitHub main checkout

```bash
curl -fsSL --proto '=https' --tlsv1.2 https://marketingclaw.ai/install.sh | bash -s -- --install-method git --version main
```

### Containers and package managers

<CardGroup cols={2}>
  <Card title="Docker" href="/install/docker" icon="container">
    Containerized or headless deployments.
  </Card>
  <Card title="Podman" href="/install/podman" icon="container">
    Rootless container alternative to Docker.
  </Card>
  <Card title="Nix" href="/install/nix" icon="snowflake">
    Declarative install via Nix flake.
  </Card>
  <Card title="Ansible" href="/install/ansible" icon="server">
    Automated fleet provisioning.
  </Card>
  <Card title="Bun" href="/install/bun" icon="zap">
    CLI-only usage via the Bun runtime.
  </Card>
</CardGroup>

## Verify the install

```bash
marketingclaw --version      # confirm the CLI is available
marketingclaw doctor         # check for config issues
marketingclaw gateway status # verify the Gateway is running
```

If you want managed startup after install:

- macOS: LaunchAgent via `marketingclaw onboard --install-daemon` or `marketingclaw gateway install`
- Linux/WSL2: systemd user service via the same commands
- Native Windows: Scheduled Task first, with a per-user Startup-folder login item fallback if task creation is denied

## Hosting and deployment

Deploy MarketingClaw on a cloud server or VPS. See [Linux server](/vps) for the full
provider picker (DigitalOcean, Hetzner, Hostinger, Fly.io, GCP, Azure, Railway,
Northflank, Oracle Cloud, Raspberry Pi, and more), or deploy declaratively on
[Render](/install/render).

<CardGroup cols={3}>
  <Card title="VPS" href="/vps">
    Pick a provider.
  </Card>
  <Card title="Docker VM" href="/install/docker-vm-runtime">
    Shared Docker steps.
  </Card>
  <Card title="Kubernetes" href="/install/kubernetes">
    K8s deployment.
  </Card>
</CardGroup>

## Update, migrate, or uninstall

<CardGroup cols={3}>
  <Card title="Updating" href="/install/updating" icon="refresh-cw">
    Keep MarketingClaw up to date.
  </Card>
  <Card title="Migrating" href="/install/migrating" icon="arrow-right">
    Move to a new machine.
  </Card>
  <Card title="Uninstall" href="/install/uninstall" icon="trash-2">
    Remove MarketingClaw completely.
  </Card>
</CardGroup>

## Troubleshooting: `marketingclaw` not found

Almost always a PATH issue: npm's global bin directory isn't on your shell's `PATH`. See [Node.js troubleshooting](/install/node#troubleshooting) for the full fix, including the Windows path.

```bash
node -v           # Node installed?
npm prefix -g     # Where are global packages?
echo "$PATH"      # Is the global bin dir in PATH?
```
