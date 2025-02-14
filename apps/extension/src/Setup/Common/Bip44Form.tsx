import React from "react";

import { chains } from "@namada/chains";
import { Input } from "@namada/components";
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

  return (
    <div className="flex flex-col w-full">
      <div className="my-3">
        <label className="text-base font-medium text-neutral-300">
          Transparent Path
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
              className="w-60"
              min="0"
              max="1"
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
      </div>
    </div>
  );
};

export default Bip44Form;
