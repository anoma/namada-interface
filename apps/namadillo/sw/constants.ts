/**
 * Define constants for MASP Params Storage
 */
const STORAGE_PREFIX = "/namadillo";

enum MaspParam {
  Output = "masp-output.params",
  Convert = "masp-convert.params",
  Spend = "masp-spend.params",
}

const MASP_PARAM_LEN: Record<MaspParam, { length: number; sha256sum: string }> =
{
  [MaspParam.Output]: {
    length: 16398620,
    sha256sum:
      "ed8b5d354017d808cfaf7b31eca5c511936e65ef6d276770251f5234ec5328b8",
  },
  [MaspParam.Spend]: {
    length: 49848572,
    sha256sum:
      "62b3c60ca54bd99eb390198e949660624612f7db7942db84595fa9f1b4a29fd8",
  },
  [MaspParam.Convert]: {
    length: 22570940,
    sha256sum:
      "8e049c905e0e46f27662c7577a4e3480c0047ee1171f7f6d9c5b0de757bf71f1",
  },
};

enum MsgType {
  FetchParam = "fetch-params",
}
