import { ActionButton, Stack } from "@namada/components";

export const SettingsLedger = (): JSX.Element => {
  const onInvalidateShieldedContext = async (): Promise<void> => {
    await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x2c97 }],
    });
  };

  return (
    <Stack as="footer" className="px-5" gap={3}>
      <h2 className="text-base">Ledger</h2>
      <p className="text-sm">
        Some info about why ledger needs to be registered and how to deregister
        it.
      </p>

      <ActionButton onClick={onInvalidateShieldedContext} className="shrink-0">
        Register ledger device
      </ActionButton>
    </Stack>
  );
};
