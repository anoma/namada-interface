import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

import {
  Input,
  Table,
  TableConfigurations,
  TableLink,
} from "@namada/components";
import { useDebounce } from "@namada/hooks";
import { assertNever, formatPercentage, truncateInMiddle } from "@namada/utils";

import {
  StakingAndGovernanceState,
  Validator,
} from "slices/StakingAndGovernance";
import { fetchTotalBonds } from "slices/StakingAndGovernance/actions";
import { useAppDispatch, useAppSelector } from "store";
import { ValidatorsCallbacks } from "../StakingOverview";
import {
  AllValidatorsSearchBar,
  AllValidatorsSubheadingContainer,
  Paginator,
} from "./AllValidatorsTable.components";

const ITEMS_PER_PAGE = 25;

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
  sort: Sort
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
  };

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
    sort.column === AllValidatorsColumn.Validator
      ? (a, b) => a.name.localeCompare(b.name)
      : sort.column === AllValidatorsColumn.VotingPower
        ? (a, b) =>
            !a.votingPower || !b.votingPower
              ? 0
              : a.votingPower.isLessThan(b.votingPower)
                ? -1
                : 1
        : sort.column === AllValidatorsColumn.Commission
          ? (a, b) => (a.commission.isLessThan(b.commission) ? -1 : 1)
          : assertNever(sort.column);

  const cloned = validators.slice();
  cloned.sort((a, b) => direction * ascendingSortFn(a, b));

  return cloned;
};

const filterValidators = (
  search: string,
  validators: Validator[]
): Validator[] =>
  search
    ? validators.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
      )
    : validators;

enum AllValidatorsColumn {
  Validator = "Validator",
  VotingPower = "Voting power",
  Commission = "Commission",
}

type Sort = {
  column: AllValidatorsColumn;
  ascending: boolean;
};

export const AllValidatorsTable: React.FC<{
  navigateToValidatorDetails: (validatorId: string) => void;
}> = ({ navigateToValidatorDetails }) => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [sort, setSort] = useState<Sort>({
    column: AllValidatorsColumn.Validator,
    ascending: true,
  });
  const [itemOffset, setItemOffset] = useState(0);
  const [forcePage, setForcePage] = useState<number>();

  const { validators, validatorAssets } =
    useAppSelector<StakingAndGovernanceState>(
      (state) => state.stakingAndGovernance
    );
  const [filteredValidators, setFilteredValidators] = useState<Validator[]>([]);
  const [currentValidators, setCurrentValidators] = useState<Validator[]>([]);
  const endOffset = itemOffset + ITEMS_PER_PAGE;
  const pageCount = Math.ceil(filteredValidators.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setFilteredValidators(filterValidators(debouncedSearch, validators));
    if (search) {
      // Show first page of results if search is entered
      setItemOffset(0);
      // Set to first page of paginator
      setForcePage(0);
    } else {
      setForcePage(undefined);
    }
  }, [debouncedSearch, validators, validatorAssets]);

  useEffect(() => {
    const sortedValidators = sortValidators(
      sort,
      filteredValidators.slice(itemOffset, endOffset)
    );

    setCurrentValidators(sortedValidators);
    sortedValidators.forEach((validator) => {
      const { name: address } = validator;
      if (!validatorAssets[address]) {
        dispatch(fetchTotalBonds(address));
      }
    });
  }, [filteredValidators, itemOffset, debouncedSearch]);

  const handleColumnClick = useCallback(
    (column: AllValidatorsColumn): void =>
      setSort({
        column,
        ascending: sort.column === column ? !sort.ascending : true,
      }),
    [sort]
  );

  const allValidatorsConfiguration = getAllValidatorsConfiguration(
    navigateToValidatorDetails,
    handleColumnClick,
    sort
  );

  const handlePageClick = ({ selected }: { selected: number }): void => {
    const newOffset = (selected * ITEMS_PER_PAGE) % validators.length;
    setItemOffset(newOffset);
  };

  const allValidators = currentValidators.map((validator) => ({
    ...validator,
    votingPower:
      validatorAssets[validator.name]?.votingPower || new BigNumber(0),
    commission: validatorAssets[validator.name]?.commission || new BigNumber(0),
  }));

  return (
    <Table
      title="All Validators"
      subheadingSlot={
        <AllValidatorsSubheadingContainer>
          <AllValidatorsSearchBar>
            <Input
              label={""}
              placeholder="Search validators"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </AllValidatorsSearchBar>
          <Paginator
            breakLabel="..."
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="< previous"
            renderOnZeroPageCount={null}
            activeLinkClassName={"active-paginate-link"}
            forcePage={forcePage}
          />
        </AllValidatorsSubheadingContainer>
      }
      data={allValidators}
      tableConfigurations={allValidatorsConfiguration}
    />
  );
};
