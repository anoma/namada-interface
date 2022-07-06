import { Tokens } from "constants/tokens";
export const SHIELDED_TRANSACTIONS = "SHIELDED";
export const CREATE = `${SHIELDED_TRANSACTIONS}/CREATE`;

// TransactionConfiguration contains stuff such as addresses that are fixed in a network,
// references to wasm files, masp-output.params or instructions to fetch them
// needed here and in package/masp-web
export type TransactionConfiguration = {
  tokenAddresses: {
    NAM: string;
    BTC: string;
    ETH: string;
    DOT: string;
  };
  maspAddress: string;
};

export const TRANSFER_CONFIGURATION: TransactionConfiguration = {
  tokenAddresses: {
    NAM: Tokens.NAM.address || "",
    BTC: Tokens.BTC.address || "",
    ETH: Tokens.ETH.address || "",
    DOT: Tokens.DOT.address || "",
  },
  maspAddress:
    "atest1v4ehgw36xaryysfsx5unvve4g5my2vjz89p52sjxxgenzd348yuyyv3hg3pnjs35g5unvde4ca36y5",
};
