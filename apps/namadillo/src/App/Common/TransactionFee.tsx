import { GasConfig } from "types";
import { unknownAsset } from "utils/assets";
import { getDisplayGasFee } from "utils/gas";
import { TokenCurrency } from "./TokenCurrency";

export const TransactionFee = ({
  gasConfig,
}: {
  gasConfig: GasConfig;
}): JSX.Element => {
  const asset = gasConfig.asset ?? unknownAsset(gasConfig.gasToken);
  const symbol = asset.symbol;
  const fee = getDisplayGasFee(gasConfig);

  return (
    <div className="text-sm">
      Transaction fee:{" "}
      <TokenCurrency symbol={symbol} amount={fee} className="font-medium " />
    </div>
  );
};
