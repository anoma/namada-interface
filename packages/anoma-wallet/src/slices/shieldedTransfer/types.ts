export const SHIELDED_TRANSACTIONS = "SHIELDED";
export const CREATE = `${SHIELDED_TRANSACTIONS}/CREATE`;

// TransactionConfiguration contains stuff such as addresses that are fixed in a network,
// references to wasm files, masp-output.params or instructions to fetch them
// needed here and in package/masp-web
export type TransactionConfiguration = {
  tokenAddresses: {
    nam: string;
  };
  maspAddress: string;
};

export const TRANSFER_CONFIGURATION: TransactionConfiguration = {
  tokenAddresses: {
    nam: "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
  },
  maspAddress:
    "atest1v4ehgw36xaryysfsx5unvve4g5my2vjz89p52sjxxgenzd348yuyyv3hg3pnjs35g5unvde4ca36y5",
};
