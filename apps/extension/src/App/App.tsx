import { useEffect } from "react";
import { ExtensionRequester } from "../extension";
import { GenerateMnemonicMsg } from "../background/keyring";
import { Ports } from "../router";

const requester = new ExtensionRequester();

export const App = () => {
  useEffect(() => {
    (async () => {
      const results = await requester.sendMessage<GenerateMnemonicMsg>(
        Ports.Background,
        new GenerateMnemonicMsg(24)
      );

      console.log({ results });
    })();
  }, []);

  return (
    <div>
      <h1>Anoma Browser Extension</h1>
    </div>
  );
};
