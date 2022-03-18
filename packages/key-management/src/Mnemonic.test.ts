import { Mnemonic, MnemonicLength } from "./Mnemonic";

test("mnemonic should have a correct length", async () => {
  const mnemonic1 = await Mnemonic.fromMnemonic(MnemonicLength.Twelve);
  expect(mnemonic1.value.split(" ")).toHaveLength(12);

  const mnemonic2 = await Mnemonic.fromMnemonic(MnemonicLength.TwentyFour);
  expect(mnemonic2.value.split(" ")).toHaveLength(24);
});
