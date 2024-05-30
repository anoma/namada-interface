import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import {
  AtomWithQueryResult,
  UndefinedInitialDataOptions,
  atomWithQuery,
} from "jotai-tanstack-query";
import { transparentAccountsAtom } from "./accounts";
import { chainAtom } from "./chain";
import { shouldUpdateBalanceAtom } from "./etc";

type Unique = {
  uuid: string;
};

export type Validator = Unique & {
  alias: string;
  address: string;
  description?: string;
  homepageUrl: string;
  expectedApr: number;
  unbondingPeriod: string;
  votingPowerInNAM?: BigNumber;
  votingPowerPercentage?: number;
  commission: BigNumber;
  imageUrl?: string;
};

export type MyValidator = Unique & {
  stakingStatus: string;
  stakedAmount?: BigNumber;
  unbondedAmount?: BigNumber;
  withdrawableAmount?: BigNumber;
  validator: Validator;
};

// TODO: Change this after the indexer is created
const toValidator = (address: string): Validator => ({
  uuid: address,
  alias: "<Validator Name>",
  description: "Lorem ipsum dolor sit amet",
  address,
  homepageUrl: "http://namada.net",
  expectedApr: 0.1127,
  unbondingPeriod: "21 days",
  votingPowerInNAM: BigNumber("70000000"),
  votingPowerPercentage: 0.06,
  commission: new BigNumber(0), // TODO: implement commission
  imageUrl: "https://loremflickr.com/200/200",
});

export const allValidatorsAtom = atomWithQuery((get) => ({
  queryKey: ["all-validators"],
  queryFn: async () => {
    const { rpc } = get(chainAtom);
    const query = new Query(rpc);
    const queryResult =
      (await query.query_all_validator_addresses()) as string[];
    return queryResult.map(toValidator);
  },
}));

// eslint-disable-next-line
export const myValidatorsAtom = atomWithQuery((get) => {
  const accounts = get(transparentAccountsAtom);
  const ids = accounts.map((account) => account.address).join("-");
  // TODO: Refactor after this event subscription is enabled in the indexer
  const enablePolling = get(shouldUpdateBalanceAtom);
  return {
    queryKey: ["my-validators", ids],
    refetchInterval: enablePolling ? 1000 : false,
    queryFn: async (): Promise<MyValidator[]> => {
      const { rpc } = get(chainAtom);
      const addresses = accounts.map((account) => account.address);
      const query = new Query(rpc);
      const myValidatorsRes = await query.query_my_validators(addresses);
      return myValidatorsRes.reduce(toMyValidators, []);
    },
  };
});
export const unbondedAmountByAddressAtom = atomWithQuery((get) =>
  deriveFromMyValidatorsAtom(
    "unbonded-amount",
    "unbondedAmount",
    get(myValidatorsAtom)
  )
);

export const withdrawableAmountByAddressAtom = atomWithQuery((get) =>
  deriveFromMyValidatorsAtom(
    "withdrawable-amount",
    "withdrawableAmount",
    get(myValidatorsAtom)
  )
);

export const stakedAmountByAddressAtom = atomWithQuery((get) =>
  deriveFromMyValidatorsAtom(
    "staked-amount",
    "stakedAmount",
    get(myValidatorsAtom)
  )
);

const deriveFromMyValidatorsAtom = (
  key: string,
  property: "stakedAmount" | "unbondedAmount" | "withdrawableAmount",
  myValidators: AtomWithQueryResult<MyValidator[], Error>
): UndefinedInitialDataOptions<Record<string, BigNumber>> => {
  return {
    queryKey: [key, myValidators.data],
    enabled: myValidators.isSuccess,
    queryFn: async () => {
      return myValidators.data!.reduce((prev, current) => {
        if (current[property]?.gt(0)) {
          return { ...prev, [current.validator.address]: current[property] };
        }
        return prev;
      }, {});
    },
  };
};

const toMyValidators = (
  acc: MyValidator[],
  // TODO: omg
  [_, validator, stake, unbonded, withdrawable]: [
    string,
    string,
    string,
    string,
    string,
  ]
): MyValidator[] => {
  const index = acc.findIndex((myValidator) => myValidator.uuid === validator);
  const v = acc[index];
  const sliceFn =
    index == -1 ?
      (arr: MyValidator[]) => arr
    : (arr: MyValidator[], idx: number) => [
        ...arr.slice(0, idx),
        ...arr.slice(idx + 1),
      ];

  const stakedAmount = new BigNumber(stake).plus(
    new BigNumber(v?.stakedAmount || 0)
  );

  const unbondedAmount = new BigNumber(unbonded).plus(
    new BigNumber(v?.unbondedAmount || 0)
  );

  const withdrawableAmount = new BigNumber(withdrawable).plus(
    new BigNumber(v?.withdrawableAmount || 0)
  );

  return [
    ...sliceFn(acc, index),
    {
      uuid: validator,
      stakingStatus: "Bonded",
      stakedAmount,
      unbondedAmount,
      withdrawableAmount,
      validator: toValidator(validator),
    },
  ];
};
