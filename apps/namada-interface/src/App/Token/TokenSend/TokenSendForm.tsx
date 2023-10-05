import { useEffect, useState, useContext, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";
import QrReader from "react-qr-reader";
import BigNumber from "bignumber.js";

import { getIntegration } from "@namada/hooks";
import { Signer, Tokens, TokenType } from "@namada/types";
import { ColorMode, DesignConfiguration } from "@namada/utils";
import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Input,
  InputVariants,
} from "@namada/components";

import { AccountsState } from "slices/accounts";
import { CoinsState } from "slices/coins";
import { useAppSelector } from "store";

import {
  BackButton,
  ButtonsContainer,
  GasButtonsContainer,
  InputContainer,
  QrReaderContainer,
  QrReaderError,
  TokenSendFormContainer,
} from "./TokenSendForm.components";
import { parseTarget } from "./TokenSend";
import { SettingsState } from "slices/settings";
import { TopLevelRoute } from "App/types";
import { TransferType, TxTransferArgs } from "../types";

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

export const submitTransferTransaction = async (
  txTransferArgs: TxTransferArgs
): Promise<void> => {
  const {
    account: { address, chainId, publicKey, type },
    amount,
    faucet,
    target,
    token,
  } = txTransferArgs;
  const integration = getIntegration(chainId);
  const signer = integration.signer() as Signer;

  const transferArgs = {
    source: faucet || address,
    target,
    token: Tokens[token].address || Tokens.NAM.address || "",
    amount,
    nativeToken: Tokens.NAM.address || "",
  };

  const txArgs = {
    token: Tokens.NAM.address || "",
    feeAmount: new BigNumber(0),
    gasLimit: new BigNumber(20_000),
    chainId,
    publicKey: publicKey,
    signer: faucet ? target : undefined,
  };

  await signer.submitTransfer(transferArgs, txArgs, type);
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
 * @returns
 */
const getIsFormInvalid = (
  target: string | undefined,
  amount: BigNumber,
  balance: BigNumber,
  isTargetValid: boolean
): boolean => {
  return (
    target === "" ||
    amount.isNaN() ||
    amount.isGreaterThan(balance) ||
    amount.isEqualTo(0) ||
    !isTargetValid
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
  const themeContext = useContext(ThemeContext);
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);
  const [showQrReader, setShowQrReader] = useState(false);
  const [qrCodeError, setQrCodeError] = useState<string>();

  // TODO: This will likely be calculated per token, as any one of these numbers
  // will be difference for each token specified:
  enum GasFee {
    "Low" = "0.0001",
    "Medium" = "0.0005",
    "High" = "0.001",
  }

  const [gasFee, setGasFee] = useState<GasFee>(GasFee.Medium);

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const { rates } = useAppSelector<CoinsState>((state) => state.coins);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const derivedAccounts = derived[chainId];

  const { details, balance } = derivedAccounts[address];
  const isShieldedSource = details.isShielded;
  const token = Tokens[tokenType];

  const isFormInvalid = getIsFormInvalid(
    target,
    amount,
    balance[tokenType] || new BigNumber(0),
    isTargetValid
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

  const getFiatForCurrency = (feeString: string): BigNumber => {
    const fee = new BigNumber(feeString);
    const rate =
      rates[tokenType] && rates[tokenType][fiatCurrency]
        ? rates[tokenType][fiatCurrency].rate
        : 1;
    return fee.multipliedBy(rate).decimalPlaces(5);
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
        } else if (transferTypeBasedOnAddress === TransferType.Transparent) {
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

  const handleOnSendClick = (): void => {
    if ((isShieldedTarget && target) || (target && token.address)) {
      submitTransferTransaction({
        chainId,
        account: details,
        target,
        amount,
        token: tokenType,
        feeAmount: new BigNumber(gasFee),
      });
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
    transferAmount: BigNumber,
    targetAddress: string | undefined
  ): string | undefined => {
    const balance = derivedAccounts[address].balance[token] || 0;

    const transferTypeBasedOnTarget =
      targetAddress && parseTarget(targetAddress);

    if (transferTypeBasedOnTarget === TransferType.Shielded) {
      return undefined;
    }
    return transferAmount.isLessThanOrEqualTo(balance)
      ? undefined
      : "Invalid amount!";
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
            value={amount.toString()}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setAmount(new BigNumber(`${value}`));
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
              &lt; {gasFees[GasFee.Low].fiat.toString()} {fiatCurrency}
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
              &lt; {gasFees[GasFee.Medium].fiat.toString()} {fiatCurrency}
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
              &lt; {gasFees[GasFee.High].fiat.toString()} {fiatCurrency}
            </p>
          </Button>
        </GasButtonsContainer>
      </TokenSendFormContainer>

      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
        <Button
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
