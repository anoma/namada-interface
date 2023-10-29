import { ExtensionRequester } from "extension";
import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import {
  ActionButton,
  Heading,
  Input,
  InputVariants,
  Stack,
  Textarea,
} from "@namada/components";
import { SaveMnemonicMsg, ScanAccountsMsg } from "background/keyring";
import { Ports } from "router";
import { HeaderContainer, Subtitle } from "Setup/Setup.components";
import { Loading } from "../Loading";
import {
  DownloadPanel,
  WarningPanel,
  WarningPanelTitle,
} from "./Completion.components";

type Props = {
  alias: string;
  requester: ExtensionRequester;
  mnemonic: string[];
  password: string;
  scanAccounts: boolean;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

const Completion: React.FC<Props> = (props) => {
  const { alias, mnemonic, password, requester, scanAccounts } = props;
  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(
    Status.Completed
  );
  const [statusInfo, setStatusInfo] = useState(
    "Encrypting and storing mnemonic."
  );

  const closeCurrentTab = async (): Promise<void> => {
    const tab = await browser.tabs.getCurrent();
    if (tab.id) {
      browser.tabs.remove(tab.id);
    }
  };

  useEffect(() => {
    const saveMnemonic = async (): Promise<void> => {
      try {
        await requester.sendMessage<SaveMnemonicMsg>(
          Ports.Background,
          new SaveMnemonicMsg(mnemonic, password, alias)
        );
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
      {mnemonicStatus === Status.Completed && (
        <>
          <HeaderContainer>
            <Heading level="h1" size="3xl">
              Namada Keys Created
            </Heading>
            <Subtitle>Here are the accounts generated from your keys</Subtitle>
          </HeaderContainer>
          <Stack as="section" gap={8}>
            <Stack gap={4}>
              <Input
                label="Your Transparent Account"
                variant={InputVariants.ReadOnlyCopy}
                value="<transparent-account>"
                theme={"primary"}
              />
              <Textarea
                label="Your Shielded Account"
                readOnly={true}
                value="<transparent-account>"
                theme={"secondary"}
                sensitive={true}
              />
              <DownloadPanel>
                Viewing keys of shielded account
                <ActionButton size="base" variant="secondary">
                  Download
                </ActionButton>
              </DownloadPanel>
            </Stack>
            <Stack as="footer" gap={4}>
              <WarningPanel>
                <WarningPanelTitle>
                  BEFORE SHARING YOUR VIEWING KEYS
                </WarningPanelTitle>
                <p>
                  Note that ANYONE with your viewing keys can see the assets,
                  transaction value, memo field and receiver address of all
                  transactions received by or sent by the corresponding shielded
                  account.
                </p>
              </WarningPanel>
              <ActionButton onClick={closeCurrentTab}>
                Close this page
              </ActionButton>
            </Stack>
          </Stack>
        </>
      )}
    </>
  );
};

export default Completion;
