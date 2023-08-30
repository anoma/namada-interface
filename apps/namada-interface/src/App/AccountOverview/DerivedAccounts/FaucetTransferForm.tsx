import { useCallback, useState } from "react";

import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  Input,
  InputVariants,
  Select,
} from "@namada/components";
import { Account, Symbols, TokenType, Tokens } from "@namada/types";
import { shortenAddress } from "@namada/utils";

import {
  FaucetButtonsContainer,
  FaucetTransferContainer,
  FaucetTransferContent,
} from "./FaucetTransferForm.components";
import { InputContainer } from "App/Token/TokenSend/TokenSendForm.components";
import { submitTransferTransaction } from "App/Token/TokenSend/TokenSendForm";
import BigNumber from "bignumber.js";
import { defaultChainId } from "@namada/chains";

const { REACT_APP_NAMADA_FAUCET_LIMIT: faucetLimit = "1000" } = process.env;

type Props = {
  account: Account;
  faucetAddress: string;
  cancelCallback?: () => void;
};

export const FaucetTransferForm = ({
  account,
  faucetAddress,
  cancelCallback,
}: Props): JSX.Element => {
  const [amount, setAmount] = useState(0);
  const { address, alias } = account;
  const [tokenType, setTokenType] = useState<TokenType>("NAM");

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const validateAmount = (): string => {
    // Ignore empty input
    if (amount === 0 || !amount) {
      return "";
    }

    return isAmountValid(amount)
      ? ""
      : `Maximum faucet transfer is ${faucetLimit}`;
  };

  const isAmountValid = (amount: number): boolean => {
    return amount > 0 && amount <= parseInt(faucetLimit);
  };

  const handleSubmit = useCallback(() => {
    const transferArgs = {
      account,
      amount: new BigNumber(`${amount}`),
      chainId: defaultChainId,
      faucet: faucetAddress,
      feeAmount: new BigNumber("0"),
      target: account.address,
      token: tokenType as TokenType,
      notify: true,
    };
    submitTransferTransaction(transferArgs);
    cancelCallback && cancelCallback();
  }, [account, amount]);

  return (
    <FaucetTransferContainer>
      <Heading level={HeadingLevel.Two}>Transfer testnet tokens</Heading>
      <FaucetTransferContent>
        <Heading level={HeadingLevel.Three}>{alias}</Heading>
        <p>From: {shortenAddress(faucetAddress)}</p>
        <p>To: {shortenAddress(address)}</p>
        <InputContainer>
          <Select
            value={tokenType}
            data={Symbols.map((symbol) => ({
              value: symbol,
              label: `${symbol} - ${Tokens[symbol].coin}`,
            }))}
            label={"Token"}
            onChange={(e) => setTokenType(e.target.value as TokenType)}
          />
        </InputContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Number}
            label={"Amount"}
            value={amount.toString()}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setAmount(parseFloat(value));
            }}
            onFocus={handleFocus}
            error={validateAmount()}
          />
        </InputContainer>
        <FaucetButtonsContainer>
          <Button
            variant={ButtonVariant.Contained}
            disabled={!isAmountValid(amount)}
            onClick={handleSubmit}
          >
            Submit
          </Button>
          {cancelCallback && (
            <Button
              variant={ButtonVariant.Contained}
              onClick={() => cancelCallback()}
            >
              Cancel
            </Button>
          )}
        </FaucetButtonsContainer>
      </FaucetTransferContent>
    </FaucetTransferContainer>
  );
};
