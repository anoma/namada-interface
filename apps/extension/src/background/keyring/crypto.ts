import { AES, Argon2, Argon2Params, ByteSize, Rng, Salt } from "@anoma/crypto";
import { AccountType, Bip44Path } from "@anoma/types";
import { Argon2Config } from "config";
import { KdfType, KeyStore } from "./types";
import { readVecU8Pointer } from "@anoma/crypto/src/utils";

type CryptoArgs = {
  alias: string;
  address: string;
  xvk: string;
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
      xvk,
      alias,
      chainId,
      path,
      id,
      parentId,
      password,
      text,
      type,
    } = args;
    const saltInstance = Salt.generate();
    const salt = saltInstance.as_string();
    const { m_cost, t_cost, p_cost } = Argon2Config;
    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const argon2 = new Argon2(password, salt, argon2Params);
    const params = argon2.params();
    const key = argon2.key();

    const iv = Rng.generate_bytes(ByteSize.N12);
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(text);

    saltInstance.free();
    argon2.free();
    aes.free();

    return {
      alias,
      address,
      xvk,
      chainId,
      id,
      parentId,
      path,
      crypto: {
        cipher: {
          type: "aes-256-gcm",
          iv,
          text: encrypted,
        },
        kdf: {
          type: KdfType.Argon2,
          params: {
            m_cost: params.m_cost,
            t_cost: params.t_cost,
            p_cost: params.p_cost,
            salt,
          },
        },
      },
      type,
    };
  }

  public decrypt(
    store: KeyStore,
    password: string,
    cryptoMemory: WebAssembly.Memory
  ): string {
    const { crypto } = store;
    const { cipher, kdf } = crypto;
    const { m_cost, t_cost, p_cost, salt } = kdf.params;

    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);

    const newKey = new Argon2(password, salt, argon2Params).key();

    const aes = new AES(newKey, cipher.iv);
    const vecU8Pointer = aes.decrypt(cipher.text);
    const decrypted = readVecU8Pointer(vecU8Pointer, cryptoMemory);
    const phrase = new TextDecoder().decode(decrypted);

    aes.free();
    vecU8Pointer.free();

    return phrase;
  }
}
