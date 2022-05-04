export { type TokenType, Tokens, Symbols } from "./tokens";
export { TxResponse } from "./tx";
export { TxWasm, VpWasm } from "./wasm";

const { REACT_APP_LOCAL, REACT_APP_LOCAL_FAUCET } = process.env;
const DEFAULT_FAUCET =
  "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3";

export const FAUCET_ADDRESS = REACT_APP_LOCAL
  ? REACT_APP_LOCAL_FAUCET || DEFAULT_FAUCET
  : DEFAULT_FAUCET;
