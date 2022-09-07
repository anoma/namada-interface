import { init, AEAD, Bip44, Mnemonic, PhraseSize } from "@anoma/crypto";

const initWasm = async () => {
  await init();
  console.log(PhraseSize.Twelve, PhraseSize.TwentyFour);
  const password = "My_Very_$Ecure_PAssW0rd!";
  const encrypted = AEAD.encrypt("Encrypt my secret message", password);
  const decrypted = AEAD.decrypt(encrypted, password);
  console.log({ encrypted, decrypted });

  const mnemonic = Mnemonic.new(PhraseSize.TwentyFour);
  console.log({ mnemonic });

  const seed = mnemonic.to_bytes();
  const path = "m/44'/0'/0'/0";
  const bip44 = Bip44.new(seed);
  const account = bip44.derive(path);
  console.log({ bip44, account });
};

initWasm();
