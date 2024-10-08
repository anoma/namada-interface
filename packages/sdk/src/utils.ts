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
  const { account, change = 0, index = 0 } = path;
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
  const { account, change = 0, index = 0 } = bip44Path;
  return `m/44'/${coinType}'/${account}'/${change}'/${index}'`;
};

/**
 * Return a properly formatted Sapling path (Zip32)
 * @param coinType - SLIP-044 Coin designation
 * @param account - numbered from index 0 in sequentially increasing manner. Defined as in BIP 44
 * @param [index] - optional index for additional keys under account. Defined as in BIP 44
 * @returns Sapling path
 */
export const makeSaplingPath = (
  coinType: number,
  account: number,
  index?: number
): string => {
  let path = `m/32'/${coinType}'/${account}'`;
  if (typeof index === "number") path += `/${index}`;
  return path;
};

/**
 * Return a properly formatted Sapling path array (Zip32)
 * @param coinType - SLIP-044 Coin designation
 * @param account - numbered from index 0 in sequentially increasing manner. Defined as in BIP 44
 * @param [index] - optional index for additional keys under account. Defined as in BIP 44
 * @returns Sapling path array
 */
export const makeSaplingPathArray = (
  coinType: number,
  account: number,
  index?: number
): Uint32Array => {
  const pathArray = [32, coinType, account];
  if (typeof index === "number") pathArray.push(index);
  return new Uint32Array(pathArray);
};
