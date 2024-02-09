import { fromHex, toHex } from "@cosmjs/encoding";
import { sha256 } from "node-forge";
import {
  ChallengeResponse,
  Data,
  SettingsResponse,
  TransferResponse,
} from "./types";
/**
 * Wrapper for fetch requests to handle ReadableStream response when errors are received from API
 */
export async function request<T = unknown>(
  url: string,
  options: RequestInit = { method: "GET" }
): Promise<T> {
  return (await fetch(new URL(url), {
    ...options,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      const reader = response?.body?.getReader();
      return reader
        ?.read()
        .then((data) =>
          Promise.reject(JSON.parse(new TextDecoder().decode(data.value)))
        );
    })
    .catch((e) => {
      console.error(e);
      return Promise.reject(e);
    })) as T;
}

/**
 * Request faucet settings
 */
export const requestSettings = async (
  url: string
): Promise<SettingsResponse> => {
  return request(`${url}/setting`);
};

/**
 * Request challenge from endpoint url
 *
 * @param {string} url
 * @returns Object
 */
export const requestChallenge = async (
  url: string,
  publicKey: string
): Promise<ChallengeResponse> => {
  return request(`${url}/challenge/${publicKey}`);
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
): Promise<TransferResponse> => {
  return request(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
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

export * from "./types";
