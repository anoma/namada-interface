import {
  AES,
  Argon2,
  Argon2Params,
  ByteSize,
  Rng,
  Salt,
  readVecU8Pointer,
} from "@namada/crypto";
import { Argon2Config } from "index";
import { CryptoRecord, EncryptionParams, KdfType } from "./types";

/**
 * Class Crypto handles AES encryption tasks
 */
export class Crypto {
  /**
   * @param cryptoMemory - WebAssembly Memory for crypto
   */
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) {}

  /**
   * Encrypt string using AES and Argon2
   * @param params - Encryption params
   * @param  plainText - data to be encrypted
   * @returns crypto record
   */
  encrypt(params: EncryptionParams, plainText: string): CryptoRecord {
    const { key, iv, params: argon2Params } = params;
    const aes = new AES(key, iv);
    const cipherText = aes.encrypt(plainText);
    aes.free();

    return {
      kdf: {
        type: KdfType.Argon2,
        params: argon2Params,
      },
      cipher: {
        type: "aes-256-gcm",
        iv,
        text: cipherText,
      },
    };
  }

  /**
   * @param cipherText - Uint8Array of encrypted bytes
   * @param params - parameters for encryption
   * @param password - password
   * @returns decrypted text
   */
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
   * @param password - required for generating password hash
   * @param argonParams - optionally specify Argon2 params, otherwise use default
   * @returns encryption parameters
   */
  public makeEncryptionParams(
    password: string,
    argonParams?: typeof Argon2Config
  ): EncryptionParams {
    const saltInstance = Salt.generate();

    const salt = saltInstance.as_string();
    saltInstance.free();

    const { m_cost, t_cost, p_cost } = argonParams || Argon2Config;
    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const argon2 = new Argon2(password, salt, argon2Params);
    const params = argon2.params();
    const key = argon2.key();
    argon2.free();

    const iv = Rng.generate_bytes(ByteSize.N12);

    return { params, key, salt, iv };
  }
}
