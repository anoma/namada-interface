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
        data-testid="setup-import-keys-use-passphrase-button"
        className="text-xs !text-neutral-400"
        onClick={() => setShowOptions(!showOptions)}
        type="button" // makes enter key ignore this and submit form
      >
        Advanced
      </LinkButton>
      {showOptions && <div>{children}</div>}
    </div>
  );
};
