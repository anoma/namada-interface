import { useState, useCallback } from "react";
import { Table, TableLink, TableConfigurations } from "@namada/components";
import { Validator } from "slices/StakingAndGovernance";
import {
  AllValidatorsSearchBar
} from "./AllValidatorsTable.components";
import { formatPercentage, assertNever, truncateInMiddle } from "@namada/utils";
import { useAppSelector, RootState } from "store";
import { ValidatorsCallbacks } from "../StakingOverview";

// AllValidators table row renderer and configuration
// it contains callbacks defined in AllValidatorsCallbacks
const AllValidatorsRowRenderer = (
  validator: Validator,
  callbacks?: ValidatorsCallbacks
): JSX.Element => {
  return (
    <>
      <td>
        <TableLink
          onClick={() => {
            callbacks && callbacks.onClickValidator(validator.name);
          }}
        >
          {truncateInMiddle(validator.name, 10, 16)}
        </TableLink>
      </td>
      <td>{validator.votingPower?.toString() ?? ""}</td>
      <td>{formatPercentage(validator.commission)}</td>
    </>
  );
};

const getAllValidatorsConfiguration = (
  navigateToValidatorDetails: (validatorId: string) => void,
  onColumnClick: (column: AllValidatorsColumn) => void,
  sort: Sort,
): TableConfigurations<Validator, ValidatorsCallbacks> => {
  const getLabelWithTriangle = (column: AllValidatorsColumn): string => {
    let triangle = "";
    if (sort.column === column) {
      if (sort.ascending) {
        triangle = " \u25b5"; // white up-pointing small triangle
      } else {
        triangle = " \u25bf"; // white down-pointing small triangle
      }
    }

    return `${column}${triangle}`;
  }

  return {
    rowRenderer: AllValidatorsRowRenderer,
    callbacks: {
      onClickValidator: navigateToValidatorDetails,
    },
    columns: [
      {
        uuid: "1",
        columnLabel: getLabelWithTriangle(AllValidatorsColumn.Validator),
        width: "45%",
        onClick: () => onColumnClick(AllValidatorsColumn.Validator),
      },
      {
        uuid: "2",
        columnLabel: getLabelWithTriangle(AllValidatorsColumn.VotingPower),
        width: "25%",
        onClick: () => onColumnClick(AllValidatorsColumn.VotingPower),
      },
      {
        uuid: "3",
        columnLabel: getLabelWithTriangle(AllValidatorsColumn.Commission),
        width: "30%",
        onClick: () => onColumnClick(AllValidatorsColumn.Commission),
      },
    ],
  };
};

const sortValidators = (sort: Sort, validators: Validator[]): Validator[] => {
  const direction = sort.ascending ? 1 : -1;

  const ascendingSortFn: (a: Validator, b: Validator) => number =
    sort.column === AllValidatorsColumn.Validator ?
      (a, b) => a.name.localeCompare(b.name) :
      sort.column === AllValidatorsColumn.VotingPower ?
        ((a, b) =>
          !a.votingPower || !b.votingPower ? 0 :
            a.votingPower.isLessThan(b.votingPower) ? -1 : 1) :
        sort.column === AllValidatorsColumn.Commission ?
          ((a, b) => a.commission.isLessThan(b.commission) ? -1 : 1) :
          assertNever(sort.column);

  const cloned = validators.slice();
  cloned.sort((a, b) => direction * ascendingSortFn(a, b));

  return cloned;
}

const filterValidators = (search: string, validators: Validator[]): Validator[] =>
  validators.filter(v =>
    search === ""
      ? true
      : v.name.toLowerCase().startsWith(search.toLowerCase())
  );

const selectSortedFilteredValidators = (sort: Sort, search: string) =>
  (state: RootState): Validator[] => {
    const validators = state.stakingAndGovernance.validators;

    const sorted = sortValidators(sort, validators);
    const sortedAndFiltered = filterValidators(search, sorted);

    return sortedAndFiltered;
  };

enum AllValidatorsColumn {
  Validator = "Validator",
  VotingPower = "Voting power",
  Commission = "Commission"
};

type Sort = {
  column: AllValidatorsColumn;
  ascending: boolean;
};

export const AllValidatorsTable: React.FC<{
  navigateToValidatorDetails: (validatorId: string) => void;
}> = ({
  navigateToValidatorDetails,
}) => {
    const [search, setSearch] = useState("");

    const [sort, setSort] = useState<Sort>({
      column: AllValidatorsColumn.Validator,
      ascending: true
    });

    const sortedFilteredValidators = useAppSelector(
      selectSortedFilteredValidators(sort, search)
    );

    const handleColumnClick = useCallback(
      (column: AllValidatorsColumn): void =>
        setSort({
          column,
          ascending: sort.column === column ? !sort.ascending : true
        }),
      [sort]
    );

    const allValidatorsConfiguration = getAllValidatorsConfiguration(
      navigateToValidatorDetails,
      handleColumnClick,
      sort
    );

    return (
      <Table
        title="All Validators"
        subheadingSlot={
          <AllValidatorsSearchBar>
            <input
              type="search"
              placeholder="Validator"
              value={search}
              onChange={e => setSearch(e.target.value)}
            >
            </input>
          </AllValidatorsSearchBar>
        }
        data={sortedFilteredValidators}
        tableConfigurations={allValidatorsConfiguration}
      />
    );
  };
