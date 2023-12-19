import { ActionButton, ViewKeys } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { PageHeader } from "Setup/Common";
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
    <>
      <PageHeader
        title="Namada Keys Imported"
        subtitle="Here are the accounts generated from your keys"
      />
      <ViewKeys
        publicKeyAddress={account.publicKey}
        transparentAccountAddress={account.address}
        footer={
          <ActionButton onClick={closeCurrentTab}>Close this page</ActionButton>
        }
      />
    </>
  );
};
