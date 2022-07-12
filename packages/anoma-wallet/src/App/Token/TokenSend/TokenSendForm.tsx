import { useEffect, useState } from "react";
import QrReader from "react-qr-reader";

import Config from "config";
import { Tokens } from "constants/";
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

import { Button, ButtonVariant } from "components/Button";
import { Input, InputVariants } from "components/Input";

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
//import { Icon, IconName } from "components/Icon";
import { Address } from "../Transfers/TransferDetails.components";
import { parseTarget } from "./TokenSend";
import { SettingsState } from "slices/settings";

type Props = {
  accountId: string;
  defaultTarget?: string;
};

export const MAX_MEMO_LENGTH = 100;
export const isMemoValid = (text: string): boolean => {
  // TODO: Additional memo validation rules?
  return text.length < MAX_MEMO_LENGTH;
};

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
const getIsFormInvalid = (
  target: string | undefined,
  amount: number,
  balance: number,
  memo: string,
  isTargetValid: boolean,
  isTransferSubmitting: boolean
): boolean => {
  return (
    target === "" ||
    isNaN(amount) ||
    amount > balance ||
    amount === 0 ||
    !isMemoValid(memo) ||
    !isTargetValid ||
    isTransferSubmitting
  );
};

/**
 * gives the description above submit button to make it move obvious for the user
 * that the transfer might be a shielding/unshielding transfer
 */
const AccountSourceTargetDescription = (props: {
  isShieldedSource: boolean;
  isShieldedTarget: boolean;
}): React.ReactElement => {
  const { isShieldedSource, isShieldedTarget } = props;
  const source = isShieldedSource ? <b>Shielded</b> : <b>Transparent</b>;
  const target = isShieldedTarget ? <b>Shielded</b> : <b>Transparent</b>;
  return (
    <>
      {source} → {target}
    </>
  );
};

const TokenSendForm = ({ accountId, defaultTarget }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);
  const [showQrReader, setShowQrReader] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string>();

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const derivedAccounts = derived[chainId] || {};

  const { isTransferSubmitting, transferError, events } =
    useAppSelector<TransfersState>((state) => state.transfers);

  const transparentAndShieldedAccounts = {
    ...derivedAccounts,
    ...(shieldedAccounts[chainId] || {}),
  };
  const account = transparentAndShieldedAccounts[accountId] || {};
  const isShieldedSource = account.shieldedKeysAndPaymentAddress ? true : false;
  const { alias, establishedAddress = "", tokenType, balance = 0 } = account;
  const token = Tokens[tokenType] || {};

  const isFormInvalid = getIsFormInvalid(
    target,
    amount,
    balance,
    memo,
    isTargetValid,
    isTransferSubmitting
  );

  const chainConfig = Config.chain[chainId];
  const { url, port, protocol } = chainConfig.network;
  const rpcClient = new RpcClient({ url, port, protocol });
  const accountSourceTargetDescription = isFormInvalid ? (
    ""
  ) : (
    <AccountSourceTargetDescription
      isShieldedSource={isShieldedSource}
      isShieldedTarget={isShieldedTarget}
    />
  );

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
        // if the target is PaymentAddress, we toggle the transfer to shielded
        // TODO: take care of all case
        const transferTypeBasedOnAddress = parseTarget(target);
        if (transferTypeBasedOnAddress === TransferType.Shielded) {
          setIsShieldedTarget(true);
          setIsTargetValid(true);
          return;
        } else if (transferTypeBasedOnAddress === TransferType.NonShielded) {
          setIsShieldedTarget(false);
        } else {
          setIsShieldedTarget(false);
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
    if ((isShieldedTarget && target) || (target && token.address)) {
      dispatch(
        submitTransferTransaction({
          chainId,
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
              label="Target address"
              onChangeCallback={(e) => {
                const { value } = e.target;
                setTarget(value);
              }}
              value={target}
              error={isTargetValid ? undefined : "Target is invalid"}
            />
            {/*<Button
              variant={ButtonVariant.Small}
              onClick={() => setShowQrReader(!showQrReader)}
            >
              <Icon iconName={IconName.Camera} />
            </Button>*/}
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
            error={isAmountValid(amount, balance, target)}
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
        <InputContainer>{accountSourceTargetDescription}</InputContainer>
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
          disabled={isFormInvalid}
          onClick={handleOnSendClick}
        >
          Send
        </Button>
      </ButtonsContainer>
    </>
  );
};

export default TokenSendForm;
