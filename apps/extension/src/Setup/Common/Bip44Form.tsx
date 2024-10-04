import React, { useEffect, useState } from "react";

import { chains } from "@namada/chains";
import { Input } from "@namada/components";
import { Bip44Path } from "@namada/types";

type Props = {
  path: Bip44Path;
  setPath: (path: Bip44Path) => void;
};

const Bip44Form: React.FC<Props> = ({ path, setPath }) => {
  const [customPath, setCustomPath] = useState({
    ...path,
    index: 1,
  });
  const { coinType } = chains.namada.bip44;

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof Bip44Path
  ): void => {
    const result = e.target.value.replace(/\D/g, "") || "0";
    setCustomPath({
      ...customPath,
      [key]: parseInt(result),
    });
  };

  useEffect(() => {
    setPath(customPath);
  }, [customPath]);

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const parentDerivationPath = `m/44'/${coinType}'/`;

  return (
    <div className="flex flex-col w-full px-3">
      <div className="mb-2 [&_input]:w-[92%]">
        <div className="my-3">
          <label className="text-base font-medium text-neutral-300">
            <div className="flex w-full justify-start items-center">
              <span className="h-px px-1 text-xs text-neutral-300">
                {parentDerivationPath}
              </span>
              <Input
                type="number"
                min="0"
                value={customPath.account}
                onChange={(e) => handleNumericChange(e, "account")}
                onFocus={handleFocus}
              />
              <i>&apos;/</i>
              <Input
                type="number"
                min="0"
                max="1"
                value={customPath.change}
                onChange={(e) => handleNumericChange(e, "change")}
                onFocus={handleFocus}
              />
              <i>&apos;/</i>
              <Input
                type="number"
                min="0"
                value={customPath.index}
                onChange={(e) => handleNumericChange(e, "index")}
                onFocus={handleFocus}
              />
              <i>&apos;</i>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Bip44Form;
