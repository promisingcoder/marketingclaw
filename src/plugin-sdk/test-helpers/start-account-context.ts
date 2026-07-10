/**
 * Test helper for constructing a channel account startup context.
 */
import { vi } from "vitest";
import { createRuntimeEnv } from "../testing.js";
import type {
  ChannelAccountSnapshot,
  ChannelGatewayContext,
  MarketingClawConfig,
  RuntimeEnv,
} from "../testing.js";

/** Creates a minimal ChannelGatewayContext with mutable status for startAccount tests. */
export function createStartAccountContext<TAccount extends { accountId: string }>(params: {
  account: TAccount;
  abortSignal?: AbortSignal;
  cfg?: MarketingClawConfig;
  runtime?: RuntimeEnv;
  statusPatchSink?: (next: ChannelAccountSnapshot) => void;
}): ChannelGatewayContext<TAccount> {
  const snapshot: ChannelAccountSnapshot = {
    accountId: params.account.accountId,
    configured: true,
    enabled: true,
    running: false,
  };
  return {
    accountId: params.account.accountId,
    account: params.account,
    cfg: params.cfg ?? ({} as MarketingClawConfig),
    runtime: params.runtime ?? createRuntimeEnv(),
    abortSignal: params.abortSignal ?? new AbortController().signal,
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
    getStatus: () => snapshot,
    setStatus: (next) => {
      Object.assign(snapshot, next);
      params.statusPatchSink?.(snapshot);
    },
  };
}
