import { EncodedTx } from "@heliax/namada-sdk/web";
import { getIntegration } from "@namada/integrations";
import {
  Account,
  BondProps,
  Chain,
  RedelegateProps,
  Signer,
  WrapperTxMsgValue,
} from "@namada/types";
import BigNumber from "bignumber.js";
import { invariant } from "framer-motion";
import { getSdkInstance } from "hooks";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { GasConfig } from "types/fees";
import { ChangeInStakingPosition, RedelegateChange } from "types/staking";
import { chainAtom } from "./chain";
import { MyValidator, myValidatorsAtom } from "./validators";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    nativeToken = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

type StakingTotals = {
  totalBonded: BigNumber;
  totalUnbonded: BigNumber;
  totalWithdrawable: BigNumber;
};

type ChangeInStakingProps = {
  account: Account;
  changes: ChangeInStakingPosition[];
  gasConfig: GasConfig;
};

type RedelegateChangesProps = {
  account: Account;
  changes: RedelegateChange[];
  gasConfig: GasConfig;
};

export const getStakingTotalAtom = atomWithQuery<StakingTotals>((get) => {
  const myValidators = get(myValidatorsAtom);
  return {
    enabled: myValidators.isSuccess,
    queryKey: ["staking-totals", myValidators.dataUpdatedAt],
    queryFn: async () => {
      const totalBonded = myValidators.data.reduce(
        (acc: BigNumber, validator: MyValidator) =>
          acc.plus(validator.stakedAmount ?? 0),
        new BigNumber(0)
      );

      const totalUnbonded = myValidators.data.reduce(
        (acc: BigNumber, validator: MyValidator) =>
          acc.plus(validator.unbondedAmount ?? 0),
        new BigNumber(0)
      );

      const totalWithdrawable = myValidators.data.reduce(
        (acc: BigNumber, validator: MyValidator) =>
          acc.plus(validator.withdrawableAmount ?? 0),
        new BigNumber(0)
      );

      return { totalBonded, totalUnbonded, totalWithdrawable };
    },
  };
});

const getStakingChangesParams = (
  account: Account,
  changes: ChangeInStakingPosition[],
  // TODO: Should we need to pass chain here?
  _chain: Chain
): BondProps[] => {
  const address = nativeToken;
  invariant(!!address, "Invalid currency address");
  return changes.map((change) => ({
    source: account.address,
    validator: change.validatorId,
    amount: change.amount,
    nativeToken: address!,
  }));
};

const getRedelegateChangeParams = (
  account: Account,
  changes: RedelegateChange[]
): RedelegateProps[] => {
  return changes.map((change: RedelegateChange) => ({
    owner: account.address,
    ...change,
  }));
};

const getTxProps = (
  account: Account,
  gasConfig: GasConfig,
  chain: Chain
): WrapperTxMsgValue => {
  const address = nativeToken;
  invariant(!!address, "Invalid currency address");
  invariant(
    !!account.publicKey,
    "Account doesn't contain a publicKey attached to it"
  );

  return {
    token: address!,
    feeAmount: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    chainId: chain.chainId,
    publicKey: account.publicKey!,
    memo: "",
  };
};

export const performBondAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["bonding"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: ChangeInStakingProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signingClient = integration.signer() as Signer;
      const { tx, rpc } = await getSdkInstance();

      const bondProps = getStakingChangesParams(account, changes, chain);
      const wrapperTxProps = getTxProps(account, gasConfig, chain);

      const txArray: EncodedTx[] = [];
      // Determine if RevealPK is needed:
      const pk = await rpc.queryPublicKey(account.address);

      if (!pk) {
        const revealPkTx = await tx.buildRevealPk(
          wrapperTxProps,
          account.address
        );
        // Add to txArray to sign & broadcast below:
        txArray.push(revealPkTx);
      }
      const encodedTxs = await Promise.all(
        bondProps.map((props) => tx.buildBond(wrapperTxProps, props))
      );
      txArray.push(...encodedTxs);

      try {
        const signedTxs = await signingClient.sign(
          bondProps[0].source,
          encodedTxs.map(({ tx }) => tx)
        );
        if (!signedTxs) {
          throw new Error("Signing failed");
        }
        // TODO: NOTE: We probably want to dispatch success/fail notificatons for each
        // transaction, and not wait for all to complete!
        return await Promise.all(
          signedTxs.map(async (signedTx, i) => {
            const txMsg = txArray[i].txMsg;
            const response = await rpc.broadcastTx({
              wrapperTxMsg: txMsg,
              tx: signedTx,
            });
            return response;
          })
        );
      } catch (e) {
        console.error(e);
      }
    },
  };
});

export const performUnbondAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["unbonding"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: ChangeInStakingProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signingClient = integration.signer() as Signer;
      const { tx, rpc } = await getSdkInstance();

      const unbondProps = getStakingChangesParams(account, changes, chain);
      const wrapperTxProps = getTxProps(account, gasConfig, chain);

      const txArray: EncodedTx[] = [];
      // Determine if RevealPK is needed:
      const pk = await rpc.queryPublicKey(account.address);

      if (!pk) {
        const revealPkTx = await tx.buildRevealPk(
          wrapperTxProps,
          account.address
        );
        // Add to txArray to sign & broadcast below:
        txArray.push(revealPkTx);
      }
      const encodedTxs = await Promise.all(
        unbondProps.map((props) => tx.buildUnbond(wrapperTxProps, props))
      );
      txArray.push(...encodedTxs);

      try {
        const signedTxs = await signingClient.sign(
          unbondProps[0].source,
          txArray.map(({ tx }) => tx)
        );

        if (!signedTxs) {
          throw new Error("Signing failed");
        }

        // TODO: NOTE: We probably want to dispatch success/fail notificatons for each
        // transaction, and not wait for all to complete!
        return await Promise.all(
          signedTxs.map(async (signedTx, i) => {
            const txMsg = txArray[i].txMsg;
            const response = await rpc.broadcastTx({
              wrapperTxMsg: txMsg,
              tx: signedTx,
            });
            return response;
          })
        );
      } catch (e) {
        console.error(e);
      }
    },
  };
});

export const performWithdrawAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["withdraw"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: ChangeInStakingProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signingClient = integration.signer() as Signer;
      const { tx, rpc } = await getSdkInstance();

      const withdrawProps = getStakingChangesParams(account, changes, chain);
      const wrapperTxProps = getTxProps(account, gasConfig, chain);

      const txArray: EncodedTx[] = [];
      // Determine if RevealPK is needed:
      const pk = await rpc.queryPublicKey(account.address);

      if (!pk) {
        const revealPkTx = await tx.buildRevealPk(
          wrapperTxProps,
          account.address
        );
        // Add to txArray to sign & broadcast below:
        txArray.push(revealPkTx);
      }

      const encodedTxs = await Promise.all(
        withdrawProps.map((props) => tx.buildWithdraw(wrapperTxProps, props))
      );
      txArray.push(...encodedTxs);

      try {
        const signedTxs = await signingClient.sign(
          withdrawProps[0].source,
          txArray.map(({ tx }) => tx)
        );

        if (!signedTxs) {
          throw new Error("Signing failed");
        }

        // TODO: NOTE: We probably want to dispatch success/fail notificatons for each
        // transaction, and not wait for all to complete!
        return await Promise.all(
          signedTxs.map(async (signedTx, i) => {
            const txMsg = txArray[i].txMsg;
            const response = await rpc.broadcastTx({
              wrapperTxMsg: txMsg,
              tx: signedTx,
            });
            return response;
          })
        );
      } catch (e) {
        console.error(e);
      }
    },
  };
});

export const performReDelegationAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["redelegate"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: RedelegateChangesProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signingClient = integration.signer() as Signer;
      const { tx, rpc } = await getSdkInstance();

      const withdrawProps = getRedelegateChangeParams(account, changes);
      const wrapperTxProps = getTxProps(account, gasConfig, chain);
      const txArray: EncodedTx[] = [];
      // Determine if RevealPK is needed:
      const pk = await rpc.queryPublicKey(account.address);

      if (!pk) {
        const revealPkTx = await tx.buildRevealPk(
          wrapperTxProps,
          account.address
        );
        // Add to txArray to sign & broadcast below:
        txArray.push(revealPkTx);
      }

      const encodedTxs = await Promise.all(
        withdrawProps.map((props) => tx.buildRedelegate(wrapperTxProps, props))
      );
      txArray.push(...encodedTxs);

      try {
        const signedTxs = await signingClient.sign(
          withdrawProps[0].owner,
          txArray.map(({ tx }) => tx)
        );

        if (!signedTxs) {
          throw new Error("Signing failed");
        }

        // TODO: NOTE: We probably want to dispatch success/fail notificatons for each
        // transaction, and not wait for all to complete!
        return await Promise.all(
          signedTxs.map(async (signedTx, i) => {
            const txMsg = txArray[i].txMsg;
            const response = await rpc.broadcastTx({
              wrapperTxMsg: txMsg,
              tx: signedTx,
            });
            return response;
          })
        );
      } catch (e) {
        console.error(e);
      }
    },
  };
});
