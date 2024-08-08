import { SortableHeaderOptions, TableHeader } from "@namada/components";
import BigNumber from "bignumber.js";
import { useMemo, useState } from "react";
import { SortOptions, SortedColumnPair, Validator } from "types";
import { compareBigNumbers, sortCollection } from "utils/sorting";

const ValidatorSortableColumnsList = [
  "votingPowerInNAM",
  "commission",
] as const;

type ValidatorSortableColumns = (typeof ValidatorSortableColumnsList)[number];

const isValidatorColumn = (value: string): value is ValidatorSortableColumns =>
  ValidatorSortableColumnsList.includes(value as ValidatorSortableColumns);

type SortableColumns = ValidatorSortableColumns | "stakedAmount";

type useValidatorTableSortingProps = {
  validators: Validator[];
  stakedAmountByAddress: Record<string, BigNumber>;
};

type useValidatorTableSortingOutput = {
  sortedValidators: Validator[];
  sortableColumns: Record<SortableColumns, Partial<TableHeader>>;
};

export const useValidatorTableSorting = ({
  validators,
  stakedAmountByAddress,
}: useValidatorTableSortingProps): useValidatorTableSortingOutput => {
  const [sorting, setSorting] = useState<SortedColumnPair<SortableColumns>>();

  const getSortingParam = (key: SortableColumns): SortOptions | undefined =>
    sorting && sorting[0] === key ? sorting[1] : undefined;

  const onSortCallback =
    (key: SortableColumns) => (order: SortableHeaderOptions) =>
      order ? setSorting([key, order]) : setSorting(undefined);

  const makeSortableColumn = (key: SortableColumns): Partial<TableHeader> => {
    return {
      sortable: true,
      sorting: getSortingParam(key),
      onSort: onSortCallback(key),
    };
  };

  const sortedValidators = useMemo(() => {
    if (!sorting) return validators;

    if (isValidatorColumn(sorting[0])) {
      return sortCollection<Validator, ValidatorSortableColumns>(
        validators,
        sorting as SortedColumnPair<ValidatorSortableColumns>
      );
    }

    if (sorting[0] === "stakedAmount") {
      return validators.sort((v1: Validator, v2: Validator) => {
        return compareBigNumbers(
          stakedAmountByAddress[v1.address],
          stakedAmountByAddress[v2.address],
          sorting[1] === "desc"
        );
      });
    }

    return validators;
  }, [sorting, validators]);

  const sortableColumns: Record<SortableColumns, Partial<TableHeader>> = {
    stakedAmount: makeSortableColumn("stakedAmount"),
    commission: makeSortableColumn("commission"),
    votingPowerInNAM: makeSortableColumn("votingPowerInNAM"),
  };

  return {
    sortedValidators,
    sortableColumns,
  };
};
