import { useEffect, useState, useContext, CSSProperties } from "react";
import { ThemeContext } from "styled-components";
import QrReader from "react-qr-reader";

import { Account } from "@anoma/types";
import { Tokens, TokenType } from "@anoma/tx";
import { AccountsState } from "slices/accounts";
import {
  clearEvents,
  submitTransferTransaction,
  actionTypes,
  TransfersState,
  TransferType,
} from "slices/transfers";
import { BalancesState } from "slices/balances";
import { CoinsState } from "slices/coins";
import { useAppDispatch, useAppSelector } from "store";

import { Button, ButtonVariant } from "components/Button";
import { Input, InputVariants } from "components/Input";

import {
  BackButton,
  ButtonsContainer,
  GasButtonsContainer,
  InputContainer,
  QrReaderContainer,
  QrReaderError,
  StatusContainer,
  StatusMessage,
  TokenSendFormContainer,
} from "./TokenSendForm.components";
import { parseTarget } from "./TokenSend";
import { SettingsState } from "slices/settings";
import { Icon, IconName } from "components/Icon";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "App/types";
import { ColorMode, DesignConfiguration } from "utils/theme";

enum ComponentColor {
  GasButtonBorder,
  GasButtonBorderActive,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.GasButtonBorder]: theme.colors.secondary.main,
      [ComponentColor.GasButtonBorderActive]: theme.colors.secondary.main,
    },
    dark: {
      [ComponentColor.GasButtonBorder]: theme.colors.primary.main,
      [ComponentColor.GasButtonBorderActive]: theme.colors.primary.main,
    },
  };

  return colorMap[colorMode][color];
};

type Props = {
  address: string;
  defaultTarget?: string;
  tokenType: TokenType;
};

/**
 * Validates the form for a correct data. This needs more after containing also the shielded transfers
 * Spend more time doing proper feedback for the user and priorities when the user has several issues
 * in the form
 *
 * @param target recipient of the transfer
 * @param amount amount to transfer, in format as the user sees it
 * @param balance - balance of user
 * @param isTargetValid - pre-validated target, TODO: partly naive and likely better to call from within this function
 * @param isTransferSubmitting - a flag telling whether this transfer is currently on flight TODO,
 *                               should be outside of this so we can do more than just disable the button
 * @returns
 */
const getIsFormInvalid = (
  target: string | undefined,
  amount: number,
  balance: number,
  isTargetValid: boolean,
  isTransferSubmitting: boolean
): boolean => {
  return (
    target === "" ||
    isNaN(amount) ||
    amount > balance ||
    amount === 0 ||
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

const TokenSendForm = ({
  address,
  tokenType,
  defaultTarget,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const themeContext = useContext(ThemeContext);
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState(0);

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);
  const [showQrReader, setShowQrReader] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string>();

  // TODO: This will likely be calculated per token, as any one of these numbers
  // will be difference for each token specified:
  enum GasFee {
    "Low" = 0.0001,
    "Medium" = 0.0005,
    "High" = 0.001,
  }

  const [gasFee, setGasFee] = useState<GasFee>(GasFee.Medium);

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const { rates } = useAppSelector<CoinsState>((state) => state.coins);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const derivedAccounts = derived[chainId] || {};

  const balancesState = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const balancesForChain = balancesState[chainId] || {};

  const isTransferSubmitting = useAppSelector<boolean>((state) =>
    state.notifications.pendingActions.includes(
      actionTypes.SUBMIT_TRANSFER_ACTION_TYPE
    )
  );

  const { transferError } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const account: Account = derivedAccounts[address];
  const isShieldedSource = account.isShielded;
  const token = Tokens[tokenType] || {};

  const balances = balancesForChain[address] || {};
  const balance = balances[tokenType] || 0;

  const isFormInvalid = getIsFormInvalid(
    target,
    amount,
    balance,
    isTargetValid,
    isTransferSubmitting
  );

  const accountSourceTargetDescription = isFormInvalid ? (
    ""
  ) : (
    <AccountSourceTargetDescription
      isShieldedSource={!!isShieldedSource}
      isShieldedTarget={isShieldedTarget}
    />
  );

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const getFiatForCurrency = (fee: number): number => {
    const rate =
      rates[tokenType] && rates[tokenType][fiatCurrency]
        ? rates[tokenType][fiatCurrency].rate
        : 1;
    return Math.ceil(fee * rate * 10000) / 10000;
  };

  const gasFees = {
    [GasFee.Low]: {
      fee: GasFee.Low,
      fiat: getFiatForCurrency(GasFee.Low),
    },
    [GasFee.Medium]: {
      fee: GasFee.Medium,
      fiat: getFiatForCurrency(GasFee.Medium),
    },
    [GasFee.High]: {
      fee: GasFee.High,
      fiat: getFiatForCurrency(GasFee.High),
    },
  };

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
        if (target === address) {
          setIsTargetValid(false);
        } else {
          // We can add any other methods of validation here.
          setIsTargetValid(true);
        }
      }
    })();
  }, [target]);

  useEffect(() => {
    return () => {
      dispatch(clearEvents());
    };
  }, []);

  useEffect(() => {
    if (isTransferSubmitting === false) {
      // Reset amount
      setAmount(0);
    }
  }, [isTransferSubmitting]);

  const handleOnSendClick = (): void => {
    if ((isShieldedTarget && target) || (target && token.address)) {
      dispatch(
        submitTransferTransaction({
          chainId,
          account,
          target,
          amount,
          token: tokenType,
          feeAmount: gasFee,
          notify: true,
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

  // if the transfer target is not TransferType.Shielded we perform the validation logic
  const isAmountValid = (
    address: string,
    token: TokenType,
    transferAmount: number,
    targetAddress: string | undefined
  ): string | undefined => {
    const balance = balancesForChain[address][token] || 0;

    const transferTypeBasedOnTarget =
      targetAddress && parseTarget(targetAddress);
    if (transferTypeBasedOnTarget === TransferType.Shielded) {
      return undefined;
    }
    return transferAmount <= balance ? undefined : "Invalid amount!";
  };

  // these are passed to button for the custom gas fee buttons
  const gasFeeButtonActiveStyleOverride: CSSProperties = {
    backgroundColor: themeContext.colors.utility1.main60,
    color: themeContext.colors.utility2.main,
    border: `solid 1px ${getColor(
      ComponentColor.GasButtonBorderActive,
      themeContext
    )}`,
  };
  const gasFeeButtonStyleOverride: CSSProperties = {
    backgroundColor: themeContext.colors.utility1.main70,
    color: themeContext.colors.utility2.main80,
  };

  return (
    <>
      <TokenSendFormContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Text}
            label={"Recipient"}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setTarget(value);
            }}
            value={target}
            error={isTargetValid ? undefined : "Target is invalid"}
          />

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
            label={"Amount"}
            value={amount}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setAmount(parseFloat(`${value}`));
            }}
            onFocus={handleFocus}
            error={isAmountValid(address, tokenType, amount, target)}
          />
        </InputContainer>
        <InputContainer>{accountSourceTargetDescription}</InputContainer>

        <GasButtonsContainer>
          <Button
            variant={ButtonVariant.Outlined}
            onClick={() => setGasFee(GasFee.Low)}
            style={
              gasFee === GasFee.Low
                ? gasFeeButtonActiveStyleOverride
                : gasFeeButtonStyleOverride
            }
            className={gasFee === GasFee.Low ? "active" : ""}
          >
            <p>
              <span>Low</span>
              <br />
              &lt; {gasFees[GasFee.Low].fee} {tokenType}
              <br />
              &lt; {gasFees[GasFee.Low].fiat} {fiatCurrency}
            </p>
          </Button>
          <Button
            variant={ButtonVariant.Outlined}
            onClick={() => setGasFee(GasFee.Medium)}
            style={
              gasFee === GasFee.Medium
                ? gasFeeButtonActiveStyleOverride
                : gasFeeButtonStyleOverride
            }
          >
            <p>
              <span>Medium</span>
              <br />
              &lt; {gasFees[GasFee.Medium].fee} {tokenType}
              <br />
              &lt; {gasFees[GasFee.Medium].fiat} {fiatCurrency}
            </p>
          </Button>
          <Button
            variant={ButtonVariant.Outlined}
            onClick={() => setGasFee(GasFee.High)}
            style={
              gasFee === GasFee.High
                ? gasFeeButtonActiveStyleOverride
                : gasFeeButtonStyleOverride
            }
          >
            <p>
              <span>High</span>
              <br />
              &lt; {gasFees[GasFee.High].fee} {tokenType}
              <br />
              &lt; {gasFees[GasFee.High].fiat} {fiatCurrency}
            </p>
          </Button>
        </GasButtonsContainer>
      </TokenSendFormContainer>

      <StatusContainer>
        {transferError && <StatusMessage>{transferError}</StatusMessage>}
      </StatusContainer>

      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
        <Button
          loading={isTransferSubmitting}
          variant={ButtonVariant.Contained}
          disabled={isFormInvalid}
          onClick={handleOnSendClick}
        >
          Continue
        </Button>
      </ButtonsContainer>
    </>
  );
};

export default TokenSendForm;
