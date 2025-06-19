import {
  storageShieldedBalanceAtom,
  viewingKeysAtom,
} from "atoms/balance/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import { Address } from "types";

type Amount = string | number | BigNumber;

const sum = (a: Amount, b: Amount): string => {
  return BigNumber(a).plus(b).toString();
};

export const useOptimisticTransferUpdate = () => {
  const setStorageShieldedBalance = useSetAtom(storageShieldedBalanceAtom);
  const [viewingKeyData] = useAtomValue(viewingKeysAtom).data ?? [];
  const viewingKey = viewingKeyData?.key;

  return (token: Address, incrementBaseDenomAmount: BigNumber) => {
    if (!viewingKey) {
      return;
    }
    setStorageShieldedBalance((storage) => {
      return storage[viewingKey] === undefined ?
          storage
        : {
            ...storage,
            [viewingKey]: storage[viewingKey].map((item) =>
              item.address === token ?
                {
                  ...item,
                  minDenomAmount: sum(
                    item.minDenomAmount,
                    incrementBaseDenomAmount
                  ),
                }
              : item
            ),
          };
    });
  };
};
