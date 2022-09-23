import { useEffect, useState } from "react";
import { ExtensionRequester } from "extension";
import { DeriveAccountMsg, SaveMnemonicMsg } from "background/keyring";
import { Ports } from "router";

import {
  CompletionViewContainer,
  CompletionViewUpperPartContainer,
  ImageContainer,
  Header1,
  BodyText,
} from "./Completion.components";

type CompletionViewProps = {
  requester: ExtensionRequester;
  mnemonic: string[];
  password: string;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

const Completion = (props: CompletionViewProps): JSX.Element => {
  const { requester, mnemonic, password } = props;
  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [accountStatus, setAccountStatus] = useState<Status>(Status.Pending);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (password && mnemonic) {
      console.log("Account is ready to initialize", { password, mnemonic });
      (async () => {
        try {
          await requester.sendMessage<SaveMnemonicMsg>(
            Ports.Background,
            new SaveMnemonicMsg(mnemonic, password)
          );
          setMnemonicStatus(Status.Completed);
        } catch (_) {
          setMnemonicStatus(Status.Failed);
        }

        try {
          await requester.sendMessage<DeriveAccountMsg>(
            Ports.Background,
            new DeriveAccountMsg({ account: 0, change: 0, index: 0 })
          );
          setAccountStatus(Status.Completed);
        } catch (_) {
          setAccountStatus(Status.Failed);
        }

        setIsComplete(true);
      })();
    }
  }, []);

  return (
    <CompletionViewContainer>
      <ImageContainer></ImageContainer>
      <CompletionViewUpperPartContainer>
        <Header1>Creating your wallet</Header1>
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

        {isComplete && (
          <BodyText>
            Setup is complete! You may close this tab and access the extension
            popup to view your accounts.
          </BodyText>
        )}
      </CompletionViewUpperPartContainer>
    </CompletionViewContainer>
  );
};

export default Completion;
