import { useEffect, useState } from "react";
import QrReader from "react-qr-reader";

import { Config } from "config";
import { RpcClient } from "lib";
import {
  AccountsState,
  fetchBalanceByAccount,
  DerivedAccount,
} from "slices/accounts";
import {
  clearEvents,
  submitTransferTransaction,
  TransfersState,
  TransferType,
} from "slices/transfers";
import { useAppDispatch, useAppSelector } from "store";
import { Tokens } from "constants/";

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
import { parseTarget } from "./TokenSend";

const MAX_MEMO_LENGTH = 100;

type Props = {
  accountId: string;
  defaultTarget?: string;
};

const { network } = new Config();
const rpcClient = new RpcClient(network);

// if the transfer target is not TransferType.Shielded we perform the validation logic
const isAmountValid = (
  transferAmount: number,
  balance: number,
  targetAddress: string | undefined
): string | undefined => {
  const transferTypeBasedOnTarget = targetAddress && parseTarget(targetAddress);
  if (transferTypeBasedOnTarget === TransferType.Shielded) {
    return undefined;
  }
  return transferAmount <= balance ? undefined : "Invalid amount!";
};

const isMemoValid = (text: string): boolean => {
  // TODO: Additional memo validation rules?
  return text.length < MAX_MEMO_LENGTH;
};

/**
 * Validates the form for a correct data. This needs more after containing also the shielded transfers
 * Spend more time doing proper feedback for the user and priorities when the user has several issues
 * in the form
 *
 * @param target recipient of the transfer
 * @param amount amount to transfer, in format as the user sees it
 * @param balance - balance of user
 * @param memo - description for the payment
 * @param isTargetValid - pre-validated target, TODO: partly naive and likely better to call from within this function
 * @param isTransferSubmitting - a flag telling whether this transfer is currently on flight TODO,
 *                               should be outside of this so we can do more than just disable the button
 * @returns
 */
const isFormValid = (
  target: string | undefined,
  amount: number,
  balance: number,
  memo: string,
  isTargetValid: boolean,
  isTransferSubmitting: boolean
): boolean => {
  return (
    target === "" ||
    amount > balance ||
    amount === 0 ||
    !isMemoValid(memo) ||
    !isTargetValid ||
    isTransferSubmitting
  );
};

const TokenSendForm = ({ accountId, defaultTarget }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState<number>(0);
  const [memo, setMemo] = useState<string>("");

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShielded, setIsShielded] = useState(false);
  const [showQrReader, setShowQrReader] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string>();

  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const { isTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);

  const transparentAndShieldedAccounts = { ...derived, ...shieldedAccounts };
  const account = transparentAndShieldedAccounts[accountId] || {};
  const { alias, establishedAddress = "", tokenType, balance = 0 } = account;
  const token = Tokens[tokenType] || {};

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  useEffect(() => {
    // Get balance
    (async () => {
      if (establishedAddress && token.address) {
        dispatch(fetchBalanceByAccount(account));

        // Check for internal transfer targets, and update their balance if found:
        const targetAccount = Object.values(derived).find(
          (account: DerivedAccount) => account.establishedAddress === target
        );
        /// Fetch target balance if applicable:
        if (targetAccount) {
          dispatch(fetchBalanceByAccount(targetAccount));
        }
      }
    })();
  }, [establishedAddress, token.address, events]);

  useEffect(() => {
    // Validate target address
    (async () => {
      if (target) {
        // if the target is PaymentAddress, we toggle the transfer to shielded
        // TODO: take care of all case
        const transferTypeBasedOnAddress = parseTarget(target);
        if (transferTypeBasedOnAddress === TransferType.Shielded) {
          setIsShielded(true);
          setIsTargetValid(true);
          return;
        } else if (transferTypeBasedOnAddress === TransferType.NonShielded) {
          setIsShielded(false);
        } else {
          setIsShielded(false);
        }
        // we dont allow the funds to be sent to source address
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
    if ((isShielded && target) || (target && token.address)) {
      dispatch(
        submitTransferTransaction({
          account,
          target,
          amount,
          memo,
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
              label="Target address:"
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
            label="Amount:"
            value={amount}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setAmount(parseFloat(`${value}`));
            }}
            onFocus={handleFocus}
            error={isAmountValid(amount, balance, target)}
          />
        </InputContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Textarea}
            label="Memo:"
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
          disabled={isFormValid(
            target,
            amount,
            balance,
            memo,
            isTargetValid,
            isTransferSubmitting
          )}
          onClick={handleOnSendClick}
        >
          Send
        </Button>
      </ButtonsContainer>
    </>
  );
};

export default TokenSendForm;
