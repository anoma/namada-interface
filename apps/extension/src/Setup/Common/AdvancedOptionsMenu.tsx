import { LinkButton, Stack } from "@namada/components";
import { Bip44Path } from "@namada/types";
import React, { useState } from "react";
import Bip39PassphraseForm from "./Bip39PassphraseForm";
import Bip44Form from "./Bip44Form";

type Props = {
  passphrase: string;
  path: Bip44Path;
  setPassphrase: (passphrase: string) => void;
  setPath: (path: Bip44Path) => void;
};

export enum Option {
  Menu = "menu",
  Passphrase = "passphrase",
  Path = "path",
}

export const AdvancedOptionsMenu: React.FC<Props> = ({
  passphrase,
  path,
  setPassphrase,
  setPath,
}) => {
  const [option, setOption] = useState(Option.Menu);
  return (
    <>
      {option === Option.Menu && (
        <Stack
          as="ul"
          gap={2}
          direction="vertical"
          className="[&_li]:text-white"
        >
          <li onClick={() => setOption(Option.Path)}>
            Set Custom Derivation Path
          </li>
          <li onClick={() => setOption(Option.Passphrase)}>
            Import with BIP39 Passphrase
          </li>
        </Stack>
      )}
      <div>
        {option !== Option.Menu && (
          <LinkButton
            className="text-white"
            onClick={(e) => {
              e.preventDefault();
              setOption(Option.Menu);
            }}
            role="link"
          >
            &lt; Back
          </LinkButton>
        )}
        {option === Option.Path && <Bip44Form path={path} setPath={setPath} />}
        {option === Option.Passphrase && (
          <Bip39PassphraseForm
            passphrase={passphrase}
            setPassphrase={setPassphrase}
          />
        )}
      </div>
    </>
  );
};
