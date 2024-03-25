import { Bip44Path } from "@namada/types";

/**
 * Return a properly formatted BIP-044 path array
 * @param coinType - SLIP-044 Coin designation
 * @param path - path object
 * @returns BIP-044 path array
 */
export const makeBip44PathArray = (
  coinType: number,
  path: Bip44Path
): Uint32Array => {
  const { account, change, index } = path;
  return new Uint32Array([44, coinType, account, change, index]);
};

/**
 * Return a properly formatted BIP-044 path
 * @param coinType - SLIP-044 Coin designation
 * @param bip44Path - path object
 * @returns BIP-044 path
 */
export const makeBip44Path = (
  coinType: number,
  bip44Path: Bip44Path
): string => {
  const { account, change, index } = bip44Path;
  return `m/44'/${coinType}'/${account}'/${change}'/${index}'`;
};

/**
 * Return a properly formatted Sapling path
 * @param coinType - SLIP-044 Coin designation
 * @param account - numbered from index 
 in sequentially increasing manner. Defined as in BIP 44
 * @returns Sapling path
 */
export const makeSaplingPath = (coinType: number, account: number): string => {
  return `m/32'/${coinType}'/${account}'`;
};

/**
 * Return a properly formatted Sapling path array
 * @param coinType - SLIP-044 Coin designation
 * @param account - numbered from index 
 in sequentially increasing manner. Defined as in BIP 44
 * @returns Sapling path array
 */
export const makeSaplingPathArray = (
  coinType: number,
  account: number
): Uint32Array => {
  return new Uint32Array([32, coinType, account]);
};
