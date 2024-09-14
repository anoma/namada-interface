/**
 * Define constants for MASP Params Storage
 */
const STORAGE_PREFIX = "/namadillo";

enum MaspParam {
  Output = "masp-output.params",
  Convert = "masp-convert.params",
  Spend = "masp-spend.params",
}

const MASP_PARAM_LEN: Record<MaspParam, number> = {
  [MaspParam.Output]: 16398620,
  [MaspParam.Spend]: 49848572,
  [MaspParam.Convert]: 22570940,
};

enum MsgType {
  FetchParam = "fetch-params",
}
