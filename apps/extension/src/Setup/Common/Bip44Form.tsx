import React from "react";

import { chains } from "@namada/chains";
import { Alert, Input, LinkButton, Stack } from "@namada/components";
import { Bip44Path } from "@namada/types";

type Props = {
  path: Bip44Path;
  setPath: (path: Bip44Path) => void;
};

const Bip44Form: React.FC<Props> = ({ path, setPath }) => {
  const { coinType } = chains.namada.bip44;

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof Bip44Path
  ): void => {
    const result = e.target.value.replace(/\D/g, "") || "0";
    setPath({
      ...path,
      [key]: parseInt(result),
    });
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const parentDerivationPath = `m/44'/${coinType}'/`;

  const handleReset = (): void => {
    setPath({ account: 0, change: 0, index: 0 });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="my-3">
        <Alert
          type="info"
          title="Please note"
          className="[&_strong]:normal-case"
        >
          <Stack gap={6}>
            <ul className="text-white list-disc mx-6 [&_button]:text-white">
              <li>
                You can create multiple addresses from one recovery phrase
              </li>
              <li>A lost path cannot be recovered</li>
              <li>
                If you&apos;re unfamiliar with this feature, skip or undo this
                step -{" "}
                <LinkButton
                  className="underline bold"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleReset();
                  }}
                >
                  Reset
                </LinkButton>
              </li>
            </ul>
            <label className="text-base font-medium text-neutral-300">
              HD Derivation Path
              <div className="flex w-full justify-start items-center pt-2">
                <span className="h-px px-1 text-xs text-neutral-300">
                  {parentDerivationPath}
                </span>
                <Input
                  type="number"
                  className="w-60"
                  min="0"
                  value={path.account}
                  onChange={(e) => handleNumericChange(e, "account")}
                  onFocus={handleFocus}
                />
                <i>&apos;/</i>
                <Input
                  type="number"
                  max="1"
                  className="w-60"
                  min="0"
                  value={path.change}
                  onChange={(e) => handleNumericChange(e, "change")}
                  onFocus={handleFocus}
                />
                <i>&apos;/</i>
                <Input
                  type="number"
                  className="w-60"
                  min="0"
                  value={path.index}
                  onChange={(e) => handleNumericChange(e, "index")}
                  onFocus={handleFocus}
                />
                <i>&apos;</i>
              </div>
            </label>
          </Stack>
        </Alert>
      </div>
    </div>
  );
};

export default Bip44Form;
