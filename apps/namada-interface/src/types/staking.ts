import BigNumber from "bignumber.js";
import { ValidatorAddress } from "./validators";

export type ChangeInStakingPosition = {
  validatorId: ValidatorAddress;
  amount: BigNumber;
};
