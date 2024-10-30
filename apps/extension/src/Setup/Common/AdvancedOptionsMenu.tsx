import { Alert, LinkButton, Stack } from "@namada/components";
import { Bip44Path } from "@namada/types";
import clsx from "clsx";
import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
  const menuText: Record<Option, string> = {
    [Option.Menu]: "",
    [Option.Path]: "Set Custom Derivation Path",
    [Option.Passphrase]: "Import with BIP39 Passphrase",
  };

  const menuItemStyle =
    "relative flex flex-row p-4 pb-4 rounded-md bg-gray text-white block";

  return (
    <>
      {option === Option.Menu && (
        <Stack
          as="ul"
          gap={2}
          direction="vertical"
          className="[&_button]:text-white [&_button]:w-full [&_div]:w-full"
        >
          <li className={menuItemStyle}>
            <LinkButton
              onClick={() => setOption(Option.Path)}
              className="flex items-center"
            >
              {menuText[Option.Path]}
              <FaChevronRight className="absolute right-0" />
            </LinkButton>
          </li>
          <li className={menuItemStyle}>
            <LinkButton
              onClick={() => setOption(Option.Passphrase)}
              className="flex items-center"
              data-testid="setup-import-keys-use-passphrase-button"
            >
              {menuText[Option.Passphrase]}
              <FaChevronRight className="absolute right-0" />
            </LinkButton>
          </li>
        </Stack>
      )}
      {option !== Option.Menu && (
        <Alert type="info">
          <div className="relative flex items-center">
            <i
              className={clsx(
                "flex absolute items-center text-white cursor-pointer",
                "top-0 left-0 text-[22px] transition-colors hover:text-yellow active:top-px"
              )}
              onClick={() => {
                setOption(Option.Menu);
              }}
            >
              <FaChevronLeft />
            </i>
            <div className="text-white w-full text-center">
              {menuText[option]}
            </div>
          </div>
          {option === Option.Path && (
            <Bip44Form path={path} setPath={setPath} />
          )}
          {option === Option.Passphrase && (
            <Bip39PassphraseForm
              passphrase={passphrase}
              setPassphrase={setPassphrase}
            />
          )}
        </Alert>
      )}
    </>
  );
};
