import React, { useEffect, useState } from "react";
import { ExtensionRequester } from "extension";
import browser from "webextension-polyfill";

import { Button, ButtonVariant } from "@anoma/components";
import { DeriveAccountMsg, SaveMnemonicMsg } from "background/keyring";
import { Ports } from "router";

import {
  BodyText,
  ButtonsContainer,
  CompletionViewContainer,
  CompletionViewUpperPartContainer,
  Header1,
} from "./Completion.components";

type Props = {
  alias: string;
  requester: ExtensionRequester;
  mnemonic: string[];
  password: string;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

const Completion: React.FC<Props> = (props) => {
  const { alias, mnemonic, password, requester } = props;
  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [accountStatus, setAccountStatus] = useState<Status>(Status.Pending);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (password && mnemonic) {
      (async () => {
        try {
          await requester.sendMessage<SaveMnemonicMsg>(
            Ports.Background,
            new SaveMnemonicMsg(mnemonic, password)
          );
          setMnemonicStatus(Status.Completed);
        } catch (e) {
          console.error(e);
          setMnemonicStatus(Status.Failed);
        }

        try {
          await requester.sendMessage<DeriveAccountMsg>(
            Ports.Background,
            new DeriveAccountMsg(
              { account: "0'", change: "0'", index: "0'" },
              alias
            )
          );
          setAccountStatus(Status.Completed);
        } catch (e) {
          console.error(e);
          setAccountStatus(Status.Failed);
        }

        setIsComplete(true);
      })();
    }
  }, []);

  return (
    <CompletionViewContainer>
      <CompletionViewUpperPartContainer>
        <Header1>Creating your wallet</Header1>
        {isComplete && (
          <BodyText>
            Setup is complete! You may close this tab and access the extension
            popup to view your accounts.
          </BodyText>
        )}

        {!isComplete && (
          <BodyText>One moment while your wallet is being created...</BodyText>
        )}

        <ul>
          <li>
            Encrypting and storing mnemonic:{" "}
            {mnemonicStatus === Status.Completed && <i>Complete!</i>}
            {mnemonicStatus === Status.Pending && <i>Pending...</i>}
            {mnemonicStatus === Status.Failed && <i>Failed</i>}
          </li>
          <li>
            Deriving and storing initial account:{" "}
            {accountStatus === Status.Completed && <i>Complete!</i>}
            {accountStatus === Status.Pending && <i>Pending...</i>}
            {accountStatus === Status.Failed && <i>Failed</i>}
          </li>
        </ul>
      </CompletionViewUpperPartContainer>
      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          onClick={async () => {
            const tab = await browser.tabs.getCurrent();
            if (tab.id) {
              browser.tabs.remove(tab.id);
            }
          }}
          disabled={!isComplete}
        >
          Close
        </Button>
      </ButtonsContainer>
    </CompletionViewContainer>
  );
};

export default Completion;
