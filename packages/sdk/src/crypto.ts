import {
  AES,
  Argon2,
  Argon2Params,
  ByteSize,
  Rng,
  Salt,
  VecU8Pointer,
  readVecU8Pointer,
} from "@namada/crypto";

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

export type EncryptionParams = {
  params: Argon2Params;
  key: VecU8Pointer;
  salt: string;
  iv: Uint8Array;
};

/**
 * Class Crypto handles AES encryption tasks
 */
export class Crypto {
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) {}

  /**
   * Encrypt string using AES and Argon2
   * @param {EncryptionParams} params - Encryption parameters
   * @param {string} plainText - data to be encrypted
   * @returns {Uint8Array} encrypted byte array
   */
  encrypt(params: EncryptionParams, plainText: string): Uint8Array {
    const { key, iv } = params;
    const aes = new AES(key, iv);
    const cipherText = aes.encrypt(plainText);
    aes.free();

    return cipherText;
  }

  public decrypt(
    cipherText: Uint8Array,
    params: EncryptionParams,
    password: string
  ): string {
    const {
      salt,
      iv,
      params: { m_cost, t_cost, p_cost },
    } = params;

    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const newKey = new Argon2(password, salt, argon2Params).key();

    const aes = new AES(newKey, iv);
    const vecU8Pointer = aes.decrypt(cipherText);
    const decrypted = readVecU8Pointer(vecU8Pointer, this.cryptoMemory);
    const plainText = new TextDecoder().decode(decrypted);

    aes.free();
    vecU8Pointer.free();

    return plainText;
  }

  /**
   * Construct encryption parameters such as password hash,
   * initialization vector, and salt from provided password
   * @param {string} password - required for generating password hash
   * @returns {EncryptionParams} -
   */
  public makeEncryptionParams(password: string): EncryptionParams {
    const saltInstance = Salt.generate();

    const salt = saltInstance.as_string();
    saltInstance.free();

    const { m_cost, t_cost, p_cost } = Argon2Config;
    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const argon2 = new Argon2(password, salt, argon2Params);
    const params = argon2.params();
    const key = argon2.key();
    argon2.free();

    const iv = Rng.generate_bytes(ByteSize.N12);
    return { params, key, salt, iv };
  }
}
