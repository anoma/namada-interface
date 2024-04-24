import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { transparentAccountsAtom } from "./accounts";
import { chainAtom } from "./chain";

type Unique = {
  uuid: string;
};

export type Validator = Unique & {
  alias: string;
  address: string;
  homepageUrl: string;
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

const toValidator = (address: string): Validator => ({
  uuid: address,
  alias: "<Validator Name>",
  address,
  homepageUrl: "http://namada.net",
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
  return {
    queryKey: ["my-validators-" + ids],
    queryFn: async () => {
      const { rpc } = get(chainAtom);
      const addresses = accounts.map((account) => account.address);
      const query = new Query(rpc);
      const myValidatorsRes = await query.query_my_validators(addresses);
      return myValidatorsRes.reduce(toMyValidators, []);
    },
  };
});

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
