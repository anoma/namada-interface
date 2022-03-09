import { Tokens } from "constants/";
import Wallet from "./Wallet";

const MNEMONIC_24 =
  // eslint-disable-next-line max-len
  "caught pig embody hip goose like become worry face oval manual flame pizza steel viable proud eternal speed chapter sunny boat because view bullet";

describe("Wallet class", () => {
  test("It should derive the correct public keys from mnemonic", async () => {
    const walletBtc = await new Wallet(MNEMONIC_24, "BTC").init();
    const child1 = walletBtc.new();
    const child2 = walletBtc.new();

    expect(child1.publicKey).toBe(
      "02ac3900403f7d59537edb3694abbdb7f9d334f4fe64ba27dc6b41dc7e298d0dc6"
    );
    expect(child2.publicKey).toBe(
      "02a2bfde72171d5e78f23e9bf91a3a40493ba0685281afaa93f9d8222dec923d80"
    );
    expect(walletBtc.accounts[Tokens["BTC"].type].length).toBe(2);

    const walletEth = await new Wallet(MNEMONIC_24, "ETH").init();
    const child3 = walletEth.new();
    const child4 = walletEth.new();
    const child5 = walletEth.new();

    expect(child3.publicKey).toBe(
      "0332331c814be320962dcfeea877e489b0c34c4ab72ac8970c42fb7fedc5e0c437"
    );
    expect(child4.publicKey).toBe(
      "037cd72f4365235646e0864a3fd4835cec554940facbdb8ed1dee5d19aad0664b0"
    );
    expect(child5.publicKey).toBe(
      "038a6d7ef037260bf6f362e0c530b041d99be2c3283e529f18a5e5e76875cd052a"
    );
    expect(walletEth.accounts[Tokens["ETH"].type].length).toBe(3);
  });

  test("Wallet should return correct BIP39 hexadecimal seed from mnemonic", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    expect(wallet.seed).toBe(
      // eslint-disable-next-line max-len
      "b240a0a82144543f0089791d422f7b244026a0ec5d26359da9772a99bc50d195335cfba896dc464ee61098a055f87352b77e60703aeee63f59ef00faa3a9a6ae"
    );
  });

  test("Wallet should produce the correct BIP32 Root Key and extended keys", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    const { root_key, xpriv, xpub } = wallet.serialized;

    expect(root_key).toBe(
      // eslint-disable-next-line max-len
      "xprv9s21ZrQH143K2nNmvrGtqZCbH6yQuqeH3r8vnQwpREXdvUYn6q52CcLryyzXn7fP6CLqct57zWGdXaYWwPTZh6DhdSeriaNSD8FNZpjCjYC"
    );
    expect(xpriv).toBe(
      // eslint-disable-next-line max-len
      "xprv9zjJ1S9riY38bWqL7oGqdXi6r5E35grYZSxiyQB1zwBey3PJXo4wXZhv19YDL7Km23wzG3PCnNdUGsntEcFrVFqNoKYD5NA2tYZTvgt9Fjx"
    );
    expect(xpub).toBe(
      // eslint-disable-next-line max-len
      "xpub6DieQwgkYubRozuoDpoqzfeqQ74XV9aPvftKmnadZGidqqiT5LPC5N2PrS8KYaoLMk851qkp3JbnveTtmSXRGyoRwhT5QSMiko3mek4ZsWH"
    );
  });

  test("Wallet.makePath should return a correct base derivation path", () => {
    const expectedBtc = "m/44'/0'/0'/0";
    const pathBtc = Wallet.makePath({ type: Tokens["BTC"].type });
    expect(pathBtc).toBe(expectedBtc);

    const expectedEth = "m/44'/60'/0'/0";
    const pathEth = Wallet.makePath({ type: Tokens["ETH"].type });
    expect(pathEth).toBe(expectedEth);

    const expected = "m/44'/60'/1'/1";
    const path = Wallet.makePath({
      type: Tokens["ETH"].type,
      account: 1,
      change: 1,
    });
    expect(path).toBe(expected);
  });
});
