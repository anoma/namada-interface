import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { ActionButton, Alert, Loading, ViewKeys } from "@namada/components";
import { AccountType } from "@namada/types";
import { assertNever } from "@namada/utils";
import {
  AccountSecret,
  AccountStore,
  DeriveAccountMsg,
  SaveAccountSecretMsg,
  ScanAccountsMsg,
} from "background/keyring";
import { CreatePasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useNavigate } from "react-router-dom";
import { Ports } from "router";

type Props = {
  alias: string;
  accountSecret?: AccountSecret;
  scanAccounts: boolean;
  password?: string;
  passwordRequired: boolean | undefined;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

export const Completion: React.FC<Props> = (props) => {
  const { alias, accountSecret, password, scanAccounts, passwordRequired } =
    props;

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
      browser.tabs.remove(tab.id);
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
          accountSecret.t === "Mnemonic"
            ? "mnemonic"
            : accountSecret.t === "PrivateKey"
              ? "private key"
              : assertNever(accountSecret);

        setStatusInfo(`Encrypting and storing ${prettyAccountSecret}.`);
        const account = (await requester.sendMessage<SaveAccountSecretMsg>(
          Ports.Background,
          new SaveAccountSecretMsg(accountSecret, alias)
        )) as AccountStore;

        if (!account) {
          throw new Error("Background returned failure when creating account");
        }

        setPublicKeyAddress(account.publicKey ?? "");
        setTransparentAccountAddress(account.address);

        if (accountSecret.t !== "PrivateKey") {
          setStatusInfo("Generating Shielded Account");
          const shieldedAccount = await requester.sendMessage<DeriveAccountMsg>(
            Ports.Background,
            new DeriveAccountMsg(
              account.path,
              AccountType.ShieldedKeys,
              account.alias
            )
          );
          setShieldedAccountAddress(shieldedAccount.address);
        }

        if (scanAccounts) {
          setStatusInfo("Scanning accounts.");
          await requester.sendMessage<ScanAccountsMsg>(
            Ports.Background,
            new ScanAccountsMsg()
          );
        }
        setMnemonicStatus(Status.Completed);
        setStatusInfo("Done!");
      } catch (e) {
        setStatusInfo((s) => `Failed while "${s}". ${e}`);
        console.error(e);
        setMnemonicStatus(Status.Failed);
      }
    };
    saveMnemonic();
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
            footer={
              <ActionButton
                size="lg"
                data-testid="setup-close-page-btn"
                onClick={closeCurrentTab}
              >
                Close this page
              </ActionButton>
            }
          />
        </>
      )}
    </>
  );
};
