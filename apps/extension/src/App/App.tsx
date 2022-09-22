import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { WordChip, Icon, IconName } from "@anoma/components";
import { Chain } from "@anoma/types";
import { getTheme } from "@anoma/utils";
import { ExtensionRequester } from "extension";
import { GenerateMnemonicMsg } from "background/keyring";
import { GetChainsMsg } from "background/chains";
import { Ports } from "router";

const requester = new ExtensionRequester();

export const App: React.FC = () => {
  const theme = getTheme(false, false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);

  useEffect(() => {
    (async () => {
      const words = await requester.sendMessage<GenerateMnemonicMsg>(
        Ports.Background,
        new GenerateMnemonicMsg(24)
      );
      setMnemonic(words);
      console.log({ mnemonics: words });

      const chainsResult = await requester.sendMessage<GetChainsMsg>(
        Ports.Background,
        new GetChainsMsg()
      );
      setChains(chainsResult);
      console.log({ chains: chainsResult });
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Icon iconName={IconName.Settings} />
        <h1>Anoma Browser Extension</h1>
        <div>
          {chains.map((chain, i) => (
            <div key={`${chain.chainId}-${i}`}>
              Chain #{i + 1}
              <p>{chain.chainName}</p>
              <p>{chain.chainId}</p>
            </div>
          ))}
        </div>
        <div>
          {mnemonic.map((word, i) => (
            <WordChip key={`${i}-${word}`} number={i} text={word} />
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
};
