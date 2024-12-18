import { Modal, SkeletonLoading } from "@namada/components";
import { chainAssetsMapAtom, nativeTokenAddressAtom } from "atoms/chain";
import {
  gasPriceForAllTokensAtom,
  storageGasTokenAtom,
} from "atoms/fees/atoms";
import { tokenPricesFamily } from "atoms/prices/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { GasConfig } from "types";
import { unknownAsset } from "utils/assets";
import { getDisplayGasFee } from "utils/gas";
import { FiatCurrency } from "./FiatCurrency";
import { TokenCurrency } from "./TokenCurrency";

export const GasFeeModal = ({
  gasConfig,
  onClose,
}: {
  gasConfig: GasConfig;
  onClose: () => void;
}): JSX.Element => {
  const setStorageGasToken = useSetAtom(storageGasTokenAtom);
  const gasPriceForAllTokens = useAtomValue(gasPriceForAllTokensAtom);
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const nativeTokenAddress = useAtomValue(nativeTokenAddressAtom).data;

  const data = gasPriceForAllTokens.data ?? [];

  const tokenAddresses = data.map((item) => item.token);
  const gasDollarMap = useAtomValue(tokenPricesFamily(tokenAddresses));

  return (
    <Modal onClose={onClose}>
      <div
        className={twMerge(
          "fixed min-w-[550px] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
          "px-6 py-7 bg-rblack border border-neutral-500 rounded-md"
        )}
      >
        <i
          className={twMerge(
            "cursor-pointer text-white absolute right-3 top-3 text-xl",
            "hover:text-yellow transition-colors"
          )}
          onClick={onClose}
        >
          <IoClose />
        </i>
        <div className="text-center">
          <h2 className="font-medium">Select Gas Token</h2>
          <div className="text-sm mt-1">
            Gas fees deducted from your Namada accounts
          </div>
        </div>
        <div className="flex flex-col mt-4 max-h-[60vh] overflow-auto">
          {!data.length ?
            <SkeletonLoading height="100px" width="100%" />
          : data
              .sort((a, b) =>
                a.token === nativeTokenAddress ? -1
                : b.token === nativeTokenAddress ? 1
                : 0
              )
              .map(({ token, minDenomAmount }) => {
                const asset = chainAssetsMap[token] ?? unknownAsset(token);
                const symbol = asset.symbol;
                const fee = getDisplayGasFee({
                  gasLimit: gasConfig.gasLimit,
                  gasPrice: BigNumber(minDenomAmount),
                  gasToken: token,
                  asset,
                });
                const price = gasDollarMap.data?.[token];
                const dollar = price ? fee.multipliedBy(price) : undefined;

                const selected = token === gasConfig.gasToken;

                return (
                  <button
                    key={token}
                    className={twMerge(
                      "flex justify-between items-center",
                      "bg-rblack rounded-sm px-5 min-h-[58px]",
                      "hover:text-yellow hover:border-yellow transition-colors duration-300",
                      selected ? "border border-white" : "m-px"
                    )}
                    type="button"
                    onClick={() => {
                      setStorageGasToken(token);
                      onClose();
                    }}
                  >
                    <div>{symbol}</div>
                    <div className="text-right">
                      {dollar && <FiatCurrency amount={dollar} />}
                      <div className="text-xs">
                        <TokenCurrency amount={fee} symbol={symbol} />
                      </div>
                    </div>
                  </button>
                );
              })
          }
        </div>
      </div>
    </Modal>
  );
};
