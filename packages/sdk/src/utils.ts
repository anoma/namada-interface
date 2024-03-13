import { Bip44Path } from "@namada/types";

/**
 * Return a properly formatted BIP-044 path array
 * @param {number} coinType - SLIP-044 Coin designation
 * @param {Bip44Path} path - path object
 * @returns {string} BIP-044 path array
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
 * @param {number} coinType - SLIP-044 Coin designation
 * @param {Bip44Path} bip44Path - path object
 * @returns {string} BIP-044 path
 */
export const makeBip44Path = (
  coinType: number,
  bip44Path: Bip44Path
): string => {
  const { account, change, index } = bip44Path;
  return `m/44'/${coinType}'/${account}'/${change}'/${index}'`;
};
