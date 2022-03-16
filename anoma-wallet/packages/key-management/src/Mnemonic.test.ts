import { Mnemonic, MnemonicLength } from "./Mnemonic";

test("mnemonic should have a correct length", () => {
  const mnemonic1 = new Mnemonic(MnemonicLength.Twelve);
  expect(mnemonic1.value.split(" ")).toHaveLength(12);

  const mnemonic2 = new Mnemonic(MnemonicLength.TwentyFour);
  expect(mnemonic2.value.split(" ")).toHaveLength(24);
});
