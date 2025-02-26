import { chains } from "@namada/chains";
import { ActionButton, GapPatterns, Stack, ViewKeys } from "@namada/components";
import { makeBip44Path, makeSaplingPath } from "@namada/sdk/web";
import { AccountType, DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { AccountContext } from "context";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isCustomPath } from "utils";

type ViewAccountUrlParams = {
  accountId: string;
};

export const ViewAccount = (): JSX.Element => {
  const { accountId = "" } = useParams<ViewAccountUrlParams>();
  const { accounts: accountStore } = useContext(AccountContext);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [transparentAddress, setTransparentAddress] = useState("");
  const [transparentPath, setTransparentPath] = useState<string>();
  const [shieldedAddress, setShieldedAddress] = useState("");
  const [shieldedPath, setShieldedPath] = useState<string>();
  const [viewingKey, setViewingKey] = useState("");
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

      if (parentAccount.type === AccountType.ShieldedKeys) {
        setShieldedAddress(parentAccount.address);
        setShieldedPath(
          isCustomPath(parentAccount.path) ?
            makeSaplingPath(
              chains.namada.bip44.coinType,
              parentAccount.path,
              false
            )
          : undefined
        );
        if (parentAccount.owner) {
          setViewingKey(parentAccount.owner);
        }
      } else {
        setTransparentAddress(parentAccount.address);
        setTransparentPath(
          isCustomPath(parentAccount.path) ?
            makeBip44Path(
              chains.namada.bip44.coinType,
              {
                ...parentAccount.path,
                change: parentAccount.path.change || 0,
                index: parentAccount.path.index || 0,
              },
              false
            )
          : undefined
        );
      }
    }

    const shieldedAccount = searchShieldedKey(accountId);
    if (shieldedAccount) {
      setShieldedAddress(shieldedAccount.address);
      setShieldedPath(
        isCustomPath(shieldedAccount.path) ?
          makeSaplingPath(
            chains.namada.bip44.coinType,
            shieldedAccount.path,
            false
          )
        : undefined
      );
      if (shieldedAccount.owner) {
        setViewingKey(shieldedAccount.owner);
      }
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
              transparentAccountPath={transparentPath}
              shieldedAccountAddress={shieldedAddress}
              shieldedAccountPath={shieldedPath}
              trimCharacters={21}
            />
            {viewingKey && (
              <>
                {parentAccount.type !== AccountType.Ledger && (
                  <ActionButton
                    outlineColor="yellow"
                    size="sm"
                    onClick={() => {
                      if (parentAccount.type === AccountType.ShieldedKeys) {
                        navigate(routes.viewSpendingKey(parentAccount.id));
                      } else {
                        navigate(
                          routes.viewSpendingKey(
                            searchShieldedKey(accountId)?.id || ""
                          )
                        );
                      }
                    }}
                  >
                    Access Spending Key
                  </ActionButton>
                )}
                <ActionButton
                  outlineColor="yellow"
                  size="sm"
                  onClick={() => navigate(routes.viewViewingKey(viewingKey))}
                >
                  Access Viewing Key
                </ActionButton>
              </>
            )}
          </Stack>
          <ActionButton size="md" onClick={() => navigate(-1)}>
            Back
          </ActionButton>
        </>
      )}
    </>
  );
};
