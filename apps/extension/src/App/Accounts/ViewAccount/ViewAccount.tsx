import {
  GapPatterns,
  Heading,
  LinkButton,
  Stack,
  ViewKeys,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { AccountManagementRoute, TopLevelRoute } from "App/types";
import { AccountContext } from "context";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ViewAccountUrlParams = {
  accountId: string;
};

export const ViewAccount = (): JSX.Element => {
  const { accountId = "" } = useParams<ViewAccountUrlParams>();
  const { accounts: accountStore } = useContext(AccountContext);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [transparentAddress, setTransparentAddress] = useState("");
  const [shieldedAddress, setShieldedAddress] = useState("");
  const navigate = useNavigate();

  const searchAccounts = (accountId: string): void => {
    accountStore.forEach((account) => {
      if (account.id === accountId) {
        setParentAccount(account);
        setTransparentAddress(account.address);
        return;
      }

      if (account.parentId !== accountId) {
        return;
      }

      if (account.type === AccountType.ShieldedKeys) {
        setShieldedAddress(account.address);
        return;
      }
    });
  };

  useEffect(() => {
    accountId && searchAccounts(accountId);
  }, [accountId]);

  if (!accountId) {
    navigate(
      formatRouterPath([
        TopLevelRoute.Accounts,
        AccountManagementRoute.ViewAccounts,
      ])
    );
  }

  return (
    <>
      {parentAccount && (
        <Stack gap={GapPatterns.TitleContent}>
          <Heading>{parentAccount.alias}</Heading>
          <ViewKeys
            publicKeyAddress={parentAccount.publicKey ?? ""}
            transparentAccountAddress={transparentAddress}
            shieldedAccountAddress={shieldedAddress}
          />
          <LinkButton onClick={() => navigate(-1)}>Back</LinkButton>
        </Stack>
      )}
    </>
  );
};
