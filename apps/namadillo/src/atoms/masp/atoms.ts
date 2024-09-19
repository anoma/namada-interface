import { atomWithAsyncStorage } from "atoms/utils";
import { MaspParam, MaspParamStorage } from "types";

export const MASP_PARAMS_KEY = "masp-params";
export const maspParamAtom = atomWithAsyncStorage<MaspParamStorage>(
  MASP_PARAMS_KEY,
  {
    [MaspParam.Output]: null,
    [MaspParam.Spend]: null,
    [MaspParam.Convert]: null,
  }
);
