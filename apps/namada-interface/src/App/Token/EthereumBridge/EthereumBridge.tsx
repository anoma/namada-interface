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
import {
  FormContainer,
  TransferCol,
  TransferRow,
  TransfersContainer,
} from "./EthereumBridge.components";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { getIntegration } from "@namada/hooks";
import { Query, TransferToEthereum } from "@namada/shared";
import { chains } from "@namada/chains";
import { shortenAddress } from "@namada/utils";

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

  const accounts = Object.values(derived[chainId]).filter(
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

    const integration = getIntegration(chainId);
    await integration.submitBridgeTransfer(
      {
        bridgeProps: {
          nut: Boolean(Tokens[tokenSymbol as TokenType]?.isNut),
          tx: {
            token: Tokens.NAM.address || "",
            feeAmount: new BigNumber(0),
            gasLimit: new BigNumber(20_000),
            publicKey: account.details.publicKey,
            chainId,
          },
          asset: Tokens[tokenSymbol as TokenType]?.nativeAddress || "",
          recipient,
          sender: account.details.address,
          amount,
          feeAmount,
          feeToken: Tokens[feeTokenSymbol as TokenType]?.address || "",
        },
      },
      //TODO: support ledger?
      AccountType.Mnemonic
    );
  };

  // Validat form
  const recipientValid = recipient.length > 0;
  const amountValid =
    amount.isLessThan(tokenBalance) && amount.isGreaterThan(0);
  const feeAmountValid =
    feeAmount.isLessThan(feeTokenBalance) && feeAmount.isGreaterThan(0);
  const isValid = recipientValid && amountValid && feeAmountValid;

  // Load pending transfers
  const [pendingTransfers, setPendingTransfers] = useState<
    TransferToEthereum[]
  >([]);
  const [transfersLoaded, setTransfersLoaded] = useState(false);
  useEffect(() => {
    console.log("accounts", JSON.stringify(accounts));
    (async () => {
      const { rpc } = chains[chainId];
      const query = new Query(rpc);
      const addresses = accounts.map(({ details }) => details.address);
      const bridgePool: TransferToEthereum[] =
        await query.query_signed_bridge_pool(addresses);
      setPendingTransfers(bridgePool);
      setTransfersLoaded(true);
    })();
  }, [JSON.stringify(accounts)]);

  return (
    <>
      <FormContainer>
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
            variant={InputVariants.Text}
            label="Recipient"
            value={recipient}
            onChangeCallback={(e) => {
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
            variant={InputVariants.Number}
            label="Amount"
            value={amount.toString()}
            onChangeCallback={(e) => {
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
            variant={InputVariants.Number}
            label="Fee Amount"
            value={feeAmount.toString()}
            onChangeCallback={(e) => {
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

        <ButtonsContainer>
          <Button
            variant={ButtonVariant.Contained}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Submit
          </Button>
        </ButtonsContainer>
      </FormContainer>
      {transfersLoaded && pendingTransfers.length > 0 && (
        <TransfersContainer>
          <h3>Pending Transfers</h3>
          <TransferRow>
            <TransferCol>Kind</TransferCol>
            <TransferCol>Sender</TransferCol>
            <TransferCol>Recipient</TransferCol>
            <TransferCol>Amount</TransferCol>
            <TransferCol>Asset</TransferCol>
          </TransferRow>
          {pendingTransfers.map((transfer, i) => (
            <TransferRow key={i}>
              <TransferCol>{transfer.kind}</TransferCol>
              <TransferCol>{shortenAddress(transfer.sender, 4, 4)}</TransferCol>
              <TransferCol>
                {shortenAddress(transfer.recipient, 4, 4)}
              </TransferCol>
              <TransferCol>{transfer.amount}</TransferCol>
              <TransferCol>{shortenAddress(transfer.asset, 4, 4)}</TransferCol>
            </TransferRow>
          ))}
        </TransfersContainer>
      )}
    </>
  );
};
