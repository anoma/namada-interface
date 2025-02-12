import React from "react";

import { chains } from "@namada/chains";
import { Alert, Input, LinkButton, Stack } from "@namada/components";
import { Zip32Path } from "@namada/types";

type Props = {
  path: Zip32Path;
  setPath: (path: Zip32Path) => void;
};

const Zip32Form: React.FC<Props> = ({ path, setPath }) => {
  const { coinType } = chains.namada.bip44;

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const result = e.target.value.replace(/\D/g, "") || "0";
    setPath({
      account: parseInt(result),
    });
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const parentDerivationPath = `m/32'/${coinType}'/`;

  const handleReset = (): void => {
    setPath({ account: 0 });
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
              ZIP32 Path
              <div className="flex w-full justify-start items-center pt-2">
                <span className="h-px px-1 text-xs text-neutral-300">
                  {parentDerivationPath}
                </span>
                <Input
                  type="number"
                  className="w-60"
                  min="0"
                  value={path.account}
                  onChange={handleNumericChange}
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

export default Zip32Form;
