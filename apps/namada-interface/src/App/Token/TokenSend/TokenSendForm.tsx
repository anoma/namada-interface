import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { chains } from "@namada/chains";
import { ActionButton, AmountInput, Icon, Input } from "@namada/components";
import { getIntegration } from "@namada/integrations";
import { Query } from "@namada/shared";
import { Chain, Signer, TokenType, Tokens } from "@namada/types";
import { mapUndefined } from "@namada/utils";

import { TopLevelRoute } from "App/types";
import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { TransferType, TxTransferArgs } from "../types";
import { parseTarget } from "./TokenSend";
import {
  BackButton,
  ButtonsContainer,
  InputContainer,
  TokenSendFormContainer,
} from "./TokenSendForm.components";

const GAS_LIMIT = new BigNumber(20_000);

export const submitTransferTransaction = async (
  txTransferArgs: TxTransferArgs
): Promise<void> => {
  const {
    account: { address, publicKey, type },
    amount,
    chainId,
    faucet,
    target,
    token,
    disposableSigningKey,
    feeAmount,
    gasLimit,
    memo,
  } = txTransferArgs;

  if (!feeAmount || !gasLimit) {
    return;
  }

  const integration = getIntegration(chains.namada.id);
  const signer = integration.signer() as Signer;

  const transferArgs = {
    source: faucet || address,
    target,
    token: Tokens[token].address,
    amount,
    nativeToken: Tokens.NAM.address,
  };

  const txArgs = {
    token: Tokens.NAM.address || "",
    feeAmount,
    gasLimit,
    chainId,
    publicKey: publicKey,
    signer: faucet ? target : undefined,
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
const AccountSourceTargetDescription = (
  props: {
    isShieldedSource: boolean;
    isShieldedTarget: boolean;
  }
): React.ReactElement => {
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
  const chain = useAppSelector<Chain>((state) => state.chain.config);
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const [amount, setAmount] = useState<BigNumber | undefined>(new BigNumber(0));
  const [memo, setMemo] = useState("")

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);

  const [isRevealPkNeeded, setIsRevealPkNeeded] = useState<
    boolean | undefined
  >();

  // TODO: Expecting that these could be set by the user in the future
  const gasPrice = minimumGasPrice;
  const gasLimit = GAS_LIMIT;

  const singleTransferFee = gasPrice.multipliedBy(gasLimit);

  const totalGasFee = mapUndefined(
    (needed) =>
      needed ? singleTransferFee.multipliedBy(2) : singleTransferFee,
    isRevealPkNeeded
  );

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const derivedAccounts = derived[chains.namada.id];

  const { details, balance } = derivedAccounts[address];
  const isShieldedSource = details.isShielded;

  const token = Tokens[tokenType];

  const availableBalance = mapUndefined(
    (fee) => balance[tokenType]?.minus(fee),
    totalGasFee
  );

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

  useEffect(() => {
    (async () => {
      setIsRevealPkNeeded(undefined);

      if (isShieldedSource) {
        setIsRevealPkNeeded(false);
      } else {
        const query = new Query(chain.rpc);
        const result = await query.query_public_key(address);

        setIsRevealPkNeeded(!result);
      }
    })();
  }, [address]);

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
          <Input type="text" label="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </InputContainer>
        <InputContainer>{accountSourceTargetDescription}</InputContainer>

        <p>Gas fee: {totalGasFee?.toString()} NAM</p>
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
