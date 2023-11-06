import {
  Alert,
  Heading,
  LinkButton,
  Loading,
  Stack,
  ViewKeys,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { ExtensionRequester } from "extension";
import { QueryAccountsMsg } from "provider";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";

type ViewAccountProps = {
  requester: ExtensionRequester;
};

export const ViewAccount = ({ requester }: ViewAccountProps): JSX.Element => {
  const [loadingStatus, setLoadingStatus] = useState("");
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [transparentAddress, setTransparentAddress] = useState("");
  const [shieldedAddress, setShieldedAddress] = useState("");

  const [error, setError] = useState("");
  const { accountId } = useParams();
  const navigate = useNavigate();

  const fetchAccounts = async (accountId: string): Promise<void> => {
    setLoadingStatus("Loading...");
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryAccountsMsg(undefined, accountId)
      );
      setAccounts(accounts);

      const parentAccount = accounts.find((account) => !account.parentId);
      setParentAccount(parentAccount);

      accounts.forEach((account) => {
        if (account.type === AccountType.Mnemonic) {
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
        <Stack gap={6}>
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
