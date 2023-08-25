import { useState } from "react";

import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  Input,
  InputVariants,
} from "@namada/components";
import { Account } from "@namada/types";
import { shortenAddress } from "@namada/utils";

import {
  FaucetButtonsContainer,
  FaucetTransferContainer,
  FaucetTransferContent,
} from "./FaucetTransferForm.components";
import { InputContainer } from "App/Token/TokenSend/TokenSendForm.components";

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

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const validateAmount = (): string => {
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

  return (
    <FaucetTransferContainer>
      <Heading level={HeadingLevel.Two}>Transfer testnet tokens</Heading>
      <FaucetTransferContent>
        <Heading level={HeadingLevel.Three}>{alias}</Heading>
        <p>From: {shortenAddress(faucetAddress)}</p>
        <p>To: {shortenAddress(address)}</p>
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
