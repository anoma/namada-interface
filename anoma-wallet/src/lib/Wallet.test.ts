import { Tokens } from "constants/";
import Wallet from "./Wallet";

const MNEMONIC_24 =
  // eslint-disable-next-line max-len
  "caught pig embody hip goose like become worry face oval manual flame pizza steel viable proud eternal speed chapter sunny boat because view bullet";

describe("Wallet class", () => {
  test("It should derive the correct public keys from mnemonic", async () => {
    const walletBtc = await new Wallet(MNEMONIC_24, "BTC").init();
    const child1 = walletBtc.new(0);
    const child2 = walletBtc.new(1);

    expect(child1.publicKey).toBe(
      "02ac3900403f7d59537edb3694abbdb7f9d334f4fe64ba27dc6b41dc7e298d0dc6"
    );
    expect(child2.publicKey).toBe(
      "02a2bfde72171d5e78f23e9bf91a3a40493ba0685281afaa93f9d8222dec923d80"
    );

    const walletEth = await new Wallet(MNEMONIC_24, "ETH").init();
    const child3 = walletEth.new(0);
    const child4 = walletEth.new(1);
    const child5 = walletEth.new(2);

    expect(child3.publicKey).toBe(
      "0332331c814be320962dcfeea877e489b0c34c4ab72ac8970c42fb7fedc5e0c437"
    );
    expect(child4.publicKey).toBe(
      "037cd72f4365235646e0864a3fd4835cec554940facbdb8ed1dee5d19aad0664b0"
    );
    expect(child5.publicKey).toBe(
      "038a6d7ef037260bf6f362e0c530b041d99be2c3283e529f18a5e5e76875cd052a"
    );
  });

  test("Derives the correct addresses and private key WIFs from mnemonic", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    const child1 = wallet.new(0);
    const child2 = wallet.new(1);
    const { address: address1, wif: wif1 } = child1;
    const { address: address2, wif: wif2 } = child2;

    expect(address1).toBe("1Lj43YSQ47b22oRL37LBEmEeMC7nLT3fEb");
    expect(wif1).toBe("L4DrSoPAR7tNrfx91GGejYiGnzEYWfvBhg7BmeLeUPs6QEzpzM6g");

    expect(address2).toBe("17cwJyBe3WMVZwdyMbuZcxX3zcVR4By7h6");
    expect(wif2).toBe("L41p9JoMKCuiF3ro4cihMusszpCCrENM36NWFoEo3sKGeSq9epvH");
  });

  test("Wallet should return correct BIP39 hexadecimal seed from mnemonic", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    expect(wallet.seed).toBe(
      // eslint-disable-next-line max-len
      "b240a0a82144543f0089791d422f7b244026a0ec5d26359da9772a99bc50d195335cfba896dc464ee61098a055f87352b77e60703aeee63f59ef00faa3a9a6ae"
    );
  });

  test("Wallet should produce the correct BIP32 Root Key", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    const { root_key } = wallet.serialized;

    // Bip32 Root Key
    expect(root_key).toBe(
      // eslint-disable-next-line max-len
      "xprv9s21ZrQH143K2nNmvrGtqZCbH6yQuqeH3r8vnQwpREXdvUYn6q52CcLryyzXn7fP6CLqct57zWGdXaYWwPTZh6DhdSeriaNSD8FNZpjCjYC"
    );
  });

  test("Wallet should generate the correct Account Extended Keys", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    const { xpriv, xpub } = wallet.account;

    expect(xpriv).toBe(
      // eslint-disable-next-line max-len
      "xprv9xg3gheKiCPMDqi2SQcAKxJeseeZA9axa44mpErUcgYaU8bLitnb9MpD84K2xF6Ju2kkWtNKP1PvvvAiq8aN3CwR58pJjdWQXQRa769U6sJ"
    );
    expect(xpub).toBe(
      // eslint-disable-next-line max-len
      "xpub6BfQ6DBDYZweSKnVYS9Ah6FPRgV3ZcJowGzNcdG6B25ZLvvVGS6qhA8gyMbqewueUu4sLk2CEPUwFTst1UMcyfm83VQUAQFLXC3AxRLXTEL"
    );
  });

  test("Wallet should generate the correct BIP32 Extended Keys", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();
    const { xpriv, xpub } = wallet.extended;

    // Bip32 Extended Private Key
    expect(xpriv).toBe(
      // eslint-disable-next-line max-len
      "xprv9zjJ1S9riY38bWqL7oGqdXi6r5E35grYZSxiyQB1zwBey3PJXo4wXZhv19YDL7Km23wzG3PCnNdUGsntEcFrVFqNoKYD5NA2tYZTvgt9Fjx"
    );
    // Bip32 Extended Public Key
    expect(xpub).toBe(
      // eslint-disable-next-line max-len
      "xpub6DieQwgkYubRozuoDpoqzfeqQ74XV9aPvftKmnadZGidqqiT5LPC5N2PrS8KYaoLMk851qkp3JbnveTtmSXRGyoRwhT5QSMiko3mek4ZsWH"
    );
  });

  test("Wallet.makePath should return a correct base derivation path", () => {
    const expectedBtc = "m/44'/0'/0'/0";
    const pathBtc = Wallet.makePath({ type: Tokens["BTC"].type, change: 0 });
    expect(pathBtc).toBe(expectedBtc);

    const expectedEth = "m/44'/60'/0'/0";
    const pathEth = Wallet.makePath({ type: Tokens["ETH"].type, change: 0 });
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
