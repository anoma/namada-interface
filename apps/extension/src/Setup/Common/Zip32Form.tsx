import React from "react";

import { chains } from "@namada/chains";
import { Input } from "@namada/components";
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

  return (
    <label className="text-base font-medium text-neutral-300">
      Shielded Path
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
  );
};

export default Zip32Form;
