import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { chains } from "@namada/chains";
import { ActionButton, AmountInput, Icon, Input } from "@namada/components";
import { getIntegration } from "@namada/integrations";
import { Chain, Signer, TokenType, Tokens } from "@namada/types";

import { TopLevelRoute } from "App/types";
import { AccountsState } from "slices/accounts";
import { GAS_LIMIT } from "slices/fees";
import { useAppSelector } from "store";
import { TransferType, TxTransferArgs } from "../types";
import { parseTarget } from "./TokenSend";
import {
  BackButton,
  ButtonsContainer,
  InputContainer,
  TokenSendFormContainer,
} from "./TokenSendForm.components";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export const submitTransferTransaction = async (
  txTransferArgs: TxTransferArgs
): Promise<void> => {
  const {
    account: { address, publicKey, type },
    amount,
    chainId,
    target,
    token: _, // TODO: Re-enable
    disposableSigningKey,
    feeAmount,
    gasLimit,
    memo,
    nativeToken,
  } = txTransferArgs;

  if (!feeAmount || !gasLimit) {
    return;
  }

  const integration = getIntegration(chains.namada.id);
  const signer = integration.signer() as Signer;

  const transferArgs = {
    source: address,
    target,
    token: nativeToken, // TODO: Update to support other tokens again!
    amount,
    nativeToken,
  };

  const txArgs = {
    token: nativeToken, // TODO: Update to support other tokens again!
    nativeToken,
    feeAmount,
    gasLimit,
    chainId,
    publicKey: publicKey,
    signer: undefined,
    disposableSigningKey,
    memo,
  };

  await signer.submitTransfer(transferArgs, txArgs, type);
};

type Props = {
  address: string;
  defaultTarget?: string;
  tokenType: TokenType;
  minimumGasPrice: BigNumber;
  isRevealPkNeededFn: (address: string) => boolean;
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
    amount === undefined ||
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
  isRevealPkNeededFn,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const chain = useAppSelector<Chain>((state) => state.chain.config);
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState<BigNumber | undefined>(new BigNumber(0));
  const [memo, setMemo] = useState<string>();

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const derivedAccounts = derived[chains.namada.id];

  const { details, balance } = derivedAccounts[address];
  const isShieldedSource = details.isShielded;

  const token = Tokens[tokenType];

  // TODO: Expecting that these could be set by the user in the future
  const gasPrice = minimumGasPrice;
  const gasLimit = GAS_LIMIT;

  const singleTransferFee = gasPrice.multipliedBy(gasLimit);

  const isRevealPkNeeded = !isShieldedSource && isRevealPkNeededFn(address);

  const totalGasFee = isRevealPkNeeded
    ? singleTransferFee.multipliedBy(2)
    : singleTransferFee;

  const availableBalance = balance[tokenType]?.minus(totalGasFee);

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
    if (!amount || amount.isNaN() || totalGasFee === undefined) {
      return;
    }

    if ((isShieldedTarget && target) || (target && token.address)) {
      submitTransferTransaction({
        account: details,
        chainId: chain.chainId,
        target,
        amount,
        token: tokenType,
        feeAmount: gasPrice,
        gasLimit,
        disposableSigningKey: isShieldedSource,
        memo,
        nativeToken: chain.currency.address || tokenAddress,
      });
    }
  };

  const handleMaxButtonClick = (): void => {
    setAmount(availableBalance);
  };

  // if the transfer target is not TransferType.Shielded we perform the validation logic
  const isAmountValid = (
    address: string,
    token: TokenType,
    transferAmount: BigNumber,
    targetAddress: string | undefined
  ): string | undefined => {
    const transferTypeBasedOnTarget =
      targetAddress && parseTarget(targetAddress);

    if (transferTypeBasedOnTarget === TransferType.Shielded) {
      return undefined;
    }
    if (!availableBalance) {
      return "Invalid";
    }
    return transferAmount.isLessThanOrEqualTo(availableBalance)
      ? undefined
      : "Invalid amount!";
  };

  return (
    <>
      <TokenSendFormContainer>
        <InputContainer>
          <Input
            label={"Recipient"}
            onChange={(e) => {
              const { value } = e.target;
              setTarget(value);
            }}
            value={target}
            error={isTargetValid ? undefined : "Target is invalid"}
          />
        </InputContainer>
        <InputContainer>
          <AmountInput
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            onFocus={handleFocus}
            error={amount && isAmountValid(address, tokenType, amount, target)}
          />
          <ActionButton
            disabled={isRevealPkNeeded === undefined}
            onClick={handleMaxButtonClick}
          >
            Max
          </ActionButton>
        </InputContainer>
        <InputContainer>
          <Input
            type="text"
            label="Memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </InputContainer>
        <InputContainer>{accountSourceTargetDescription}</InputContainer>
        <p>
          Gas fee: {totalGasFee?.toString()} {Tokens.NAM.symbol}
        </p>
      </TokenSendFormContainer>

      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon name="ChevronLeft" />
        </BackButton>
        <ActionButton disabled={isFormInvalid} onClick={handleOnSendClick}>
          Continue
        </ActionButton>
      </ButtonsContainer>
    </>
  );
};

export default TokenSendForm;
