import { useState, useCallback, useEffect } from "react";
import BigNumber from "bignumber.js";

import {
  Table,
  TableLink,
  TableConfigurations,
  Input,
  InputVariants,
} from "@namada/components";
import { formatPercentage, assertNever, truncateInMiddle } from "@namada/utils";
import { useDebounce } from "@namada/hooks";

import {
  StakingAndGovernanceState,
  Validator,
} from "slices/StakingAndGovernance";
import { useAppDispatch, useAppSelector } from "store";
import {
  AllValidatorsSearchBar,
  AllValidatorsSubheadingContainer,
  Paginator,
} from "./AllValidatorsTable.components";
import { ValidatorsCallbacks } from "../StakingOverview";
import { fetchTotalBonds } from "slices/StakingAndGovernance/actions";

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
  validators.filter((v) =>
    search === "" ? true : v.name.toLowerCase().includes(search.toLowerCase())
  );

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

  const { validators, validatorAssets } =
    useAppSelector<StakingAndGovernanceState>(
      (state) => state.stakingAndGovernance
    );
  const [filteredValidators, setFilteredValidators] = useState<Validator[]>([]);
  const [currentValidators, setCurrentValidators] = useState<Validator[]>([]);
  const endOffset = itemOffset + ITEMS_PER_PAGE;

  useEffect(() => {
    setFilteredValidators(filterValidators(debouncedSearch, validators));
  }, [debouncedSearch, validators]);

  useEffect(() => {
    setCurrentValidators(
      search ? filteredValidators : validators.slice(itemOffset, endOffset)
    );
  }, [filteredValidators, itemOffset]);

  const pageCount = Math.ceil(filteredValidators.length / ITEMS_PER_PAGE);
  const sortedValidators = sortValidators(sort, currentValidators).map(
    (validator) => ({
      ...validator,
      votingPower:
        validatorAssets[validator.name]?.votingPower || new BigNumber(0),
      commission:
        validatorAssets[validator.name]?.commission || new BigNumber(0),
    })
  );

  useEffect(() => {
    sortedValidators.forEach((validator) => {
      const { name: address } = validator;
      if (!validatorAssets[address]) {
        dispatch(fetchTotalBonds(address));
      }
    });
  }, [currentValidators]);

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

  const handlePageClick = (event: { selected: number }): void => {
    const newOffset = (event.selected * ITEMS_PER_PAGE) % validators.length;
    setItemOffset(newOffset);
  };

  return (
    <Table
      title="All Validators"
      subheadingSlot={
        <AllValidatorsSubheadingContainer>
          <AllValidatorsSearchBar>
            <Input
              label={""}
              placeholder="Search validators"
              variant={InputVariants.Text}
              value={search}
              onChangeCallback={(e) => setSearch(e.target.value)}
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
          />
        </AllValidatorsSubheadingContainer>
      }
      data={sortedValidators}
      tableConfigurations={allValidatorsConfiguration}
    />
  );
};
