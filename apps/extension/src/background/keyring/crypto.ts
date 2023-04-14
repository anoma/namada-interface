import { AES, Argon2, Argon2Params, ByteSize, Rng, Salt } from "@anoma/crypto";
import { AccountType, Bip44Path } from "@anoma/types";
import { Argon2Config } from "config";
import { KdfType, KeyStore } from "./types";

type CryptoArgs = {
  alias?: string;
  address: string;
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
      alias,
      chainId,
      path,
      id,
      parentId,
      password,
      text,
      type,
    } = args;
    const salt = Salt.generate().as_string();
    const { m_cost, t_cost, p_cost } = Argon2Config;
    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const argon2 = new Argon2(password, salt, argon2Params);
    const { params, key } = argon2.to_serialized();

    const iv = Rng.generate_bytes(ByteSize.N12);
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(text);
    aes.free();

    return {
      alias,
      address,
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
          params: { ...params, salt },
        },
      },
      type,
    };
  }

  public decrypt(store: KeyStore, password: string): string {
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
    const decrypted = aes.decrypt(cipher.text);
    aes.free();

    return new TextDecoder().decode(decrypted);
  }
}
