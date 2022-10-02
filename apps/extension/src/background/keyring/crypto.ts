import { AES, Argon2, Argon2Params, ByteSize, Rng, Salt } from "@anoma/crypto";
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

    const iv = Rng.generate_bytes(ByteSize.N12);
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(text);

    return {
      alias,
      id,
      path: bip44Path,
      crypto: {
        cipher: {
          type: "aes-256-gcm",
          iv,
          text: encrypted,
        },
        kdf: {
          type: KdfTypes.Argon2,
          params: { ...params, salt },
        },
      },
    };
  }

  public decrypt(store: KeyStore, password: string): Uint8Array {
    const { crypto } = store;
    const { cipher, kdf } = crypto;
    const { m_cost, t_cost, p_cost, salt } = kdf.params;

    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);

    const { key: newKey } = new Argon2(
      password,
      salt,
      argon2Params
    ).to_serialized();

    const aes = new AES(newKey, cipher.iv);

    return aes.decrypt(cipher.text);
  }
}
