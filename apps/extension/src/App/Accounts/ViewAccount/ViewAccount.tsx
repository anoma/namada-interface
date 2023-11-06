import { Alert, Heading, Loading, Text } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { ExtensionRequester } from "extension";
import { QueryAccountsMsg } from "provider";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ports } from "router";

type ViewAccountProps = {
  requester: ExtensionRequester;
};

export const ViewAccount = ({ requester }: ViewAccountProps): JSX.Element => {
  const [loadingStatus, setLoadingStatus] = useState("");
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [error, setError] = useState("");
  const { accountId } = useParams();

  const fetchAccounts = async (accountId: string): Promise<void> => {
    setLoadingStatus("Loading...");
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryAccountsMsg(undefined, accountId)
      );
      setAccounts(accounts);
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

      {accounts.length > 0 && (
        <>
          <Heading>{accounts[0].alias}</Heading>
          {accounts.map((account) => (
            <Text key={account.id}>{account.address}</Text>
          ))}
        </>
      )}
    </>
  );
};
