import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BigNumber from "bignumber.js";

import { getIntegration } from "@namada/hooks";
import { Signer, Tokens, TokenType } from "@namada/types";
import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Input,
  InputVariants,
  BigNumberInput,
} from "@namada/components";

import { AccountsState } from "slices/accounts";
import { CoinsState } from "slices/coins";
import { useAppSelector } from "store";

import {
  BackButton,
  ButtonsContainer,
  InputContainer,
  TokenSendFormContainer,
} from "./TokenSendForm.components";
import { parseTarget } from "./TokenSend";
import { SettingsState } from "slices/settings";
import { TopLevelRoute } from "App/types";
import { TransferType, TxTransferArgs } from "../types";

const GAS_LIMIT = new BigNumber(20_000);

export const submitTransferTransaction = async (
  txTransferArgs: TxTransferArgs,
  isShieldedTransfer: boolean,
): Promise<void> => {
  const {
    account: { address, chainId, publicKey, type },
    amount,
    faucet,
    target,
    token,
    gasPrice,
    gasLimit,
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
    gasPrice,
    gasLimit: gasLimit || new BigNumber(GAS_LIMIT),
    chainId,
    publicKey: publicKey,
    signer: faucet ? target : undefined,
    disposableGasPayer: isShieldedTransfer
  };

  await signer.submitTransfer(transferArgs, txArgs, type);
};

type Props = {
  address: string;
  defaultTarget?: string;
  tokenType: TokenType;
  minimumGasPrice: BigNumber;
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
  amount: BigNumber | undefined,
  balance: BigNumber,
  isTargetValid: boolean
): boolean => {
  return (
    target === "" ||
    !amount ||
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
  minimumGasPrice,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState<BigNumber>();

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);

  // TODO: Expecting that these could be set by the user in the future
  const gasPrice = minimumGasPrice;
  const gasLimit = GAS_LIMIT;

  const gasFee = gasPrice.multipliedBy(gasLimit);

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

  const fiatRate = rates[tokenType] && rates[tokenType][fiatCurrency]
    ? rates[tokenType][fiatCurrency].rate
    : 1;
  const gasFeeInFiat = gasFee.multipliedBy(fiatRate).decimalPlaces(5);

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
    if (!amount) {
      return;
    }

    if ((isShieldedTarget && target) || (target && token.address)) {
      submitTransferTransaction({
        chainId,
        account: details,
        target,
        amount,
        token: tokenType,
        gasPrice: new BigNumber(gasPrice),
      }, isShieldedSource);
    }
  };

  // if the transfer target is not TransferType.Shielded we perform the validation logic
  const isAmountValid = (
    address: string,
    token: TokenType,
    transferAmount: BigNumber | undefined,
    targetAddress: string | undefined,
    gasFee: BigNumber,
  ): string | undefined => {
    if (!transferAmount) {
      return undefined;
    }

    const balance = derivedAccounts[address].balance[token] || new BigNumber(0);

    const transferTypeBasedOnTarget =
      targetAddress && parseTarget(targetAddress);

    if (transferTypeBasedOnTarget === TransferType.Shielded) {
      return undefined;
    }
    return transferAmount.isLessThanOrEqualTo(balance.minus(gasFee))
      ? undefined
      : "Invalid amount!";
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
        </InputContainer>
        <InputContainer>
          <BigNumberInput
            label={"Amount"}
            value={amount}
            onChange={(e) => {
              const { value } = e.target;
              setAmount(value);
            }}
            onFocus={handleFocus}
            error={isAmountValid(address, tokenType, amount, target, gasFee)}
          />
        </InputContainer>
        <InputContainer>
          Transaction fee: {gasFee.toString()} NAM
          = {gasFeeInFiat.toString()} {fiatCurrency}
        </InputContainer>
        <InputContainer>{accountSourceTargetDescription}</InputContainer>
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
