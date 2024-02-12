import { fromHex, toHex } from "@cosmjs/encoding";
import { sha256 } from "node-forge";

/**
 * Validate solution
 *
 * @param {Uint8Array} solution
 * @param {number} difficulty
 * @returns {boolean}
 */
export const isValidPow = (
  solution: Uint8Array,
  difficulty: number
): boolean => {
  for (let i = 0; i < difficulty; i++) {
    if (solution[i] !== 0) {
      return false;
    }
  }
  return true;
};

/**
 * Provided an integer, convert to bytes and pad
 *
 * @param {number} int
 * @returns {Uint8Array}
 */
export const getSolutionBytes = (int: number): Uint8Array => {
  const buffer = new ArrayBuffer(64);
  const view = new DataView(buffer, 60, 4);
  view.setInt32(0, int, false);

  // Return solution byte array
  return new Uint8Array(buffer);
};

/**
 * Compute proof of work solution
 *
 * @param {string} challenge
 * @param {number} difficulty
 * @returns {Uint8Array}
 */
export const computePowSolution = (
  challenge: string,
  difficulty: number
): string => {
  let i = 0;
  let solution: string = "";

  while (i >= 0) {
    const solutionBytes = getSolutionBytes(i);

    const solutionByteString = String.fromCharCode.apply(null, [
      ...solutionBytes,
    ]);
    const challengeByteString = String.fromCharCode.apply(null, [
      ...fromHex(challenge),
    ]);

    const hasher = sha256.create();
    hasher.update(challengeByteString);
    hasher.update(solutionByteString);

    const digestHex = hasher.digest().toHex();
    const hash = fromHex(digestHex);
    const isValid = isValidPow(hash, difficulty);

    if (isValid) {
      solution = toHex(solutionBytes);
      break;
    }

    i += 1;
  }
  return solution;
};
