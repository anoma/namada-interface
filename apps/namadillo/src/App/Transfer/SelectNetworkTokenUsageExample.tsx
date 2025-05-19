import { useState } from "react";
import { Address } from "types";
import { SelectNetworkToken } from "./SelectNetworkToken";

// Type definition can be imported from a shared types file
type Token = {
  address: Address;
  symbol: string;
  name: string;
  amount: string;
  value: string;
  icon?: string;
  network?: string;
};

/**
 * Example component showing how to use the SelectNetworkToken modal
 * This is for demonstration purposes only - copy the pattern into your own component
 */
export const SelectNetworkTokenUsage = (): JSX.Element => {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to store the selected token
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Handler for when a token is selected
  const handleTokenSelect = (token: Token): void => {
    // Store the selected token
    setSelectedToken(token);

    // Close the modal
    setIsModalOpen(false);

    // Do something with the token (e.g., initiate a transfer, navigate to a page, etc.)
    console.log("Selected token:", token);
  };

  return (
    <div>
      {/* Button to open the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-yellow text-black rounded-md"
      >
        Select a Token
      </button>

      {/* Display selected token info */}
      {selectedToken && (
        <div className="mt-4 p-4 border border-neutral-700 rounded-md">
          <h3 className="text-lg text-white mb-2">Selected Token:</h3>
          <p className="text-white">Symbol: {selectedToken.symbol}</p>
          <p className="text-white">Name: {selectedToken.name}</p>
          <p className="text-white">Amount: {selectedToken.amount}</p>
          <p className="text-white">Value: {selectedToken.value}</p>
        </div>
      )}

      {/* The token selection modal */}
      <SelectNetworkToken
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleTokenSelect}
      />
    </div>
  );
};
