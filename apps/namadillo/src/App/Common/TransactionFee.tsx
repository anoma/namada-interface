import { unknownAsset } from "atoms/integrations/functions";
import { GasConfig } from "types";
import { toDisplayAmount } from "utils";
import { TokenCurrency } from "./TokenCurrency";

export const TransactionFee = ({
  gasConfig,
}: {
  gasConfig: GasConfig;
}): JSX.Element => {
  const asset = gasConfig.asset ?? unknownAsset(gasConfig.gasToken);
  const symbol = asset.symbol;
  const fee = toDisplayAmount(
    asset,
    gasConfig.gasPrice.multipliedBy(gasConfig.gasLimit)
  );

  return (
    <div className="text-sm">
      <span className="underline">Transaction fee:</span>{" "}
      <TokenCurrency symbol={symbol} amount={fee} className="font-medium " />
    </div>
  );
};
