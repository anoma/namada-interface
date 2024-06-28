// TODO: rename this file?
//
import BigNumber from "bignumber.js";
import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type ControlRoutineProps = {
  shouldUpdateAmount: boolean;
  lastBlockHeight: BigNumber | undefined;
};

export const controlRoutineAtom = atomWithStorage<ControlRoutineProps>(
  "namadillo:etc",
  {
    shouldUpdateAmount: false,
    lastBlockHeight: undefined,
  }
);

const changeProps =
  <T>(key: keyof ControlRoutineProps) =>
  (get: Getter, set: Setter, value: T) => {
    const settings = get(controlRoutineAtom);
    set(controlRoutineAtom, { ...settings, [key]: value });
  };

export const shouldUpdateBalanceAtom = atom(
  (get) => get(controlRoutineAtom).shouldUpdateAmount,
  changeProps<boolean>("shouldUpdateAmount")
);

export const lastBlockHeightAtom = atom(
  (get) => get(controlRoutineAtom).shouldUpdateAmount,
  changeProps<BigNumber | undefined>("lastBlockHeight")
);
