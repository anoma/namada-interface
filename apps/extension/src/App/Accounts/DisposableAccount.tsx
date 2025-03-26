import {
  ActionButton,
  GapPatterns,
  Input,
  Loading,
  Stack,
  ViewKeys,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { CheckPasswordMsg } from "background/vault";
import { useAccountContext } from "context";
import { useRequester } from "hooks/useRequester";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";

type RenameAccountParamsType = {
  accountId: string;
};

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

export const DisposableAccount = (): JSX.Element => {
  const { accountId } = useParams<RenameAccountParamsType>();
  const { getById, remove: onRemoveAccount } = useAccountContext();
  const [account, setAccount] = useState<DerivedAccount | undefined>();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [loadingState, setLoadingState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const requester = useRequester();

  const shouldDisableSubmit = status === Status.Pending || password === "";

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      try {
        setStatus(Status.Pending);
        setLoadingState("Deleting Key...");

        const verifyPassword = await requester.sendMessage<CheckPasswordMsg>(
          Ports.Background,
          new CheckPasswordMsg(password)
        );

        if (!verifyPassword) {
          setErrorMessage("Password is incorrect");
          setStatus(Status.Failed);
          setLoadingState("");
          return;
        }

        await onRemoveAccount(accountId as string);
      } catch (error) {
        setLoadingState("");
        setErrorMessage(`${error}`);
        setStatus(Status.Failed);
      }
    },
    [accountId, password]
  );

  useEffect(() => {
    if (!accountId) {
      navigate(routes.viewAccountList());
      return;
    }

    const account = getById(accountId);
    if (!account) {
      throw new Error("Invalid account provided");
    }

    setAccount(account);
  }, [accountId]);

  return (
    <>
      <PageHeader title="Disposable refund keys" />
      <Stack
        as="form"
        onSubmit={handleSubmit}
        gap={GapPatterns.FormFields}
        full
      >
        <ViewKeys
          publicKeyAddress={account?.publicKey}
          transparentAccountAddress={account?.address}
          trimCharacters={21}
        />
        <Stack className="flex-1 justify-center" gap={4} full>
          <p className="text-white leading-5 text-sm px-2 font-medium">
            Use the keys above to send refunds back to one of your main accounts
            using a Namada interface.
          </p>
          <p className="text-white leading-5 text-sm px-2 font-medium">
            Once funds have been sent please burn this account as they are only
            one time use.
          </p>
        </Stack>
        <Stack gap={GapPatterns.FormFields}>
          <Input
            autoFocus
            label="Password"
            variant="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errorMessage}
          />
          <ActionButton size="md" disabled={shouldDisableSubmit}>
            Burn Account
          </ActionButton>
        </Stack>
      </Stack>
      <Loading
        imageUrl="/assets/images/loading.gif"
        variant="full"
        status={loadingState}
        visible={!!loadingState}
      />
    </>
  );
};
