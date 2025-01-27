import { chainAssetsMapAtom } from "atoms/chain";
import { useAtomValue } from "jotai";
import { GasConfig } from "types";
import { unknownAsset } from "utils/assets";
import { getDisplayGasFee } from "utils/gas";
import { TokenCurrency } from "./TokenCurrency";

export const TransactionFee = ({
  gasConfig,
}: {
  gasConfig: GasConfig;
}): JSX.Element => {
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);

  const { gasToken } = gasConfig;
  const asset = chainAssetsMap[gasToken] ?? unknownAsset(gasToken);

  const amount = getDisplayGasFee(gasConfig);

  return (
    <div className="text-sm">
      Transaction fee:{" "}
      <TokenCurrency
        symbol={asset.symbol}
        amount={amount}
        className="font-medium"
      />
    </div>
  );
};
