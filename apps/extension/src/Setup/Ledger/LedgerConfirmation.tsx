import { ActionButton, Stack, ViewKeys } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import routes from "Setup/routes";
import { useLocation, useNavigate } from "react-router-dom";
import { closeCurrentTab } from "utils";

export const LedgerConfirmation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state || !location.state.account) {
    navigate(routes.ledgerConnect());
    return <></>;
  }

  const account = location.state.account as DerivedAccount;
  return (
    <Stack gap={4} className="h-[470px]">
      <p className="text-white text-center text-base w-full -mt-3 mb-8">
        Here are the accounts generated from your keys
      </p>
      <ViewKeys
        publicKeyAddress={account.publicKey}
        transparentAccountAddress={account.address}
      />
      <ActionButton size="lg" onClick={closeCurrentTab}>
        Close this page
      </ActionButton>
    </Stack>
  );
};
