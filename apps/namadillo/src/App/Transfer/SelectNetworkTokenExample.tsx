import { useState } from "react";
import { Address } from "types";
import { SelectNetworkToken } from "./SelectNetworkToken";

type Token = {
  address: Address;
  symbol: string;
  name: string;
  amount: string;
  value: string;
  icon?: string;
  network?: string;
};

export const SelectNetworkTokenExample = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const handleOpen = (): void => {
    setIsOpen(true);
  };

  const handleClose = (): void => {
    setIsOpen(false);
  };

  const handleSelect = (token: Token): void => {
    setSelectedToken(token);
    setIsOpen(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Token Selection Interface
      </h1>

      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Open Network & Token Selector
      </button>

      {selectedToken && (
        <div className="mt-6 p-4 border border-neutral-700 rounded-lg bg-black">
          <h3 className="text-lg mb-4 text-white">Selected Token:</h3>
          <div className="grid grid-cols-2 gap-2 text-white">
            <div className="font-semibold">Name:</div>
            <div>{selectedToken.name}</div>
            <div className="font-semibold">Symbol:</div>
            <div>{selectedToken.symbol}</div>
            <div className="font-semibold">Amount:</div>
            <div>{selectedToken.amount}</div>
            <div className="font-semibold">Value:</div>
            <div>{selectedToken.value}</div>
            {selectedToken.network && (
              <>
                <div className="font-semibold">Network:</div>
                <div>{selectedToken.network}</div>
              </>
            )}
          </div>
        </div>
      )}

      <SelectNetworkToken
        isOpen={isOpen}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </div>
  );
};
