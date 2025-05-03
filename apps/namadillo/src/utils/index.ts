import { Asset, AssetDenomUnit } from "@chain-registry/types";
import namadaAssets from "@namada/chain-registry/namada/assetlist.json";
import {
  BroadcastTxError,
  ProposalStatus,
  ProposalTypeString,
  ResultCode,
  TxMsgValue,
} from "@namada/types";
import { localnetConfigAtom } from "atoms/integrations/atoms";
import BigNumber from "bignumber.js";
import { getDefaultStore } from "jotai";
import { useEffect, useRef } from "react";

export const proposalStatusToString = (status: ProposalStatus): string => {
  const statusText: Record<ProposalStatus, string> = {
    pending: "Upcoming",
    ongoing: "Ongoing",
    passed: "Passed",
    rejected: "Rejected",
    executed: "Executed",
  };

  return statusText[status];
};

export const proposalTypeStringToString = (
  type: ProposalTypeString
): string => {
  const typeText: Record<ProposalTypeString, string> = {
    default: "Default",
    default_with_wasm: "Default with Wasm",
    pgf_steward: "PGF Steward",
    pgf_payment: "PGF Payment",
  };

  return typeText[type];
};

export const epochToString = (epoch: bigint): string =>
  `Epoch ${epoch.toString()}`;

export const proposalIdToString = (proposalId: bigint): string =>
  `#${proposalId.toString()}`;

export const useTransactionEventListener = <T extends keyof WindowEventMap>(
  event: T | T[],
  handler: (event: WindowEventMap[T]) => void
): void => {
  // `handlerRef` is useful to avoid recreating the listener every time
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const callback: typeof handler = (event) => handlerRef.current(event);
    if (Array.isArray(event)) {
      event.forEach((e) => window.addEventListener(e, callback));
    } else {
      window.addEventListener(event, callback);
    }
    return () => {
      if (Array.isArray(event)) {
        event.forEach((e) => window.removeEventListener(e, callback));
      } else {
        window.removeEventListener(event, callback);
      }
    };
  }, [event]);
};

export const sumBigNumberArray = (numbers: BigNumber[]): BigNumber => {
  if (numbers.length === 0) return new BigNumber(0);
  return BigNumber.sum(...numbers);
};

const findDisplayUnit = (asset: Asset): AssetDenomUnit | undefined => {
  const { display, denom_units } = asset;
  return denom_units.find((unit) => unit.denom === display);
};

export const namadaAsset = (): Asset => {
  const store = getDefaultStore();
  const config = store.get(localnetConfigAtom);

  const configTokenAddress = config.data?.tokenAddress;
  const registryAsset = namadaAssets.assets[0];
  const asset =
    configTokenAddress ?
      {
        ...registryAsset,
        address: configTokenAddress,
      }
    : registryAsset;

  return asset satisfies Asset;
};

export const isNamadaAsset = (asset?: Asset): boolean =>
  asset?.symbol === namadaAsset().symbol;

export const toDisplayAmount = (
  asset: Asset,
  baseAmount: BigNumber
): BigNumber => {
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return baseAmount;
  }

  return baseAmount.shiftedBy(-displayUnit.exponent);
};

export const toBaseAmount = (
  asset: Asset,
  displayAmount: BigNumber
): BigNumber => {
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return displayAmount;
  }
  return displayAmount.shiftedBy(displayUnit.exponent);
};

/**
 * Returns formatted error message based on tx props and error code
 */
export const toErrorDetail = (
  tx: TxMsgValue[],
  error: BroadcastTxError
): string => {
  try {
    const { code } = error.toProps();
    // TODO: Over time we may expand this to format errors for more result codes
    switch (code) {
      case ResultCode.TxGasLimit:
        const { gasLimit } = tx[0].args;
        return `${error.toString()} Please raise the Gas Amount above the previously provided ${gasLimit} in the fee options for your transaction.`;
      default:
        return error.toString();
    }
  } catch (_e) {
    return `${error.toString()}`;
  }
};
