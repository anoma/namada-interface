import {
  AES,
  Argon2,
  Argon2Params,
  ByteSize,
  Rng,
  Salt,
  VecU8Pointer,
} from "@anoma/crypto";
import { AccountType, Bip44Path } from "@anoma/types";
import { Argon2Config } from "config";
import { CryptoRecord, KdfType, KeyStore } from "./types";
import { readVecU8Pointer } from "@anoma/crypto/src/utils";

type CryptoArgs = {
  alias: string;
  address: string;
  owner: string;
  chainId: string;
  path: Bip44Path;
  id: string;
  parentId?: string;
  password: string;
  text: string;
  type: AccountType;
};

export class Crypto {
  public encrypt(args: CryptoArgs): KeyStore {
    const {
      address,
      owner,
      alias,
      chainId,
      path,
      id,
      parentId,
      password,
      text,
      type,
    } = args;

    const { params, key, iv, salt } = this.encryptionParams(password);
    const cipherText = this.encryptWithAES(key, iv, text);
    const crypto = this.cryptoRecord(cipherText, params, iv, salt);

    return {
      alias,
      address,
      owner,
      chainId,
      id,
      parentId,
      path,
      crypto,
      type,
    };
  }

  private cryptoRecord(
    cipherText: Uint8Array,
    { m_cost, t_cost, p_cost }: Argon2Params,
    iv: Uint8Array,
    salt: string
  ): CryptoRecord {
    return {
      cipher: {
        type: "aes-256-gcm",
        iv,
        text: cipherText,
      },
      kdf: {
        type: KdfType.Argon2,
        params: {
          m_cost,
          t_cost,
          p_cost,
          salt,
        },
      },
    };
  }

  public encryptAuthKey(password: string, uuid: string): CryptoRecord {
    const { params, key, iv, salt } = this.encryptionParams(password);
    const cipherText = this.encryptWithAES(key, iv, uuid);
    return this.cryptoRecord(cipherText, params, iv, salt);
  }

  public decrypt(
    crypto: CryptoRecord,
    password: string,
    cryptoMemory: WebAssembly.Memory
  ): string {
    const { cipher, kdf } = crypto;
    const { m_cost, t_cost, p_cost, salt } = kdf.params;

    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);

    const newKey = new Argon2(password, salt, argon2Params).key();

    const aes = new AES(newKey, cipher.iv);
    const vecU8Pointer = aes.decrypt(cipher.text);
    const decrypted = readVecU8Pointer(vecU8Pointer, cryptoMemory);
    const plainText = new TextDecoder().decode(decrypted);

    aes.free();
    vecU8Pointer.free();

    return plainText;
  }

  private encryptionParams(password: string): {
    params: Argon2Params;
    key: VecU8Pointer;
    salt: string;
    iv: Uint8Array;
  } {
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

  private encryptWithAES(
    key: VecU8Pointer,
    iv: Uint8Array,
    plainText: string
  ): Uint8Array {
    const aes = new AES(key, iv);
    const cipherText = aes.encrypt(plainText);
    aes.free();

    return cipherText;
  }
}
