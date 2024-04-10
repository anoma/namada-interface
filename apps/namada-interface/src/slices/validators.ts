import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { atom } from "jotai";
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

const toValidator = (address: string): Validator => ({
  uuid: address,
  alias: "<Validator Name>",
  address,
  homepageUrl: "http://namada.net",
  votingPowerInNAM: BigNumber("70000000"),
  votingPowerPercentage: 0.06,
  commission: new BigNumber(0), // TODO: implement commission
  imageUrl: "https://placekitten.com/200/200",
});

export const validatorsAtom = atom<Validator[]>([]);

export const fetchAllValidatorsAtom = atom(
  (get) => get(validatorsAtom),
  async (get, set) => {
    const { rpc } = get(chainAtom);
    const query = new Query(rpc);
    const queryResult =
      (await query.query_all_validator_addresses()) as string[];
    set(validatorsAtom, queryResult.map(toValidator));
  }
);
