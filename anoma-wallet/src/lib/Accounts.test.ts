import Accounts from "./Accounts";

const MNEMONIC_24 =
  // eslint-disable-next-line max-len
  "caught pig embody hip goose like become worry face oval manual flame pizza steel viable proud eternal speed chapter sunny boat because view bullet";

describe("Accounts class", () => {
  test("It should derive a child pub/priv key from mnemonic", async () => {
    const accounts = await new Accounts(MNEMONIC_24).init();
    const child1 = accounts.new("BTC");
    const child2 = accounts.new("BTC");

    expect(child1.xpriv).toBe(
      "196333f1a97e7377acc1464bfb2b9f943953cd06b7bf11986784abcb1cfa13be"
    );

    expect(child2.xpriv).toBe(
      "4842036c5cf0f7f55c2825a16567e7d360888f17ca7fedbb34189191798a7d67"
    );
  });
});
