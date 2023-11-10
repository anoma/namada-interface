import {
  Alert,
  GapPatterns,
  Heading,
  LinkButton,
  Loading,
  Stack,
  ViewKeys,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { AccountManagementRoute, TopLevelRoute } from "App/types";
import { ParentAccount } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { QueryAccountsMsg } from "provider";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";

type ViewAccountUrlParams = {
  accountId: string;
  type?: ParentAccount;
};

export const ViewAccount = (): JSX.Element => {
  const { accountId = "" } = useParams<ViewAccountUrlParams>();
  const [loadingStatus, setLoadingStatus] = useState("");
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [transparentAddress, setTransparentAddress] = useState("");
  const [shieldedAddress, setShieldedAddress] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const requester = useRequester();

  const fetchAccounts = async (accountId: string): Promise<void> => {
    setLoadingStatus("Loading...");
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryAccountsMsg({ accountId })
      );
      setAccounts(accounts);

      const parentAccount = accounts.find((account) => !account.parentId);
      setParentAccount(parentAccount);

      accounts.forEach((account) => {
        if (
          account.type === AccountType.Mnemonic ||
          account.type === AccountType.Ledger
        ) {
          setTransparentAddress(account.address);
        }

        if (account.type === AccountType.ShieldedKeys) {
          setShieldedAddress(account.address);
        }
      });
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
    }

    setLoadingStatus("");
  };

  useEffect(() => {
    accountId && fetchAccounts(accountId);
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
      <Loading
        status={loadingStatus}
        visible={!!loadingStatus}
        variant="full"
      />

      {error && (
        <Alert type="error" title="Error!">
          {error}
        </Alert>
      )}

      {!loadingStatus && !error && parentAccount && accounts.length > 0 && (
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
