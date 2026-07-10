// Venice tests cover provider runtime.contract plugin behavior.
import { describeVeniceProviderRuntimeContract } from "marketingclaw/plugin-sdk/provider-test-contracts";

describeVeniceProviderRuntimeContract(() => import("./index.js"));
