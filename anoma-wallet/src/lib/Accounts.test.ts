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

    expect(child1.secret).toBe("3Tn2kt9c96AX8nqZR5LV2iWg6bWu1a8mHpWz5d7qat1o");
    expect(child2.secret).toBe("H7W2wHC2ogC2vMW8Xqk8cDJdxgwwqMjBx6723rDb8bP3");
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
});
