import { Image, ImageName } from "components/Image";
import { Session, Wallet } from "lib";

import { addAccount, InitialAccount } from "slices/accounts";
import { useEffect } from "react";
import { useAppDispatch } from "store";
import Config from "config";

import {
  CompletionViewContainer,
  CompletionViewUpperPartContainer,
  ImageContainer,
  Header1,
  BodyText,
} from "./Completion.components";
import { Tokens, TokenType } from "constants/";
import { createShieldedAccount } from "slices/AccountsNew/actions";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "App/types";

type CompletionViewProps = {
  // navigates to the account
  setPassword: (password: string) => void;
  mnemonic: string;
  password: string;
};

const chains = Object.values(Config.chain);

const createAccount = async (
  chainId: string,
  accountIndex: number,
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
  const { setPassword, mnemonic, password } = props;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (password && mnemonic) {
      // 1. Encrypt and store Mnemonic
      // 2. Set up initial accounts

      setTimeout(() => {
        (async () => {
          await Session.setSeed(mnemonic, password || "");
          const tokens = Object.values(Tokens);

          const defaultToken = tokens.find((token) => token.symbol === "NAM");

          // Create accounts on each chain
          if (defaultToken) {
            chains.forEach((chain) => {
              const { accountIndex } = chain;

              (async () => {
                const account = await createAccount(
                  chain.id,
                  accountIndex,
                  defaultToken.symbol as TokenType,
                  defaultToken.coin,
                  mnemonic
                );
                dispatch(addAccount({ ...account, isInitial: true }));
              })();
            });

            chains.forEach((chain) => {
              dispatch(
                createShieldedAccount({
                  chainId: chain.id,
                  alias: defaultToken.coin,
                  password,
                  tokenType: defaultToken.symbol as TokenType,
                })
              );
            });

            setTimeout(() => {
              // Log user into wallet:
              setPassword(password);
              navigate(TopLevelRoute.Wallet);
            }, 3000);
          }
        })();
      }, 1200);
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
