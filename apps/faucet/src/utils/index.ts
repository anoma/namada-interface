import { fromHex, toHex } from "@cosmjs/encoding";
import { sha256 } from "node-forge";

type ChallengeResponse = {
  challenge: string;
  tag: string;
};

type SettingsResponse = {
  difficulty: number;
  chain_id: string;
  start_at: number;
  tokens_alias_to_address: Record<string, string>;
};

/**
 * Request faucet settings
 */
export const requestSettings = async (
  url: string
): Promise<SettingsResponse> => {
  return await fetch(new URL(`${url}/setting`), {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      const reader = response?.body?.getReader();
      return reader
        ?.read()
        .then(({ value }) =>
          Promise.reject(JSON.parse(new TextDecoder().decode(value)))
        );
    })
    .catch((e) => {
      console.error(e);
      return Promise.reject(e);
    });
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
): Promise<ChallengeResponse | undefined> => {
  const response = await fetch(new URL(`${url}/challenge/${publicKey}`), {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        return response.json() as Promise<ChallengeResponse>;
      }
      const reader = response?.body?.getReader();
      return reader
        ?.read()
        .then(({ value }) =>
          Promise.reject(JSON.parse(new TextDecoder().decode(value)))
        );
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
  challenge_signature: string;
  transfer: TransferDetails;
  player_id: string;
};

export type TransferResponse = {
  amount: number;
  sent: boolean;
  target: string;
  token: string;
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
      // Handle ReadableStream
      const reader = response?.body?.getReader();
      return reader
        ?.read()
        .then(({ value }) =>
          Promise.reject(JSON.parse(new TextDecoder().decode(value)))
        );
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
): string | undefined => {
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
