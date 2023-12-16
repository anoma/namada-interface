import { ActionButton, Heading, Text, ViewKeys } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { HeaderContainer } from "Setup/Setup.components";
import { LedgerConnectRoute, TopLevelRoute } from "Setup/types";
import { useLocation, useNavigate } from "react-router-dom";
import { closeCurrentTab } from "utils";

export const LedgerConfirmation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state || !location.state.account) {
    navigate(
      formatRouterPath([TopLevelRoute.Ledger, LedgerConnectRoute.Connect])
    );
    return <></>;
  }

  const account = location.state.account as DerivedAccount;
  return (
    <>
      <HeaderContainer>
        <Heading className="uppercase text-3xl" level="h1">
          Namada Keys Imported
        </Heading>
        <Text>Here are the accounts generated from your keys</Text>
      </HeaderContainer>
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
