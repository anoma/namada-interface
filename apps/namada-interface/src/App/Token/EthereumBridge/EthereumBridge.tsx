import {
  ActionButton,
  Input,
  Option,
  Select,
} from "@namada/components";
import { chains } from "@namada/chains";
import { Chain, TokenType, Tokens } from "@namada/types";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { Account, AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";

import {
  FeeSection,
  FormContainer,
  GeneralSection,
} from "./EthereumBridge.components";
import { getIntegration } from "@namada/integrations";

const SUPPORTED_TOKENS = ["TESTERC20", "NUTTESTERC20"];
type FormFields = "recipient" | "amount" | "feeAmount";

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
        value: `${address}|${tokenType}|${amount}`,
        label: `${alias !== "Namada" ? alias + " - " : ""}${Tokens[tokenType as TokenType].coin
          } (${amount} ${tokenType})`,
      }));
  });
};

export const EthereumBridge = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { id, chainId } = useAppSelector<Chain>((state) => state.chain.config);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  const [feeAmount, setFeeAmount] = useState<BigNumber>(new BigNumber(0));

  const accounts = Object.values(derived[chains.namada.id]).filter(
    ({ details }) => !details.isShielded
  );

  const transferableTokenData = toTokenData(accounts, ([tokenType]) =>
    SUPPORTED_TOKENS.includes(tokenType)
  );
  const [token, setToken] = useState<string>(transferableTokenData[0]?.value);
  const tokenBalance = BigNumber(token?.split("|").pop() || 0);
  const tokenData = toTokenData(
    accounts,
    ([tokenType]) => !Boolean(Tokens[tokenType as TokenType]?.isNut)
  );

  const [feeToken, setFeeToken] = useState<string>(tokenData[0]?.value);
  const feeTokenBalance = BigNumber(feeToken?.split("|").pop() || 0);

  const [dirtyFields, setDirtyFields] = useState<Set<FormFields>>(new Set());

  const handleSubmit = async (): Promise<void> => {
    const [accountId, tokenSymbol] = token.split("|");
    const [_, feeTokenSymbol] = feeToken.split("|");
    const account = accounts.find(
      (account) => account?.details?.address === accountId
    ) as Account;

    const integration = getIntegration(id);
    await integration.submitBridgeTransfer(
      {
        bridgeProps: {
          nut: Boolean(Tokens[tokenSymbol as TokenType]?.isNut),
          asset: Tokens[tokenSymbol as TokenType]?.nativeAddress || "",
          recipient,
          sender: account.details.address,
          amount,
          feeAmount,
          feeToken: Tokens[feeTokenSymbol as TokenType]?.address || "",
        },
        txProps: {
          token: Tokens.NAM.address || "",
          feeAmount: new BigNumber(0),
          gasLimit: new BigNumber(20_000),
          publicKey: account.details.publicKey,
          chainId,
        },
      },
      account.details.type
    );
  };

  const extensionKey = chains.namada.extension.id;

  // Validate form
  const recipientValid = recipient.length > 0;
  const amountValid =
    amount.isLessThan(tokenBalance) && amount.isGreaterThan(0);
  const feeAmountValid =
    (feeAmount.isLessThan(feeTokenBalance) && feeAmount.isGreaterThan(0)) ||
    extensionKey === "metamask";
  const isValid = recipientValid && amountValid && feeAmountValid;

  return (
    <>
      <FormContainer>
        <GeneralSection>
          <InputContainer>
            <Select
              data={transferableTokenData}
              value={token}
              label="Token"
              onChange={(e) => {
                setToken(e.target.value);
              }}
            />
          </InputContainer>

          <InputContainer>
            <Input
              label="Recipient"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setDirtyFields((prev) => new Set(prev).add("recipient"));
              }}
              error={
                recipientValid || !dirtyFields.has("recipient")
                  ? ""
                  : "Invalid recipient"
              }
            />
          </InputContainer>

          <InputContainer>
            <Input
              type="number"
              label="Amount"
              value={amount.toString()}
              onChange={(e) => {
                const { value } = e.target;
                setAmount(new BigNumber(`${value}`));
                setDirtyFields((prev) => new Set(prev).add("amount"));
              }}
              error={
                amountValid || !dirtyFields.has("amount")
                  ? ""
                  : "Insufficient balance"
              }
            />
          </InputContainer>
        </GeneralSection>

        {extensionKey == "namada" && (
          <FeeSection data-testid="eth-bridge-fee">
            <InputContainer>
              <Select
                data={tokenData}
                value={feeToken}
                label="Fee Token"
                onChange={(e) => {
                  setFeeToken(e.target.value);
                }}
              />
            </InputContainer>

            <InputContainer>
              <Input
                type="number"
                label="Fee Amount"
                value={feeAmount.toString()}
                onChange={(e) => {
                  const { value } = e.target;
                  setFeeAmount(new BigNumber(`${value}`));
                  setDirtyFields((prev) => new Set(prev).add("feeAmount"));
                }}
                error={
                  feeAmountValid || !dirtyFields.has("feeAmount")
                    ? ""
                    : "Insufficient balance"
                }
              />
            </InputContainer>
          </FeeSection>
        )}

        <ButtonsContainer>
          <ActionButton
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Submit
          </ActionButton>
        </ButtonsContainer>
      </FormContainer>
    </>
  );
};
