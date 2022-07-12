import { Button, ButtonVariant } from "components/Button";
import { Image, ImageName } from "components/Image";
import { Wallet } from "lib";

import { addAccount, InitialAccount } from "slices/accounts";
import { useEffect } from "react";
import { useAppDispatch } from "store";
import Config, { defaultChainId } from "config";

import {
  CompletionViewContainer,
  CompletionViewUpperPartContainer,
  ImageContainer,
  Header1,
  BodyText,
  ButtonsContainer,
  ButtonContainer,
} from "./Completion.components";
import { Tokens, TokenType } from "constants/";
import { createShieldedAccount } from "slices/accountsNew/actions";

type CompletionViewProps = {
  // navigates to the account
  onClickSeeAccounts: () => void;
  // navigates to the settings
  onClickDone: () => void;
  mnemonic: string;
  alias: string;
  password: string;
};

const defaultChain = Config.chain[defaultChainId];
const { accountIndex } = defaultChain;

const createAccount = async (
  chainId: string,
  tokenType: TokenType,
  alias: string,
  mnemonic: string
): Promise<InitialAccount> => {
  const wallet = await new Wallet(mnemonic, tokenType).init();
  const account = wallet.new(accountIndex, 0);
  const { public: publicKey, secret: signingKey, wif: address } = account;

  return {
    chainId,
    alias,
    tokenType,
    address,
    publicKey,
    signingKey,
  };
};

const Completion = (props: CompletionViewProps): JSX.Element => {
  const { onClickSeeAccounts, mnemonic, password } = props;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (password) {
      const tokens = Object.values(Tokens);

      const defaultToken = tokens.find((token) => token.symbol === "NAM");

      // Create a master account for NAM token
      (async () => {
        if (defaultToken) {
          const account = await createAccount(
            defaultChainId,
            defaultToken.symbol as TokenType,
            defaultToken.coin,
            mnemonic
          );
          dispatch(addAccount(account));
        }
      })();

      // Create shielded accounts for each supported token:
      // Set timeout is to clear animation
      setTimeout(() => {
        tokens.forEach((token) => {
          dispatch(
            createShieldedAccount({
              chainId: defaultChainId,
              alias: token.coin,
              password,
              tokenType: token.symbol as TokenType,
            })
          );
        });
      }, 1000);
    }
  }, []);

  return (
    <CompletionViewContainer>
      <CompletionViewUpperPartContainer>
        <ImageContainer>
          <Image imageName={ImageName.SuccessImage} />
        </ImageContainer>

        <Header1>You are all set!</Header1>
        <BodyText>&nbsp;</BodyText>
      </CompletionViewUpperPartContainer>
      <ButtonsContainer>
        <ButtonContainer>
          <Button
            onClick={onClickSeeAccounts}
            variant={ButtonVariant.Contained}
          >
            Done
          </Button>
        </ButtonContainer>
      </ButtonsContainer>
    </CompletionViewContainer>
  );
};

export default Completion;
