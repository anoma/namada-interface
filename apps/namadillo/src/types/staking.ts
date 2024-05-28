import BigNumber from "bignumber.js";
import { ValidatorAddress } from "./validators";

export type ChangeInStakingPosition = {
  validatorId: ValidatorAddress;
  amount: BigNumber;
};

export type RedelegateChange = {
  sourceValidator: string;
  destinationValidator: string;
  amount: BigNumber;
};
