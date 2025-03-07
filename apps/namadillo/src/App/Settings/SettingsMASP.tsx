import { ActionButton, Stack } from "@namada/components";
import { useInvalidateShieldedContext } from "hooks/useInvalidateShieldedContext";

export const SettingsMASP = (): JSX.Element => {
  const invalidateShieldedContext = useInvalidateShieldedContext();

  return (
    <Stack as="footer" className="px-5" gap={3}>
      <h2 className="text-base">Invalidate Shielded Context</h2>
      <p className="text-sm">
        In case your shielded balance is not updating correctly, you can
        invalidate the shielded context to force a rescan. This might take a few
        minutes to complete.
      </p>

      <ActionButton onClick={invalidateShieldedContext} className="shrink-0">
        Invalidate Shielded Context
      </ActionButton>
    </Stack>
  );
};
