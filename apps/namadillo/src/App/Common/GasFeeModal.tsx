import {
  ActionButton,
  AmountInput,
  Modal,
  StyledSelectBox,
} from "@namada/components";
import { chainAssetsMapAtom, nativeTokenAddressAtom } from "atoms/chain";
import { GasPriceTable, GasPriceTableItem } from "atoms/fees/atoms";
import { tokenPricesFamily } from "atoms/prices/atoms";
import BigNumber from "bignumber.js";
import { TransactionFeeProps } from "hooks/useTransactionFee";
import { useAtomValue } from "jotai";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { GasConfig } from "types";
import { getDisplayGasFee } from "utils/gas";
import { FiatCurrency } from "./FiatCurrency";
import { TokenCurrency } from "./TokenCurrency";

const useSortByNativeToken = () => {
  const nativeToken = useAtomValue(nativeTokenAddressAtom).data;
  return (a: GasPriceTableItem, b: GasPriceTableItem) =>
    a.token === nativeToken ? -1
    : b.token === nativeToken ? 1
    : 0;
};

const useBuildGasOption = ({
  gasConfig,
  gasPriceTable,
}: {
  gasConfig: GasConfig;
  gasPriceTable: GasPriceTable | undefined;
}) => {
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);

  const gasDollarMap =
    useAtomValue(
      tokenPricesFamily(gasPriceTable?.map((item) => item.token) ?? [])
    ).data ?? {};

  return (
    override: Partial<GasConfig>
  ): {
    option: GasConfig;
    selected: boolean;
    disabled: boolean;
    symbol: string;
    displayAmount: BigNumber;
    dollar?: BigNumber;
  } => {
    const option: GasConfig = {
      ...gasConfig,
      ...override,
    };

    const displayGasFee = getDisplayGasFee(option, chainAssetsMap);
    const { totalDisplayAmount: displayAmount, asset } = displayGasFee;
    const { symbol } = asset;

    const price = gasDollarMap[option.gasToken];
    const dollar = price ? price.multipliedBy(displayAmount) : undefined;
    const selected =
      !gasConfig.gasLimit.isEqualTo(0) &&
      option.gasLimit.isEqualTo(gasConfig.gasLimit) &&
      option.gasPriceInMinDenom.isEqualTo(gasConfig.gasPriceInMinDenom) &&
      option.gasToken === gasConfig.gasToken;

    const disabled =
      gasConfig.gasLimit.isEqualTo(0) ||
      gasConfig.gasPriceInMinDenom.isEqualTo(0);

    return {
      option,
      selected,
      disabled,
      symbol,
      displayAmount,
      dollar,
    };
  };
};

export const GasFeeModal = ({
  feeProps,
  onClose,
}: {
  feeProps: TransactionFeeProps;
  onClose: () => void;
}): JSX.Element => {
  const {
    gasConfig,
    gasEstimate,
    gasPriceTable,
    onChangeGasLimit,
    onChangeGasToken,
  } = feeProps;

  const sortByNativeToken = useSortByNativeToken();
  const buildGasOption = useBuildGasOption({ gasConfig, gasPriceTable });

  return (
    <Modal onClose={onClose}>
      <div
        className={twMerge(
          "fixed min-w-[550px] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
          "px-6 py-7 bg-black border border-neutral-500 rounded-md"
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

        <h2 className="text-xl font-medium">Fee Options</h2>
        <div className="text-sm">
          Gas fees deducted from your Namada accounts
        </div>

        <div className="text-sm mt-8 mb-1">Fee</div>
        <div className="grid grid-cols-3 rounded-sm overflow-hidden">
          {[
            { label: "Low", amount: gasEstimate?.min ?? 0 },
            { label: "Average", amount: gasEstimate?.avg ?? 0 },
            { label: "High", amount: gasEstimate?.max ?? 0 },
          ].map((item) => {
            const { symbol, displayAmount, dollar, selected, disabled } =
              buildGasOption({
                gasLimit: BigNumber(item.amount),
              });

            return (
              <button
                key={item.label}
                type="button"
                disabled={disabled}
                className={twMerge(
                  "flex flex-col justify-center items-center flex-1 py-5 leading-4",
                  "transition-colors duration-150 ease-out-quad",
                  selected ?
                    "cursor-auto bg-yellow text-black"
                  : "cursor-pointer bg-neutral-800 hover:bg-neutral-700"
                )}
                onClick={() => onChangeGasLimit(BigNumber(item.amount))}
              >
                <div className="font-semibold">{item.label}</div>
                {dollar && (
                  <FiatCurrency
                    amount={dollar}
                    className="text-xs text-neutral-500 font-medium"
                  />
                )}
                <TokenCurrency
                  amount={displayAmount}
                  symbol={symbol}
                  className="font-semibold mt-1"
                />
              </button>
            );
          })}
        </div>

        <div className="text-sm mt-4 mb-1">Fee Token</div>
        <StyledSelectBox
          id="fee-token-select"
          value={gasConfig.gasToken}
          containerProps={{
            className: twMerge(
              "text-sm w-full flex-1 border border-white rounded-sm",
              "px-4 py-[9px]"
            ),
          }}
          arrowContainerProps={{ className: "right-4" }}
          listContainerProps={{
            className:
              "w-full mt-2 border border-white max-h-[300px] overflow-y-auto",
          }}
          listItemProps={{ className: "border-0 px-2 -mx-2 rounded-sm" }}
          onChange={(e) => onChangeGasToken(e.target.value)}
          options={
            gasPriceTable?.sort(sortByNativeToken).map((item) => {
              const { symbol, displayAmount, dollar } = buildGasOption({
                gasPriceInMinDenom: item.gasPrice,
                gasToken: item.token,
              });
              return {
                id: item.token,
                value: (
                  <div
                    title={item.token}
                    className="flex items-center justify-between w-full min-h-[42px] mr-5"
                  >
                    <div className="text-base">{symbol}</div>
                    <div className="text-right">
                      {dollar && <FiatCurrency amount={dollar} />}
                      <div className="text-xs">
                        <TokenCurrency amount={displayAmount} symbol={symbol} />
                      </div>
                    </div>
                  </div>
                ),
                ariaLabel: symbol,
              };
            }) ?? []
          }
        />

        <div className="mt-4">
          <AmountInput
            label="Gas Amount"
            value={gasConfig.gasLimit}
            onChange={(e) => e.target.value && onChangeGasLimit(e.target.value)}
          />
        </div>

        <div className="mt-8">
          <ActionButton
            size="sm"
            className="max-w-[200px] mx-auto"
            backgroundColor="gray"
            backgroundHoverColor="yellow"
            textColor="white"
            textHoverColor="black"
            onClick={onClose}
          >
            Close
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};
