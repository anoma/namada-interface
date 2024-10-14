import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { ActionButton, Alert, Loading, ViewKeys } from "@namada/components";
import { AccountType, Bip44Path } from "@namada/types";
import { assertNever } from "@namada/utils";
import {
  AccountSecret,
  AccountStore,
  DeriveAccountMsg,
  SaveAccountSecretMsg,
} from "background/keyring";
import { CreatePasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useNavigate } from "react-router-dom";
import { Ports } from "router";

type Props = {
  alias: string;
  accountSecret?: AccountSecret;
  password?: string;
  passwordRequired: boolean | undefined;
  path: Bip44Path;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

export const Completion: React.FC<Props> = (props) => {
  const { alias, accountSecret, password, passwordRequired, path } = props;

  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [statusInfo, setStatusInfo] = useState<string>("");
  const [publicKeyAddress, setPublicKeyAddress] = useState("");
  const [transparentAccountAddress, setTransparentAccountAddress] =
    useState<string>("");
  const [shieldedAccountAddress, setShieldedAccountAddress] =
    useState<string>(); // undefined for private key accounts

  const requester = useRequester();
  const navigate = useNavigate();

  const closeCurrentTab = async (): Promise<void> => {
    const tab = await browser.tabs.getCurrent();
    if (tab.id) {
      await browser.tabs.remove(tab.id);
    }
  };

  useEffect(() => {
    if (!alias || !accountSecret || (passwordRequired && !password)) {
      navigate("/");
      return;
    }

    const saveMnemonic = async (): Promise<void> => {
      try {
        setStatusInfo("Setting a password for the extension.");

        if (passwordRequired && !password) {
          throw new Error("Password is required and it was not provided");
        }

        if (passwordRequired) {
          await requester.sendMessage<CreatePasswordMsg>(
            Ports.Background,
            new CreatePasswordMsg(password || "")
          );
        }

        const prettyAccountSecret =
          accountSecret.t === "Mnemonic" ? "mnemonic"
            : accountSecret.t === "PrivateKey" ? "private key"
              : assertNever(accountSecret);

        setStatusInfo(`Encrypting and storing ${prettyAccountSecret}.`);
        const storedAccount =
          (await requester.sendMessage<SaveAccountSecretMsg>(
            Ports.Background,
            new SaveAccountSecretMsg(accountSecret, alias, path)
          )) as AccountStore;

        if (!storedAccount) {
          throw new Error("Background returned failure when creating account");
        }

        setPublicKeyAddress(storedAccount.publicKey ?? "");
        setTransparentAccountAddress(storedAccount.address);

        // Do not derive shielded if this is an imported private key, and
        // ignore accounts with a non-zero 'change' path component:
        if (accountSecret.t !== "PrivateKey" && path.change === 0) {
          setStatusInfo("Generating Shielded Account");
          const { account, index } = path;
          const shieldedAccount = await requester.sendMessage<DeriveAccountMsg>(
            Ports.Background,
            // If this is a default path, don't use zip32 index
            // TODO: Should we include index of 0 on default path?
            new DeriveAccountMsg(
              {
                account,
                index: index === 0 && account === 0 ? undefined : index,
              },
              AccountType.ShieldedKeys,
              storedAccount.alias
            )
          );
          setShieldedAccountAddress(shieldedAccount.address);
        }

        setMnemonicStatus(Status.Completed);
        setStatusInfo("Done!");
      } catch (e) {
        setStatusInfo((s) => `Failed while "${s}". ${e}`);
        console.error(e);
        setMnemonicStatus(Status.Failed);
      }
    };

    void saveMnemonic();
  }, []);

  return (
    <>
      <Loading
        status={statusInfo}
        imageUrl="/assets/images/loading.gif"
        visible={mnemonicStatus === Status.Pending}
      />
      {mnemonicStatus === Status.Failed && (
        <Alert data-testid="setup-error-alert" type="error">
          {statusInfo}
        </Alert>
      )}
      {mnemonicStatus === Status.Completed && (
        <>
          <p className="text-white text-center text-base w-full -mt-3 mb-8">
            Here are the accounts generated from your keys
          </p>
          <ViewKeys
            publicKeyAddress={publicKeyAddress}
            transparentAccountAddress={transparentAccountAddress}
            shieldedAccountAddress={shieldedAccountAddress}
            trimCharacters={35}
            footer={
              <ActionButton
                size="lg"
                data-testid="setup-close-page-btn"
                onClick={closeCurrentTab}
              >
                Finish Setup
              </ActionButton>
            }
          />
        </>
      )}
    </>
  );
};
