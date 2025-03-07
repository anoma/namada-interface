import { StyledTable, TableRow } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { WalletAddress } from "App/Common/WalletAddress";
import { myValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { UnbondEntry } from "types";
import { ValidatorCard } from "./ValidatorCard";

export const UnbondingAmountsTable = (): JSX.Element => {
  const myValidators = useAtomValue(myValidatorsAtom);
  const headers = [
    "Validator",
    "Address",
    { children: "Amount Unbonding", className: "text-right" },
    { children: "Time Left", className: "text-right" },
  ];

  const rows = useMemo(() => {
    if (!myValidators.isSuccess) return [];

    const rowsList: TableRow[] = [];
    for (const myValidator of myValidators.data) {
      const { validator } = myValidator;
      myValidator.unbondItems
        .filter((entry) => !entry.canWithdraw)
        .forEach((entry: UnbondEntry) => {
          rowsList.push({
            cells: [
              <ValidatorCard
                key={`unbonding-list-${validator.address}`}
                validator={validator}
                showAddress={false}
              />,
              <WalletAddress
                key={`address-${validator.address}`}
                address={validator.address}
              />,
              <div
                key={`my-validator-currency-${validator.address}`}
                className="text-right leading-tight"
              >
                <NamCurrency
                  amount={BigNumber(entry.amount) || new BigNumber(0)}
                />
              </div>,
              <div
                key={`commission-${validator.address}`}
                className="text-right leading-tight text-sm"
              >
                {entry.timeLeft}
              </div>,
            ],
          });
        });
    }
    return rowsList;
  }, [myValidators]);

  return (
    <AtomErrorBoundary
      result={myValidators}
      niceError="Unable to load unbonding list"
    >
      <StyledTable
        id="unbonding-amounts-table"
        headers={headers}
        rows={rows}
        containerClassName="table-container flex-1 dark-scrollbar overscroll-contain"
        tableProps={{
          className: twMerge(
            "w-full flex-1 [&_td]:px-1 [&_th]:px-1 [&_td]:h-[64px] [&_tr]:relative",
            "[&_td:first-child]:pl-4 [&_td:last-child]:pr-4",
            "[&_td]:font-normal [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
            "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
            "[&_td:first-child]:before:absolute [&_td:first-child]:before:w-full [&_td:first-child]:before:h-full",
            "[&_td:first-child]:before:border [&_td:first-child]:before:border-pink",
            "[&_td:first-child]:before:left-0 [&_td:first-child]:before:top-0",
            "[&_td:first-child]:before:rounded-sm [&_td:first-child]:before:pointer-events-none"
          ),
        }}
        headProps={{ className: "text-neutral-500" }}
      />
    </AtomErrorBoundary>
  );
};
