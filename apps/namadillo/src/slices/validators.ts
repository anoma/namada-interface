import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import {
  AtomWithQueryResult,
  UndefinedInitialDataOptions,
  atomWithQuery,
} from "jotai-tanstack-query";
import { defaultAccountAtom } from "slices/accounts";
import { shouldUpdateBalanceAtom } from "./etc";
import { rpcUrlAtom } from "./settings";

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

export type MyValidator = {
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
    const rpcUrl = get(rpcUrlAtom);
    const query = new Query(rpcUrl);
    const queryResult =
      (await query.query_all_validator_addresses()) as string[];
    return queryResult.map(toValidator);
  },
}));

// eslint-disable-next-line
export const myValidatorsAtom = atomWithQuery((get) => {
  const account = get(defaultAccountAtom);

  // TODO: Refactor after this event subscription is enabled in the indexer
  const enablePolling = get(shouldUpdateBalanceAtom);

  return {
    queryKey: ["my-validators", account.data?.address],
    enabled: account.isSuccess,
    refetchInterval: enablePolling ? 1000 : false,
    queryFn: async (): Promise<MyValidator[]> => {
      const rpcUrl = get(rpcUrlAtom);
      const query = new Query(rpcUrl);
      const myValidatorsRes = await query.query_my_validators([
        account.data?.address,
      ]);
      return myValidatorsRes.map(toMyValidators);
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
  // TODO: omg
  [_, validator, stake, unbonded, withdrawable]: [
    string,
    string,
    string,
    string,
    string,
  ]
): MyValidator => {
  return {
    stakingStatus: "Bonded",
    stakedAmount: new BigNumber(stake),
    unbondedAmount: new BigNumber(unbonded),
    withdrawableAmount: new BigNumber(withdrawable),
    validator: toValidator(validator),
  };
};
