import {
  Select,
  Option,
  Input,
  InputVariants,
  Button,
  ButtonVariant,
} from "@namada/components";
import { useAppSelector } from "store";
import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";
import { Account, AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { AccountType, TokenType, Tokens } from "@namada/types";
import { FormContainer } from "./EthereumBridge.components";
import { useState } from "react";
import BigNumber from "bignumber.js";
import { getIntegration } from "@namada/hooks";

const SUPPORTED_TOKENS = ["ERC20", "NUTERC20"];

const toTokenData = (
  accounts: Account[],
  filterFn: (val: [tokenType: string, balance: BigNumber]) => boolean = () =>
    true
): Option<string>[] => {
  return accounts.flatMap(({ balance, details }) => {
    const { address, alias } = details;

    return Object.entries(balance)
      .filter(filterFn)
      .map(([tokenType, amount]) => ({
        value: `${address}|${tokenType}`,
        label: `${alias !== "Namada" ? alias + " - " : ""}${
          Tokens[tokenType as TokenType].coin
        } (${amount} ${tokenType})`,
      }));
  });
};

export const EthereumBridge = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  const [feeAmount, setFeeAmount] = useState<BigNumber>(new BigNumber(0));
  const [erc20, setErc20] = useState("");

  const accounts = Object.values(derived[chainId]).filter(
    ({ details }) => !details.isShielded
  );

  const transferableTokenData = toTokenData(accounts, ([tokenType]) =>
    SUPPORTED_TOKENS.includes(tokenType)
  );
  const [token, setToken] = useState<string>(transferableTokenData[0]?.value);
  const tokenData = toTokenData(accounts);
  const [feeToken, setFeeToken] = useState<string>(tokenData[0]?.value);

  const handleSubmit = async (): Promise<void> => {
    //TODO: figure out if we need symbol later later
    const [accountId, _tokenSymbol] = token.split("|");
    const account = accounts.find(
      (account) => account?.details?.address === accountId
    ) as Account;

    const integration = getIntegration(chainId);
    await integration.submitBridgeTransfer(
      {
        bridgeProps: {
          nut: false,
          tx: {
            token: Tokens.NAM.address || "",
            feeAmount: new BigNumber(0),
            gasLimit: new BigNumber(0),
            publicKey: account.details.publicKey,
            chainId,
          },
          asset: token,
          recipient,
          sender: account.details.address,
          amount,
          feeAmount,
          feeToken,
        },
      },
      //TODO: fix later
      AccountType.Mnemonic
    );
  };

  return (
    <FormContainer>
      <InputContainer>
        <Select
          data={transferableTokenData}
          value="0"
          label="Token"
          onChange={(e) => {
            setToken(e.target.value);
          }}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Text}
          label="Recipient"
          value={recipient}
          onChangeCallback={(e) => setRecipient(e.target.value)}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Number}
          label="Amount"
          value={amount.toString()}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setAmount(new BigNumber(`${value}`));
          }}
        />
      </InputContainer>

      <InputContainer>
        <Select
          data={tokenData}
          value="0"
          label="Fee Token"
          onChange={(e) => {
            setFeeToken(e.target.value);
          }}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Number}
          label="Fee Amount"
          value={amount.toString()}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setFeeAmount(new BigNumber(`${value}`));
          }}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Number}
          label="ERC20"
          value={erc20.toString()}
          onChangeCallback={(e) => setErc20(e.target.value)}
        />
      </InputContainer>

      <ButtonsContainer>
        <Button variant={ButtonVariant.Contained} onClick={handleSubmit}>
          Submit
        </Button>
      </ButtonsContainer>
    </FormContainer>
  );
};
