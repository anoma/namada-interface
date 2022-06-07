import { useEffect, useState } from "react";
import QrReader from "react-qr-reader";

import Config from "config";
import { Tokens } from "constants/";
import { RpcClient } from "lib";
import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import {
  clearEvents,
  submitTransferTransaction,
  TransfersState,
} from "slices/transfers";
import { DerivedAccount } from "slices/accounts";
import { SettingsState } from "slices/settings";

import { Button, ButtonVariant } from "components/Button";
import { Input, InputVariants } from "components/Input";
import { Label } from "components/Input/input.components";
import {
  ButtonsContainer,
  InputContainer,
  InputWithButtonContainer,
  QrReaderContainer,
  QrReaderError,
  StatusContainer,
  StatusMessage,
  TokenSendFormContainer,
} from "./TokenSendForm.components";
import { Toggle } from "components/Toggle";
import { Icon, IconName } from "components/Icon";
import { Address } from "../Transfers/TransferDetails.components";

type Props = {
  accountId: string;
  defaultTarget?: string;
};

export const MAX_MEMO_LENGTH = 100;
export const isMemoValid = (text: string): boolean => {
  // TODO: Additional memo validation rules?
  return text.length < MAX_MEMO_LENGTH;
};

const TokenSendForm = ({ accountId, defaultTarget }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShielded, setIsShielded] = useState(false);
  const [showQrReader, setShowQrReader] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string>();

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { isTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const derivedAccounts = derived[chainId] || {};

  const account = derivedAccounts[accountId] || {};
  const { alias, establishedAddress = "", tokenType, balance = 0 } = account;
  const token = Tokens[tokenType] || {};

  const chainConfig = Config.chain[chainId];
  const { url, port, protocol } = chainConfig.network;
  const rpcClient = new RpcClient({ url, port, protocol });

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  useEffect(() => {
    // Get balance
    if (establishedAddress && token.address) {
      dispatch(fetchBalanceByAccount(account));

      // Check for internal transfer:
      const targetAccount = Object.values(derivedAccounts).find(
        (account: DerivedAccount) => account.establishedAddress === target
      );
      // Fetch target balance if applicable:
      if (targetAccount) {
        dispatch(fetchBalanceByAccount(targetAccount));
      }
    }
  }, [establishedAddress, token.address, events]);

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

  useEffect(() => {
    return () => {
      dispatch(clearEvents());
    };
  }, []);

  const handleOnSendClick = (): void => {
    if (target && token.address) {
      dispatch(
        submitTransferTransaction({
          chainId,
          account,
          target,
          amount,
          memo,
          shielded: isShielded,
        })
      );
    }
  };

  const handleOnScan = (data: string | null): void => {
    if (data && data.match(/\/token\/send/)) {
      const parts = data.split("/");
      const target = parts.pop();
      const token = parts.pop();

      if (token !== tokenType) {
        setQrCodeError("Invalid token for target address!");
        return;
      }
      setQrCodeError(undefined);
      setTarget(target);
      setShowQrReader(false);
    }
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
          <InputWithButtonContainer>
            <Input
              variant={InputVariants.Text}
              label="Target address"
              onChangeCallback={(e) => {
                const { value } = e.target;
                setTarget(value);
              }}
              value={target}
              error={isTargetValid ? undefined : "Target is invalid"}
            />
            <Button
              variant={ButtonVariant.Small}
              onClick={() => setShowQrReader(!showQrReader)}
            >
              <Icon iconName={IconName.Camera} />
            </Button>
          </InputWithButtonContainer>
          {showQrReader && (
            <QrReaderContainer>
              {qrCodeError && <QrReaderError>{qrCodeError}</QrReaderError>}
              <QrReader
                onScan={handleOnScan}
                onError={(e: string) => setQrCodeError(e)}
              />
            </QrReaderContainer>
          )}
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
        <InputContainer>
          <Input
            variant={InputVariants.Textarea}
            label="Memo (Optional)"
            value={memo}
            error={
              isMemoValid(memo)
                ? ""
                : `Must be less than ${MAX_MEMO_LENGTH} characters`
            }
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
        {transferError && <StatusMessage>{transferError}</StatusMessage>}
        {isTransferSubmitting && (
          <StatusMessage>Submitting transfer</StatusMessage>
        )}
        {events && (
          <>
            <StatusMessage>Transfer successful!</StatusMessage>
            <StatusMessage>Gas used: {events.gas}</StatusMessage>
            <StatusMessage>Applied hash:</StatusMessage>
            <Address>{events.appliedHash}</Address>
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
            isTransferSubmitting
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
