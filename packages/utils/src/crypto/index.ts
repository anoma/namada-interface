import { sha256 } from "sha.js";
import CryptoJS from "crypto-js";
import base58 from "bs58";

/**
 * Encrypt a string with a password
 */
export const aesEncrypt = (value: string, password: string): string => {
  const key = CryptoJS.enc.Utf8.parse(password);
  const iv = CryptoJS.enc.Utf8.parse(password);
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

/**
 * Decrypt an encrypted string with password
 */
export const aesDecrypt = (encrypted: string, password: string): string => {
  const key = CryptoJS.enc.Utf8.parse(password);
  const iv = CryptoJS.enc.Utf8.parse(password);

  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    throw new Error(`Unable to decrypt value: ${e}`);
  }
};

/**
 * Hash a provided password
 */
export const hashPassword = (password: string): string => {
  const hash = CryptoJS.SHA3(password, { outputLength: 512 });
  return hash.toString(CryptoJS.enc.Base64);
};

/**
 * Create a short base58 encoded hash of a string.
 * Useful for creating URL-friendly hashes of storage
 * values in state.
 */
export const stringToHash = (value: string): string => {
  const hash = CryptoJS.MD5(value);
  return base58.encode(new Uint8Array(hash.words));
};

/**
 * Create sha256 of byte array
 */
export class Hash {
  static sha256(data: Uint8Array): Uint8Array {
    return new Uint8Array(new sha256().update(data).digest());
  }

  static truncHashPortion(
    str: string,
    firstCharCount = str.length,
    endCharCount = 0
  ): string {
    return (
      str.substring(0, firstCharCount) +
      "…" +
      str.substring(str.length - endCharCount, str.length)
    );
  }
}
