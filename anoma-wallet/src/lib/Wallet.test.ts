import { Tokens } from "constants/";
import Wallet from "./Wallet";

const MNEMONIC_24 =
  // eslint-disable-next-line max-len
  "caught pig embody hip goose like become worry face oval manual flame pizza steel viable proud eternal speed chapter sunny boat because view bullet";

describe("Accounts class", () => {
  test("It should derive a child pub/priv key from mnemonic", async () => {
    const accounts = await new Wallet(MNEMONIC_24, "BTC").init();
    const type = 0;

    const child1 = accounts.new();
    const child2 = accounts.new();

    expect(child1.secret).toBe("F4bWCLdKybk4DGtphKo1DCKTVQTryEzMMcLFGmatNUhW");
    expect(child2.secret).toBe("EeRD8M8ShT1gkDiT7xQTz8CzpakoX9CHhgJdRWWshLQC");
    expect(accounts.accounts[type].length).toBe(2);
  });

  test("It should return a hexadecimal seed from mnemonic phrase", async () => {
    const wallet = await new Wallet(MNEMONIC_24, "BTC").init();

    expect(wallet.seed).toBe(
      // eslint-disable-next-line max-len
      "b240a0a82144543f0089791d422f7b244026a0ec5d26359da9772a99bc50d195335cfba896dc464ee61098a055f87352b77e60703aeee63f59ef00faa3a9a6ae"
    );
  });

  test("makePath should return a correct base derivation path", () => {
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
