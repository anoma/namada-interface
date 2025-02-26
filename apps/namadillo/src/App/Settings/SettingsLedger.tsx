import { ActionButton, Stack } from "@namada/components";
import { requestLedgerDevice } from "@namada/sdk/web";

export const SettingsLedger = (): JSX.Element => {
  const onInvalidateShieldedContext = async (): Promise<void> => {
    requestLedgerDevice();
  };

  return (
    <Stack as="footer" className="px-5" gap={3}>
      <h2 className="text-base">Ledger</h2>
      <p className="text-sm">
        To use a Ledger device with Namadillo, you must register it first. This
        only needs to be done once. If you ever need to unregister a device, go
        to your browser settings and remove it from the list of registered
        devices.
      </p>
      <p className="text-sm">
        The <b>Register Ledger Device</b> button remains active because we have
        no way to check if a device is already registered.
      </p>

      <ActionButton onClick={onInvalidateShieldedContext} className="shrink-0">
        Register ledger device
      </ActionButton>
    </Stack>
  );
};
