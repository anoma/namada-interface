import {
  storageShieldedBalanceAtom,
  viewingKeysAtom,
} from "atoms/balance/atoms";
import { chainAssetsMapAtom } from "atoms/chain/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import { Address } from "types";
import { toBaseAmount } from "utils";

type Amount = string | number | BigNumber;

const sum = (a: Amount, b: Amount): string => {
  return BigNumber(a).plus(b).toString();
};

export const useOptimisticTransferUpdate = () => {
  const setStorageShieldedBalance = useSetAtom(storageShieldedBalanceAtom);
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);

  const [viewingKeyData] = useAtomValue(viewingKeysAtom).data ?? [];
  const viewingKey = viewingKeyData?.key;

  return (token: Address, incrementDisplayAmount: BigNumber) => {
    const asset = chainAssetsMap[token];
    if (!viewingKey || !asset) {
      return;
    }
    const baseAmount = toBaseAmount(asset, incrementDisplayAmount);
    setStorageShieldedBalance((storage) => ({
      ...storage,
      [viewingKey]: storage[viewingKey].map((item) =>
        item.address === token ?
          { ...item, minDenomAmount: sum(item.minDenomAmount, baseAmount) }
        : item
      ),
    }));
  };
};
