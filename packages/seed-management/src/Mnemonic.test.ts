import { Mnemonic, MnemonicLength } from "./Mnemonic";
import { AnomaClient } from "@namada-interface/anoma-lib";

test("mnemonic should have a correct length", async () => {
  const mnemonic1 = await Mnemonic.fromMnemonic(MnemonicLength.Twelve);
  expect(mnemonic1.phrase.split(" ")).toHaveLength(12);

  const mnemonic2 = await Mnemonic.fromMnemonic(MnemonicLength.TwentyFour);
  expect(mnemonic2.phrase.split(" ")).toHaveLength(24);
});

test("Mnemonic class should encrypt and decrypt correctly", async () => {
  const { mnemonic } = await new AnomaClient().init();

  const PHRASE_LENGTH = 12;
  const PASSWORD = "test password";
  const mnemonic12 = mnemonic.new(PHRASE_LENGTH);
  const phrase = mnemonic12.phrase();
  const encrypted = mnemonic12.to_encrypted(PASSWORD);
  const decrypted = mnemonic.from_encrypted(encrypted, PASSWORD);

  expect(decrypted.phrase()).toBe(phrase);
  expect(decrypted).not.toEqual(mnemonic12);
});
