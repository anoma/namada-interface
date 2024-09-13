/**
 * Define constants for MASP Params Storage
 */
const STORAGE_PREFIX = "/namadillo";
const TRUSTED_SETUP_URL =
  "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup";

enum MaspParams {
  Output = "masp-output.params",
  Convert = "masp-convert.params",
  Spend = "masp-spend.params",
}

enum MsgType {
  FetchParam = "fetch-params",
}
