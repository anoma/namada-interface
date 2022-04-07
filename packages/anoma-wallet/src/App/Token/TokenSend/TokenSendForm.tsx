import { useEffect, useState } from "react";

import { Config } from "config";
import { RpcClient, SocketClient, Transfer } from "lib";
import { NewBlockEvents, SubscriptionEvents } from "lib/rpc/types";
import { addTransaction } from "slices";
import { AccountsState, fetchBalanceByAddress } from "slices/accounts";
import { useAppDispatch, useAppSelector } from "store";
import { amountFromMicro } from "utils/helpers";
import { Tokens, TxResponse } from "constants/";

import { Button, ButtonVariant } from "components/Button";
import { Input, InputVariants } from "components/Input";
import { Label } from "components/Input/input.components";
import {
  ButtonsContainer,
  InputContainer,
  StatusContainer,
  StatusMessage,
  TokenSendFormContainer,
} from "./TokenSendForm.components";
import { Toggle } from "components/Toggle";
import { Address } from "../Transfers/TransferDetails.components";

type Props = {
  accountId: string;
  defaultTarget?: string;
};

const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

const TokenSendForm = ({ accountId, defaultTarget }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState<number>(0);
  const [memo, setMemo] = useState<string>("");
  const [status, setStatus] = useState<string>();
  const [events, setEvents] = useState<
    { gas: number; hash: string } | undefined
  >();
  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShielded, setIsShielded] = useState(false);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const account = derived[accountId] || {};
  const {
    id,
    alias,
    establishedAddress = "",
    tokenType,
    balance = 0,
  } = account;
  const token = Tokens[tokenType] || {};

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  useEffect(() => {
    // Get balance
    (async () => {
      if (establishedAddress && token.address) {
        dispatch(fetchBalanceByAddress(account));
      }
    })();
  }, [establishedAddress, token.address]);

  useEffect(() => {
    // Validate target address
    (async () => {
      if (target) {
        if (target === establishedAddress) {
          setIsTargetValid(false);
        } else {
          const isValid = await rpcClient.isKnownAddress(target);
          setIsTargetValid(isValid);
        }
      }
    })();
  }, [target]);

  const handleOnSendClick = async (): Promise<void> => {
    if (target && token.address) {
      setStatus("Submitting token transfer");
      setIsSubmitting(true);

      const epoch = await rpcClient.queryEpoch();
      const transfer = await new Transfer().init();
      const { hash: txHash, bytes } = await transfer.makeTransfer({
        source: establishedAddress,
        target,
        token: token.address,
        amount,
        epoch,
        privateKey: account.signingKey,
      });

      socketClient.broadcastTx(txHash, bytes, {
        onBroadcast: () => {
          setStatus("Successfully connected to ledger");
        },
        onNext: async (subEvent) => {
          const { events }: { events: NewBlockEvents } =
            subEvent as SubscriptionEvents;

          const gas = parseInt(events[TxResponse.GasUsed][0]);
          const appliedHash = events[TxResponse.Hash][0];

          // Check to see if this is an internal transfer, and update balances
          // accordingly if so:
          const targetAccount = Object.values(derived).find(
            (account) => account.establishedAddress === target
          );
          if (targetAccount) {
            dispatch(fetchBalanceByAddress(targetAccount));
          }
          dispatch(fetchBalanceByAddress(account));

          setAmount(0);
          setIsSubmitting(false);
          dispatch(
            addTransaction({
              id,
              appliedHash,
              tokenType,
              target,
              amount,
              memo,
              shielded: isShielded,
              gas,
              timestamp: new Date().getTime(),
            })
          );
          setStatus(`Successfully transferred ${amount} of ${token.symbol}!`);
          setEvents({
            gas,
            hash: appliedHash,
          });
          socketClient.disconnect();
        },
      });
    }
  };

  const isMemoValid = (text: string): boolean => {
    return text.length < 100;
  };

  return (
    <>
      <TokenSendFormContainer>
        <p>
          {alias} ({tokenType})
        </p>
        <p>
          Balance: <strong>{balance}</strong>
        </p>
        <InputContainer>
          <Input
            variant={InputVariants.Text}
            label="Target address:"
            onChangeCallback={(e) => {
              const { value } = e.target;
              setTarget(value);
            }}
            value={target}
            error={isTargetValid ? undefined : "Target is invalid"}
          />
        </InputContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Number}
            label="Amount:"
            value={amount}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setAmount(parseFloat(`${value}`));
            }}
            onFocus={handleFocus}
            error={amount <= balance ? undefined : "Invalid amount!"}
          />
        </InputContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Textarea}
            label="Memo:"
            value={memo}
            error={isMemoValid(memo) ? "" : "Must be less than 100 characters"}
            onChangeCallback={(e) => setMemo(e.target.value)}
          />
        </InputContainer>
        <InputContainer>
          <Label>Shielded?</Label>
          <Toggle
            onClick={() => setIsShielded(!isShielded)}
            checked={isShielded}
          />
          {isShielded && (
            <p>Transaction will be executed in the shielded pool</p>
          )}
        </InputContainer>
      </TokenSendFormContainer>

      <StatusContainer>
        {status && <StatusMessage>{status}</StatusMessage>}
        {events && (
          <>
            <StatusMessage>
              Gas used: <strong>{amountFromMicro(events.gas)}</strong>
              <br />
              Applied hash:
            </StatusMessage>
            <Address>{events.hash}</Address>
          </>
        )}
      </StatusContainer>

      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          disabled={
            amount > balance ||
            target === "" ||
            amount === 0 ||
            !isMemoValid(memo) ||
            !isTargetValid ||
            isSubmitting
          }
          onClick={handleOnSendClick}
        >
          Send
        </Button>
      </ButtonsContainer>
    </>
  );
};

export default TokenSendForm;
