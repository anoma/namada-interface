import { Button, Variant } from "components/ButtonTemporary";
import { Image, ImageName } from "components/Image";
import { Session, Wallet } from "lib";

import {
  CompletionViewContainer,
  CompletionViewUpperPartContainer,
  ImageContainer,
  Header1,
  BodyText,
  ButtonsContainer,
  ButtonContainer,
} from "./Completion.components";

import { addAccount, InitialAccount } from "slices/accounts";
import { useEffect } from "react";
import { useAppDispatch } from "store";

type CompletionViewProps = {
  // navigates to the account
  onClickSeeAccounts: () => void;
  // navigates to the settings
  onClickDone: () => void;
  mnemonic: string;
  alias: string;
  password: string;
};

const createAccount = async (
  alias: string,
  mnemonic: string
): Promise<InitialAccount> => {
  const tokenType = "NAM";
  const wallet = await new Wallet(mnemonic, tokenType).init();
  const account = wallet.new(0);
  const { public: publicKey, secret: signingKey, wif: address } = account;

  return {
    alias,
    tokenType,
    address,
    publicKey,
    signingKey,
  };
};

// Establish login session abd store mnemonic
const setSession = (mnemonic: string, password: string): void => {
  new Session().setSession(password).setSeed(mnemonic);
};

const Completion = (props: CompletionViewProps): JSX.Element => {
  const { onClickDone, onClickSeeAccounts, mnemonic, password, alias } = props;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (password) {
      (async () => {
        const account = await createAccount(alias, mnemonic);
        dispatch(addAccount(account));

        // setSession is blocking, so delay it until after animation completes.
        // NOTE: The mnemonic is slow to encrypt, enough to cause the
        // animation to pause.
        setTimeout(() => {
          // TODO: Remove this! This is a hack, and we would be better
          // off rethinking how session handling is performed:
          setSession(mnemonic, password);
        }, 300);
      })();
    }
  }, []);

  return (
    <CompletionViewContainer>
      <CompletionViewUpperPartContainer>
        <ImageContainer>
          <Image imageName={ImageName.SuccessImage} />
        </ImageContainer>

        <Header1>You are all set!</Header1>
        <BodyText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
          maecenas sed bibendum sed velit. Consequat bibendum nibh netus sed
          erat sed.
        </BodyText>
      </CompletionViewUpperPartContainer>
      <ButtonsContainer>
        <ButtonContainer>
          <Button
            onClick={onClickDone}
            style={{ width: "100%" }}
            variant={Variant.outline}
          >
            Done
          </Button>
        </ButtonContainer>
        <ButtonContainer>
          <Button onClick={onClickSeeAccounts}>See Account</Button>
        </ButtonContainer>
      </ButtonsContainer>
    </CompletionViewContainer>
  );
};

export default Completion;
