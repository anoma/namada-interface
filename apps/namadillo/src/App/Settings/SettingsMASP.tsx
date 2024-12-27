import { ActionButton, Stack } from "@namada/components";
import { routes } from "App/routes";
import { shieldedSyncAtom } from "atoms/balance";
import { clearShieldedContextAtom } from "atoms/settings";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";

export const SettingsMASP = (): JSX.Element => {
  const navigate = useNavigate();
  const [clearShieldedContext] = useAtom(clearShieldedContextAtom);
  const [{ refetch: shieldedSync }] = useAtom(shieldedSyncAtom);

  const onInvalidateShieldedContext = async (): Promise<void> => {
    await clearShieldedContext.mutateAsync();
    shieldedSync();
    navigate(routes.masp);
  };

  return (
    <Stack as="footer" className="px-5" gap={3}>
      <h2 className="text-base">Invalidate Shielded Context</h2>
      <p className="text-sm">
        In case your shielded balance is not updating correctly, you can
        invalidate the shielded context to force a rescan. This might take a few
        minutes to complete.
      </p>

      <ActionButton onClick={onInvalidateShieldedContext} className="shrink-0">
        Invalidate Shielded Context
      </ActionButton>
    </Stack>
  );
};
