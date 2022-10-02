import { AES, Argon2, Argon2Params, Salt } from "@anoma/crypto";
import { Bip44Path, KdfTypes, KeyStore } from "./types";

export class Crypto {
  public encrypt(
    id: string,
    alias: string,
    password: string,
    text: string,
    bip44Path: Bip44Path
  ): KeyStore {
    const salt = Salt.generate().as_string();
    const argon2 = new Argon2(password, salt);
    const { params, key } = argon2.to_serialized();

    const iv = new Uint8Array(
      Array.from({ length: 12 }, () => Math.floor(Math.random() * 12))
    );
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(text);

    return {
      alias,
      id,
      path: bip44Path,
      crypto: {
        cipher: "aes-256-gcm",
        cipherParams: {
          iv,
        },
        cipherText: encrypted,
        kdf: KdfTypes.Argon2,
        params,
        salt,
      },
    };
  }

  public decrypt(store: KeyStore, password: string): Uint8Array {
    const { crypto } = store;
    const { cipherParams, cipherText, params, salt } = crypto;
    const { m_cost, t_cost, p_cost } = params;

    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);

    const { key: newKey } = new Argon2(
      password,
      salt,
      argon2Params
    ).to_serialized();

    const aes = new AES(newKey, cipherParams.iv);

    return aes.decrypt(cipherText);
  }
}
