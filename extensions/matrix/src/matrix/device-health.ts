// Matrix plugin module implements device health behavior.
export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleMarketingClawDevices: MatrixManagedDeviceInfo[];
  currentMarketingClawDevices: MatrixManagedDeviceInfo[];
};

const MARKETINGCLAW_DEVICE_NAME_PREFIX = "MarketingClaw ";

export function isMarketingClawManagedMatrixDevice(
  displayName: string | null | undefined,
): boolean {
  return displayName?.startsWith(MARKETINGCLAW_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const marketingClawDevices = devices.filter((device) =>
    isMarketingClawManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleMarketingClawDevices: marketingClawDevices.filter((device) => !device.current),
    currentMarketingClawDevices: marketingClawDevices.filter((device) => device.current),
  };
}
