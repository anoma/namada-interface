import { ExtensionRequester } from "extension";
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
import { HeaderContainer, Subtitle } from "Setup/Setup.components";
import {
  AccountStore,
  DeriveAccountMsg,
  SaveMnemonicMsg,
  ScanAccountsMsg,
} from "background/keyring";
import { Ports } from "router";
import { useNavigate } from "react-router-dom";
import { formatRouterPath } from "@namada/utils";
import { TopLevelRoute } from "Setup/types";

type Props = {
  alias: string;
  requester: ExtensionRequester;
  mnemonic: string[];
  password: string;
  scanAccounts: boolean;
  pageTitle: string;
  pageSubtitle: string;
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
    requester,
    scanAccounts,
    pageTitle,
    pageSubtitle,
  } = props;

  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [statusInfo, setStatusInfo] = useState<string>("");
  const [publicKeyAddress, setPublicKeyAddress] = useState("");
  const [transparentAccountAddress, setTransparentAccountAddress] =
    useState<string>("");
  const [shieldedAccountAddress, setShieldedAccountAddress] =
    useState<string>("");

  const navigate = useNavigate();

  const closeCurrentTab = async (): Promise<void> => {
    const tab = await browser.tabs.getCurrent();
    if (tab.id) {
      browser.tabs.remove(tab.id);
    }
  };

  useEffect(() => {
    if (!alias || !mnemonic || !password) {
      navigate(formatRouterPath([TopLevelRoute.Start]));
    }
  }, []);

  useEffect(() => {
    const saveMnemonic = async (): Promise<void> => {
      try {
        setStatusInfo("Encrypting and storing mnemonic.");
        const account = (await requester.sendMessage<SaveMnemonicMsg>(
          Ports.Background,
          new SaveMnemonicMsg(mnemonic, password, alias)
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
            <Heading level="h1" size="3xl">
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
