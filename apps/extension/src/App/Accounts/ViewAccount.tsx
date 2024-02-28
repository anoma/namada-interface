import { ActionButton, GapPatterns, Stack, ViewKeys } from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
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

  const searchParentAccount = (
    accountId: string
  ): DerivedAccount | undefined => {
    if (!accountId) return;
    return accountStore.find((account) => account.id === accountId);
  };

  const searchShieldedKey = (accountId: string): DerivedAccount | undefined => {
    if (!accountId) return;
    return accountStore.find(
      (account) =>
        account.parentId === accountId &&
        account.type === AccountType.ShieldedKeys
    );
  };

  useEffect(() => {
    const parentAccount = searchParentAccount(accountId);
    if (parentAccount) {
      setParentAccount(parentAccount);
      setTransparentAddress(parentAccount?.address);
    }

    const shieldedKey = searchShieldedKey(accountId);
    if (shieldedKey) {
      setShieldedAddress(shieldedKey.address);
    }
  }, [accountId]);

  if (!accountId) {
    navigate(routes.viewAccount());
  }

  return (
    <>
      {parentAccount && (
        <>
          <Stack full gap={GapPatterns.TitleContent}>
            <PageHeader title={parentAccount.alias} />
            <ViewKeys
              publicKeyAddress={parentAccount.publicKey ?? ""}
              transparentAccountAddress={transparentAddress}
              shieldedAccountAddress={shieldedAddress}
            />
          </Stack>
          <ActionButton
            size="md"
            borderRadius="md"
            onClick={() => navigate(-1)}
          >
            Back
          </ActionButton>
        </>
      )}
    </>
  );
};
