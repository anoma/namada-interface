import { Tokens } from "constants/";
import Accounts from "./Accounts";

const MNEMONIC_24 =
  // eslint-disable-next-line max-len
  "caught pig embody hip goose like become worry face oval manual flame pizza steel viable proud eternal speed chapter sunny boat because view bullet";

describe("Accounts class", () => {
  test("It should derive a child pub/priv key from mnemonic", async () => {
    const accounts = await new Accounts(MNEMONIC_24).init();
    const type = 0;
    const symbol = "BTC";

    const child1 = accounts.new(symbol);
    const child2 = accounts.new(symbol);

    expect(child1.secret).toBe("F4bWCLdKybk4DGtphKo1DCKTVQTryEzMMcLFGmatNUhW");
    expect(child2.secret).toBe("EeRD8M8ShT1gkDiT7xQTz8CzpakoX9CHhgJdRWWshLQC");
    expect(accounts.accounts[type].length).toBe(2);
  });

  test("It should return a hexadecimal seed from mnemonic phrase", async () => {
    const accounts = await new Accounts(MNEMONIC_24).init();
    const { seed } = accounts;

    expect(seed).toBe(
      // eslint-disable-next-line max-len
      "B240A0A82144543F0089791D422F7B244026A0EC5D26359DA9772A99BC50D195335CFBA896DC464EE61098A055F87352B77E60703AEEE63F59EF00FAA3A9A6AE"
    );
  });

  test("makePath should return a correct base derivation path", () => {
    const expectedBtc = "m/44'/0'/0'/0";
    const pathBtc = Accounts.makePath(Tokens["BTC"].type);
    expect(pathBtc).toBe(expectedBtc);

    const expectedEth = "m/44'/60'/0'/0";
    const pathEth = Accounts.makePath(Tokens["ETH"].type);
    expect(pathEth).toBe(expectedEth);

    const expected = "m/44'/60'/1'/1";
    const path = Accounts.makePath(Tokens["ETH"].type, 1, 1);
    expect(path).toBe(expected);
  });
});
