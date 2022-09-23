import { useEffect } from "react";
import { Image, ImageName } from "@anoma/components";
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

const Completion = (props: CompletionViewProps): JSX.Element => {
  const { requester, mnemonic, password } = props;

  useEffect(() => {
    if (password && mnemonic) {
      console.log("Account is ready to initialize", { password, mnemonic });
      (async () => {
        const mnemonicResults = await requester.sendMessage<SaveMnemonicMsg>(
          Ports.Background,
          new SaveMnemonicMsg(mnemonic, password)
        );

        console.info({ mnemonicResults, mnemonic, password });

        const account = await requester.sendMessage<DeriveAccountMsg>(
          Ports.Background,
          new DeriveAccountMsg({ account: 0, change: 0, index: 0 })
        );

        console.info({ account });
      })();
    }
  }, []);

  return (
    <CompletionViewContainer>
      <CompletionViewUpperPartContainer>
        <ImageContainer>
          <Image imageName={ImageName.SuccessImage} />
        </ImageContainer>

        <Header1>Creating your wallet</Header1>
        <BodyText>One moment while your wallet is being created...</BodyText>
      </CompletionViewUpperPartContainer>
    </CompletionViewContainer>
  );
};

export default Completion;
