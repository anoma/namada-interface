import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { WordChip } from "@anoma/components";
import { getTheme } from "@anoma/utils";
import { ExtensionRequester } from "../extension";
import { GenerateMnemonicMsg } from "../background/keyring";
import { Ports } from "../router";

const requester = new ExtensionRequester();

export const App: React.FC = () => {
  const theme = getTheme(false, false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const results = await requester.sendMessage<GenerateMnemonicMsg>(
        Ports.Background,
        new GenerateMnemonicMsg(24)
      );
      setMnemonic(results);
      console.log({ results });
    })();
  }, []);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <div>
          <h1>Anoma Browser Extension</h1>
          {mnemonic.map((word, i) => (
            <WordChip key={`${i}-${word}`} number={i} text={word} />
          ))}
        </div>
      </ThemeProvider>
    </div>
  );
};
