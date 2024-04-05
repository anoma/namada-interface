import { Argon2Params as Argon2ParamsWasm, VecU8Pointer } from "@namada/crypto";

export const Argon2Config = {
  // Number of memory blocks in kibibytes
  // Max: 268_435_455
  // Min: 8
  // https://www.rfc-editor.org/rfc/rfc9106.html#name-recommendations
  m_cost: 65536, // 65536 KiB equals 64MiB
  // Number of iterations (time)
  // Max: 4_294_967_29
  // Min: 1
  t_cost: 3,
  // Number of threads (degree of parallelism)
  // Max: 16_777_215
  // Min: 1
  p_cost: 1,
};

type KdfParams = {
  salt: string;
};

export type Argon2Params = KdfParams & {
  m_cost: number;
  t_cost: number;
  p_cost: number;
  salt: string;
};

export type EncryptionParams = {
  params: Argon2ParamsWasm;
  key: VecU8Pointer;
  salt: string;
  iv: Uint8Array;
};

export enum KdfType {
  Argon2 = "argon2",
  Scrypt = "scrypt",
}

export type CryptoRecord<T = Argon2Params> = {
  cipher: {
    type: "aes-256-gcm";
    iv: Uint8Array;
    text: Uint8Array;
  };
  kdf: {
    type: KdfType;
    params: T;
  };
};
