import { fromHex, toHex } from "@cosmjs/encoding";
import { sha256 } from "node-forge";

type ChallengeResponse = {
  challenge: string;
  tag: string;
};

/**
 * Request challenge from endpoint url
 *
 * @param {string} url
 * @returns Object
 */
export const requestChallenge = async (
  url: string
): Promise<ChallengeResponse> => {
  const response = await fetch(new URL(url), {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        return response.json() as Promise<ChallengeResponse>;
      }
      console.warn(response);
      return Promise.reject(response);
    })
    .catch((e) => {
      console.error(e);
      return Promise.reject(e);
    });

  return response;
};

export type TransferDetails = {
  target: string;
  token: string;
  amount: number;
};

export type Data = {
  solution: string;
  tag: string;
  challenge: unknown;
  transfer: TransferDetails;
};

/**
 * Submit a transfer request
 *
 * @param {string} url
 * @param {Data} data
 * @returns {Object}
 */
export const requestTransfer = async (
  url: string,
  data: Data
): Promise<unknown> => {
  return await fetch(new URL(url), {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.warn(response);
      return Promise.reject(response.type);
    })
    .catch((e) => {
      return Promise.reject(e);
    });
};

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
 * Get padded solution
 *
 * @param {number} int
 * @returns {string}
 */
export const getSolution = (int: number): string => {
  const buffer = new ArrayBuffer(64);
  const view = new DataView(buffer, 60, 4);
  view.setInt32(0, int, false);
  return new TextDecoder().decode(buffer, {});
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
): string | undefined => {
  let i = 0;
  let solution: string = "";

  while (i >= 0) {
    const solutionBytes = getSolution(i);
    const challengeBytes = new TextDecoder().decode(fromHex(challenge));

    const hasher = sha256.create();
    hasher.update(challengeBytes, "raw");
    hasher.update(solutionBytes, "utf8");

    const hash = fromHex(hasher.digest().toHex());
    const isValid = isValidPow(hash, difficulty);

    if (isValid) {
      solution = toHex(new TextEncoder().encode(solutionBytes));
      break;
    }

    i += 1;
  }
  return solution;
};
