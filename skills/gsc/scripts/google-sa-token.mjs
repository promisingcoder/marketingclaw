#!/usr/bin/env node
// Mints a short-lived Google OAuth2 access token from a service-account JSON key file,
// using the JWT bearer flow (RFC 7523 / OAuth2 for Server-to-Server Applications).
// No dependencies beyond Node's stdlib (node:crypto, global fetch).
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_TOKEN_URI = "https://oauth2.googleapis.com/token";

function printHelp() {
  console.error(`Usage: google-sa-token.mjs [--scope SCOPE] [--credentials PATH] [--subject EMAIL]

Mints a Google OAuth2 access token (1 hour lifetime) from a service-account key using the
JWT bearer flow. Prints ONLY the access token to stdout on success (safe to capture with
$(node google-sa-token.mjs) or backticks) -- all diagnostics go to stderr.

Options:
  --scope SCOPE        OAuth scope to request (default: ${DEFAULT_SCOPE}).
                        Space-separate multiple scopes in one string if needed.
  --credentials PATH    Path to the service-account JSON key file
                        (default: $GOOGLE_APPLICATION_CREDENTIALS).
  --subject EMAIL       Optional: impersonate this user via domain-wide delegation
                        (service account must have delegation enabled for the workspace).
  -h, --help            Show this help.
`);
}

function parseArgs(argv) {
  const args = {
    scope: process.env.GOOGLE_SA_SCOPE || DEFAULT_SCOPE,
    subject: process.env.GOOGLE_SA_SUBJECT || undefined,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--scope") {
      args.scope = argv[(i += 1)];
    } else if (arg === "--credentials" || arg === "-c") {
      args.credentials = argv[(i += 1)];
    } else if (arg === "--subject") {
      args.subject = argv[(i += 1)];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signJwt(keyFile, scope, subject) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: keyFile.client_email,
    scope,
    aud: keyFile.token_uri || DEFAULT_TOKEN_URI,
    iat: now,
    exp: now + 3600,
    ...(subject ? { sub: subject } : {}),
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(keyFile.private_key)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${unsigned}.${signature}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.credentials) {
    console.error(
      "Error: set GOOGLE_APPLICATION_CREDENTIALS or pass --credentials <path-to-service-account.json>",
    );
    process.exitCode = 1;
    return;
  }

  let keyFile;
  try {
    keyFile = JSON.parse(readFileSync(path.resolve(args.credentials), "utf8"));
  } catch (error) {
    console.error(
      `Error: failed to read/parse credentials file "${args.credentials}": ${error.message}`,
    );
    process.exitCode = 1;
    return;
  }

  if (keyFile.type !== "service_account") {
    console.error(
      `Error: "${args.credentials}" is not a service_account key (type="${keyFile.type}"). ` +
        "Download a service-account JSON key from the Google Cloud Console (IAM & Admin > Service Accounts).",
    );
    process.exitCode = 1;
    return;
  }
  if (!keyFile.client_email || !keyFile.private_key) {
    console.error('Error: credentials file is missing "client_email" or "private_key".');
    process.exitCode = 1;
    return;
  }

  const jwt = signJwt(keyFile, args.scope, args.subject);
  const tokenUri = keyFile.token_uri || DEFAULT_TOKEN_URI;

  let response;
  try {
    response = await fetch(tokenUri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    });
  } catch (error) {
    console.error(`Error: token request to ${tokenUri} failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(
      `Error: token request failed (HTTP ${response.status}): ${JSON.stringify(payload)}\n` +
        "Common causes: clock skew between this machine and Google, scope not granted, " +
        "or (for domain-wide delegation) the --subject user/scope not authorized in the Workspace admin console.",
    );
    process.exitCode = 1;
    return;
  }
  if (!payload.access_token) {
    console.error(`Error: no access_token in response: ${JSON.stringify(payload)}`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`${payload.access_token}\n`);
}

main().catch((error) => {
  console.error(`Error: ${error?.stack || error?.message || error}`);
  process.exitCode = 1;
});
