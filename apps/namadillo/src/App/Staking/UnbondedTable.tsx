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

export const UnbondedTable = (): JSX.Element => {
  const myValidators = useAtomValue(myValidatorsAtom);
  const headers = [
    "Validator",
    "Address",
    { children: "Amount Available", className: "text-right" },
    { children: "Time Left", className: "text-right" },
  ];

  const rows = useMemo(() => {
    if (!myValidators.isSuccess) return [];

    const rowsList: TableRow[] = [];
    for (const myValidator of myValidators.data) {
      const { validator } = myValidator;
      myValidator.unbondItems
        .filter((entry) => entry.canWithdraw)
        .map((entry: UnbondEntry) => {
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
                key={`my-validator-ready-${validator.address}`}
                className="text-right text-sm text-pink"
              >
                Ready
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
      <div className="relative">
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
              "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md"
            ),
          }}
          headProps={{ className: "text-neutral-500" }}
        />
      </div>
    </AtomErrorBoundary>
  );
};
