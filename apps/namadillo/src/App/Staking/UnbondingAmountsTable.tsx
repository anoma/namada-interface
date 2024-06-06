import { StyledTable, TableRow } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { myUnbondsAtom } from "slices/validators";
import { twMerge } from "tailwind-merge";
import { ValidatorName } from "./ValidatorName";
import { WithdrawalButton } from "./WithdrawalButton";

export const UnbondingAmountsTable = (): JSX.Element => {
  const myUnbonds = useAtomValue(myUnbondsAtom);
  const headers = [
    "Validator",
    "Address",
    { children: "Amount Unbonding", className: "text-right" },
    { children: "Time left", className: "text-right" },
  ];

  const rows = useMemo(() => {
    if (!myUnbonds.isSuccess) return [];

    const rowsList: TableRow[] = [];
    for (const myValidator of myUnbonds.data) {
      const { validator, unbondedAmount } = myValidator;
      if (myValidator.unbondedAmount?.gt(0)) {
        rowsList.push({
          cells: [
            <ValidatorName
              key={`unbonding-list-${validator.address}`}
              validator={validator}
              showAddress={false}
            />,
            shortenAddress(validator.address, 8, 6),
            <div
              key={`my-validator-currency-${validator.address}`}
              className="text-right leading-tight"
            >
              <NamCurrency amount={unbondedAmount || new BigNumber(0)} />
              <FiatCurrency
                amountInNam={unbondedAmount || new BigNumber(0)}
                className="block text-sm text-neutral-600"
              />
            </div>,
            //TODO: implement this after indexer is ready
            <div
              key={`comission-${validator.address}`}
              className="text-right leading-tight text-sm"
            >
              15 TODOS {/* TODO */}
            </div>,
            <div
              key={`withdraw-${validator.address}`}
              className="ml-4 relative z-0"
            >
              <WithdrawalButton myValidator={myValidator} />
            </div>,
          ],
        });
      }
    }
    return rowsList;
  }, [myUnbonds]);

  return (
    <StyledTable
      id="unbonding-amounts-table"
      headers={headers.concat("")}
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
  );
};
