import {
  Select,
  Option,
  Input,
  InputVariants,
  Button,
  ButtonVariant,
} from "@namada/components";
import { chains, ethereum, namada } from "@namada/chains";
import { useAppDispatch, useAppSelector } from "store";
import {
  ButtonsContainer,
  InputContainer,
} from "../TokenSend/TokenSendForm.components";
import {
  Account,
  AccountsState,
  addAccounts,
  fetchBalances,
} from "slices/accounts";
import { SettingsState } from "slices/settings";
import { BridgeType, Chain, TokenType, Tokens } from "@namada/types";
import {
  FeeSection,
  FormContainer,
  GeneralSection,
} from "./EthereumBridge.components";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { extensions } from "@namada/integrations";
import { useIntegrationConnection } from "@namada/hooks";
import { ConnectExtensionButton } from "../ConnectExtensionButton";

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

const toChainData = (chains: Chain[]): Option<string>[] => {
  return Object.values(chains)
    .filter((chain) => chain.bridgeType.includes(BridgeType.Ethereum))
    .map((chain) => ({
      value: chain.chainId,
      label: chain.alias,
    }));
};

export const EthereumBridge = (): JSX.Element => {
  const dispatch = useAppDispatch();
  // State
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  const [feeAmount, setFeeAmount] = useState<BigNumber>(new BigNumber(0));
  const [{ source, destination }, setChains] = useState<{
    source: Chain;
    destination: Chain;
  }>({
    source: namada,
    destination: ethereum,
  });
  const chainData = toChainData(Object.values(chains));

  const accounts = Object.values(derived[source.chainId]).filter(
    ({ details }) => !details.isShielded
  );
  const tokenData = toTokenData(
    accounts,
    ([tokenType]) => !Boolean(Tokens[tokenType as TokenType]?.isNut)
  );

  const isNamadaSource = source.extension.id === "namada";
  const isMetamaskConnected =
    connectedChains.includes(source.chainId) &&
    connectedChains.includes(destination.chainId);

  const [token, setToken] = useState<string>(tokenData[0]?.value);
  const tokenBalance = BigNumber(token?.split("|").pop() || 0);

  const [feeToken, setFeeToken] = useState<string>(tokenData[0]?.value);
  const feeTokenBalance = BigNumber(feeToken?.split("|").pop() || 0);

  const [dirtyFields, setDirtyFields] = useState<Set<FormFields>>(new Set());

  //Handlers
  const handleChainChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    isSource: boolean
  ): void => {
    const target = chains[e.target.value];
    const other = Object.values(chains).filter(
      (chain) =>
        chain.bridgeType.includes(BridgeType.Ethereum) && chain !== target
    )[0];
    const result = isSource
      ? { source: target, destination: other }
      : { source: other, destination: target };

    const account = Object.values(derived[result.source.chainId])[0];
    if (account) {
      const [symbol, amount] = Object.entries(account.balance)[0];
      const token = `${account.details.address}|${symbol}|${amount}`;
      setToken(token);
    }

    setChains(result);
    setRecipient("");
  };

  const handleSubmit = async (): Promise<void> => {
    const [accountId, tokenSymbol] = token.split("|");
    const [_, feeTokenSymbol] = feeToken.split("|");
    const account = accounts.find(
      (account) => account?.details?.address === accountId
    ) as Account;

    const integration = extensions[source.extension.id];
    await integration.submitBridgeTransfer(
      {
        bridgeProps: {
          nut: Boolean(Tokens[tokenSymbol as TokenType]?.isNut),
          tx: {
            token: Tokens.NAM.address || "",
            feeAmount: new BigNumber(0),
            gasLimit: new BigNumber(20_000),
            publicKey: account.details.publicKey,
            chainId: source.chainId,
          },
          asset: Tokens[tokenSymbol as TokenType]?.nativeAddress || "",
          recipient,
          sender: account.details.address,
          amount,
          feeAmount,
          feeToken: Tokens[feeTokenSymbol as TokenType]?.address || "",
        },
      },
      account.details.type
    );
  };

  const extensionKey = source.extension.id;

  // Validate form
  const recipientValid = recipient.length > 0;
  const amountValid =
    amount.isLessThan(tokenBalance) && amount.isGreaterThan(0);
  const feeAmountValid =
    (feeAmount.isLessThan(feeTokenBalance) && feeAmount.isGreaterThan(0)) ||
    extensionKey === "metamask";
  const isValid = recipientValid && amountValid && feeAmountValid;

  // Query Keplr accounts if connected
  const [integration, _, withConnection] = useIntegrationConnection("metamask");

  useEffect(() => {
    const queryKeplr = async (): Promise<void> => {
      withConnection(
        async () => {
          const accounts = await integration.accounts();
          if (accounts) {
            dispatch(addAccounts(accounts));
            dispatch(fetchBalances(destination.chainId));
          }
        },
        async () => {
          //TODO: handle error
        }
      );
    };
    if (isMetamaskConnected) {
      queryKeplr();
    }
  }, []);

  return (
    <>
      <FormContainer>
        {!isNamadaSource && !isMetamaskConnected && (
          <ConnectExtensionButton chain={source} text="Connect to Metamask" />
        )}
        <GeneralSection>
          <InputContainer>
            <Select
              data={chainData}
              value={source.chainId}
              onChange={(e) => handleChainChange(e, true)}
              label="Source Chain"
            />
          </InputContainer>

          {(isNamadaSource || isMetamaskConnected) && (
            <>
              <InputContainer>
                <Select
                  data={tokenData}
                  value={token}
                  label="Token"
                  onChange={(e) => {
                    setToken(e.target.value);
                  }}
                />
              </InputContainer>

              <InputContainer>
                <Select
                  data={chainData}
                  value={destination.chainId}
                  onChange={(e) => handleChainChange(e, false)}
                  label="Destination Chain"
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
            </>
          )}
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
          </FeeSection>
        )}

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
    </>
  );
};
