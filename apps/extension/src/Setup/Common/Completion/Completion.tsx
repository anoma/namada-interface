import React, { useState } from "react";
import { ExtensionRequester } from "extension";
import browser from "webextension-polyfill";

import { Button, ButtonVariant } from "@namada/components";
import { useUntil } from "@namada/hooks";
import {
  CheckIsLockedMsg,
  SaveMnemonicMsg,
  ScanAccountsMsg,
} from "background/keyring";
import { Ports } from "router";

import {
  BodyText,
  ButtonsContainer,
  Header1,
  SubViewContainer,
  UpperContentContainer,
} from "Setup/Setup.components";
import { StatusInfo, StatusLoader } from "./Completion.components";

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
  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [statusInfo, setStatusInfo] = useState(
    "Encrypting and storing mnemonic."
  );

  useUntil(
    {
      predFn: async () => {
        try {
          //TODO: replace with something else
          await requester.sendMessage<CheckIsLockedMsg>(
            Ports.Background,
            new CheckIsLockedMsg()
          );
          return true;
        } catch (_) {
          return false;
        }
      },
      onSuccess: async () => {
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
      },
      onFail: () => {
        setStatusInfo((s) => `Failed while "${s}"`);
        setMnemonicStatus(Status.Failed);
      },
    },
    { tries: 10, ms: 100 },
    []
  );

  return (
    <SubViewContainer>
      <UpperContentContainer>
        <Header1>Creating your wallet</Header1>
        {mnemonicStatus === Status.Completed && (
          <BodyText>
            Setup is complete! You may close this tab and access the extension
            popup to view your accounts.
          </BodyText>
        )}
        {mnemonicStatus !== Status.Completed && (
          <BodyText>One moment while your wallet is being created...</BodyText>
        )}
        <StatusInfo>
          <StatusLoader
            className={mnemonicStatus === Status.Pending ? "is-loading" : ""}
          />
          <BodyText>{statusInfo}</BodyText>
        </StatusInfo>
      </UpperContentContainer>
      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          onClick={async () => {
            const tab = await browser.tabs.getCurrent();
            if (tab.id) {
              browser.tabs.remove(tab.id);
            }
          }}
          disabled={mnemonicStatus !== Status.Completed}
        >
          Close
        </Button>
      </ButtonsContainer>
    </SubViewContainer>
  );
};

export default Completion;
