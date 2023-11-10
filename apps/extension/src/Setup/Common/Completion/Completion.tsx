import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import {
  ActionButton,
  Alert,
  Heading,
  Loading,
  ViewKeys,
} from "@namada/components";
import { AccountType } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { HeaderContainer, Subtitle } from "Setup/Setup.components";
import { TopLevelRoute } from "Setup/types";
import {
  AccountStore,
  DeriveAccountMsg,
  SaveMnemonicMsg,
  ScanAccountsMsg,
} from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { useNavigate } from "react-router-dom";
import { Ports } from "router";
import { CreatePasswordMsg } from "background/vault";

type Props = {
  alias: string;
  mnemonic: string[];
  scanAccounts: boolean;
  pageTitle: string;
  pageSubtitle: string;
  password?: string;
  passwordRequired: boolean | undefined;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

const Completion: React.FC<Props> = (props) => {
  const {
    alias,
    mnemonic,
    password,
    scanAccounts,
    pageTitle,
    pageSubtitle,
    passwordRequired,
  } = props;

  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [statusInfo, setStatusInfo] = useState<string>("");
  const [publicKeyAddress, setPublicKeyAddress] = useState("");
  const [transparentAccountAddress, setTransparentAccountAddress] =
    useState<string>("");
  const [shieldedAccountAddress, setShieldedAccountAddress] =
    useState<string>("");

  const requester = useRequester();
  const navigate = useNavigate();

  const closeCurrentTab = async (): Promise<void> => {
    const tab = await browser.tabs.getCurrent();
    if (tab.id) {
      browser.tabs.remove(tab.id);
    }
  };

  useEffect(() => {
    if (!alias || !mnemonic || (passwordRequired && !password)) {
      navigate(formatRouterPath([TopLevelRoute.Start]));
    }
  }, []);

  useEffect(() => {
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

        setStatusInfo("Encrypting and storing mnemonic.");
        const account = (await requester.sendMessage<SaveMnemonicMsg>(
          Ports.Background,
          new SaveMnemonicMsg(mnemonic, alias)
        )) as AccountStore;

        setPublicKeyAddress(account.publicKey ?? "");
        setTransparentAccountAddress(account.address);

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
        setStatusInfo((s) => `Failed while "${s}"`);
        console.error(e);
        setMnemonicStatus(Status.Failed);
      }
    };
    saveMnemonic();
  }, [alias, mnemonic, password, scanAccounts]);

  return (
    <>
      <Loading
        status={statusInfo}
        visible={mnemonicStatus === Status.Pending}
      />
      {mnemonicStatus === Status.Failed && (
        <Alert type="error">{statusInfo}</Alert>
      )}
      {mnemonicStatus === Status.Completed && (
        <>
          <HeaderContainer>
            <Heading uppercase level="h1" size="3xl">
              {pageTitle}
            </Heading>
            <Subtitle>{pageSubtitle}</Subtitle>
          </HeaderContainer>
          <ViewKeys
            publicKeyAddress={publicKeyAddress}
            transparentAccountAddress={transparentAccountAddress}
            shieldedAccountAddress={shieldedAccountAddress}
            footer={
              <ActionButton onClick={closeCurrentTab}>
                Close this page
              </ActionButton>
            }
          />
        </>
      )}
    </>
  );
};

export default Completion;
