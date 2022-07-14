import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { addChannel, ChannelsState } from "slices/channels";
import {
  clearErrors,
  clearEvents,
  submitIbcTransferTransaction,
  TransfersState,
} from "slices/transfers";
import { SettingsState } from "slices/settings";

import { Input, InputVariants } from "components/Input";
import {
  ButtonsContainer,
  InputContainer,
  StatusMessage,
} from "../TokenSend/TokenSendForm.components";
import {
  AddChannelButton,
  IBCTransferFormContainer,
} from "./IBCTransfer.components";
import { Option, Select } from "components/Select";
import { Icon, IconName } from "components/Icon";
import { Button, ButtonVariant } from "components/Button";
import { Address } from "../Transfers/TransferDetails.components";
import Config from "config";
import { Symbols, Tokens, TokenType } from "constants/";
import { BalancesState, fetchBalances } from "slices/balances";

const IBCTransfer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const balancesByChain = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const balances = balancesByChain[chainId] || {};
  const { channelsByChain = {} } = useAppSelector<ChannelsState>(
    (state) => state.channels
  );
  const { isIbcTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);

  const chains = Config.chain;
  const chain = chains[chainId];
  const { ibc = [] } = chain;

  const defaultIbcChain = chains[ibc[0]] || null;
  const [selectedChainId, setSelectedChainId] = useState(
    defaultIbcChain ? defaultIbcChain.id : ""
  );

  const selectDestinationChainData = ibc.map((chainId) => ({
    value: chainId,
    label: chains[chainId].alias,
  }));

  const channels = (channelsByChain[selectedChainId] || []).sort();
  const selectChannelsData = channels.map((channel: string) => ({
    value: channel,
    label: channel,
  }));

  const [amount, setAmount] = useState(0);
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [channelId, setChannelId] = useState<string>();
  const [recipient, setRecipient] = useState("");

  const derivedAccounts = derived[chainId] || {};
  const account = Object.values(derivedAccounts)[0] || {};
  const [selectedAccountId, setSelectedAccountId] = useState(account.id || "");

  type AccountTokenData = {
    id: string;
    alias: string;
    balance: number;
    tokenType: TokenType;
  };

  const tokenBalances = Object.values(derivedAccounts).reduce(
    (data: AccountTokenData[], account) => {
      const { id, alias } = account;

      const accountsWithId = Symbols.map((symbol) => {
        const balance = (balances[id] || {})[symbol] || 0;

        return {
          id,
          alias,
          tokenType: symbol,
          balance,
        };
      });

      return [...data, ...accountsWithId];
    },
    []
  );

  const tokenData: Option<string>[] = tokenBalances
    .filter((account) => account.balance > 0)
    .map((account) => {
      const { id, alias, tokenType, balance } = account;
      const token = Tokens[tokenType];
      const { coin } = token;

      return {
        value: `${id}|${tokenType}`,
        label: `${
          alias !== "Namada" ? alias + " - " : ""
        }${coin} (${balance} ${tokenType})`,
      };
    });

  const { balance = 0, tokenType } = derivedAccounts[selectedAccountId] || {};
  const [token, setToken] = useState<TokenType>(tokenType);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const { portId = "transfer" } = defaultIbcChain;

  useEffect(() => {
    return () => {
      dispatch(clearEvents());
      dispatch(clearErrors());
    };
  }, []);

  useEffect(() => {
    const { ibc = [] } = chains[chainId];
    if (ibc.length > 0) {
      const selectedChain = ibc[0];
      setSelectedChainId(selectedChain);
    }
    dispatch(
      fetchBalances({
        chainId,
        accounts: Object.values(derivedAccounts),
      })
    );
  }, [chainId]);

  useEffect(() => {
    if (account && !isIbcTransferSubmitting) {
      dispatch(fetchBalanceByAccount(account));
    }
  }, [isIbcTransferSubmitting]);

  useEffect(() => {
    // Set a default selectedChannelId if none are selected, but channels are available
    if (selectedChainId && !selectedChannelId) {
      const channels = channelsByChain[selectedChainId];
      if (channels && channels.length > 0) {
        setSelectedChannelId(channels[0]);
      }
    }
  }, [selectedChainId, channelsByChain]);

  const handleAddChannel = (): void => {
    if (channelId) {
      dispatch(
        addChannel({
          chainId: selectedChainId,
          channelId,
        })
      );
      setShowAddChannelForm(false);
      setSelectedChannelId(channelId);
      setChannelId("");
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;

    const [accountId, tokenSymbol] = value.split("|");

    setSelectedAccountId(accountId);
    setToken(tokenSymbol as TokenType);
  };

  const handleSubmit = (): void => {
    dispatch(
      submitIbcTransferTransaction({
        account,
        token,
        amount,
        chainId,
        target: recipient,
        channelId: selectedChannelId,
        portId,
      })
    );
  };

  return (
    <IBCTransferFormContainer>
      <Select
        data={tokenData}
        value={`${selectedAccountId}|${token}`}
        label="Token:"
        onChange={handleTokenChange}
      />
      <InputContainer>
        <Select<string>
          data={selectDestinationChainData}
          value={selectedChainId}
          label="Destination Chain"
          onChange={(e) => setSelectedChainId(e.target.value)}
        />
      </InputContainer>
      <InputContainer>
        {channels.length > 0 && (
          <Select<string>
            data={selectChannelsData}
            value={selectedChannelId}
            label="IBC Transfer Channel"
            onChange={(e) => setSelectedChannelId(e.target.value)}
          />
        )}

        {!showAddChannelForm && (
          <AddChannelButton onClick={() => setShowAddChannelForm(true)}>
            <Icon iconName={IconName.Plus} />
            <span>Add IBC Transfer Channel</span>
          </AddChannelButton>
        )}
      </InputContainer>

      {showAddChannelForm && (
        <InputContainer>
          <Input
            variant={InputVariants.Text}
            label="Add Channel ID"
            value={channelId}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setChannelId(value);
            }}
            onFocus={handleFocus}
            error={amount <= balance ? undefined : "Invalid amount!"}
          />
          <Button
            variant={ButtonVariant.Contained}
            style={{ width: 160 }}
            onClick={handleAddChannel}
            disabled={!channelId}
          >
            Add
          </Button>
          <Button
            variant={ButtonVariant.Contained}
            style={{ width: 160 }}
            onClick={() => setShowAddChannelForm(false)}
          >
            Cancel
          </Button>
        </InputContainer>
      )}

      <InputContainer>
        <Input
          variant={InputVariants.Text}
          label="Recipient"
          value={recipient}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setRecipient(value);
          }}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Number}
          label="Amount"
          value={amount}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setAmount(parseFloat(`${value}`));
          }}
          onFocus={handleFocus}
          error={amount <= balance ? undefined : "Invalid amount!"}
        />
      </InputContainer>

      {isIbcTransferSubmitting && <p>Submitting IBC Transfer</p>}
      {transferError && <pre style={{ overflow: "auto" }}>{transferError}</pre>}
      {events && (
        <>
          <StatusMessage>
            Successfully submitted IBC transfer! It will take some time for the
            receiver to see an updated balance.
          </StatusMessage>
          <StatusMessage>Gas used: {events.gas}</StatusMessage>
          <StatusMessage>Applied hash:</StatusMessage>
          <Address>{events.appliedHash}</Address>
        </>
      )}
      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          disabled={
            amount > balance ||
            amount === 0 ||
            !recipient ||
            isIbcTransferSubmitting ||
            !selectedChannelId
          }
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </ButtonsContainer>
    </IBCTransferFormContainer>
  );
};

export default IBCTransfer;
