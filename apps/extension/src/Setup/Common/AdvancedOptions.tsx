import { LinkButton } from "@namada/components";
import React, { useState } from "react";

type Props = {
  children: React.ReactNode;
};

export const AdvancedOptions: React.FC<Props> = ({ children }) => {
  const [showOptions, setShowOptions] = useState(false);
  return (
    <div
      className={`flex flex-col w-full p-4 rounded-md ${showOptions && "bg-black"}`}
    >
      <LinkButton
        className="text-xs !text-neutral-400"
        onClick={() => setShowOptions(!showOptions)}
        type="button"
      >
        Advanced
      </LinkButton>
      {showOptions && <div>{children}</div>}
    </div>
  );
};
