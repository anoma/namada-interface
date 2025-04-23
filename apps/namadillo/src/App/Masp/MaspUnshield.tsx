import { Panel } from "@namada/components";
import { IbcWithdraw } from "App/Ibc/IbcWithdraw";
import { NamadaTransferTopHeader } from "App/NamadaTransfer/NamadaTransferTopHeader";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useState } from "react";
import { namadaAsset } from "utils";
import { MaspInternalUnshield } from "./MaspInternalUnshield";
import { ShieldingOptionCard } from "./ShieldingOptionCard";

type UnshieldingOption = "ibc" | "internal" | null;

export const MaspUnshield: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<UnshieldingOption>(null);

  // If no option is selected, show the selection screen
  if (selectedOption === null) {
    return (
      <Panel className="relative rounded-none">
        <header className="flex flex-col items-center text-center mb-6 gap-6">
          <h1 className="mt-6 text-lg text-yellow">Unshield Assets</h1>
          <h2 className="text-sm">Select an option to unshield your assets</h2>
        </header>

        <div className="flex justify-center gap-8 pt-4 pb-8">
          <ShieldingOptionCard
            title="IBC Unshield"
            icon={<img src={wallets.keplr.iconUrl} className="w-full" />}
            onClick={() => setSelectedOption("ibc")}
          >
            Unshield assets to external chains over IBC
          </ShieldingOptionCard>

          <div className="w-px bg-white -my-1" />

          <ShieldingOptionCard
            title="Internal Unshield"
            icon={
              <span className="flex w-full bg-yellow rounded-md">
                <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
              </span>
            }
            onClick={() => setSelectedOption("internal")}
          >
            Unshield assets to your Namada transparent account
          </ShieldingOptionCard>
        </div>
      </Panel>
    );
  }

  // Show the selected unshielding option component
  if (selectedOption === "ibc") {
    return (
      <Panel className="relative rounded-none">
        <header className="flex flex-col items-center text-center mb-3 gap-6">
          <button
            className="self-start px-8 py-2 rounded-md text-lg text-yellow hover:bg-gray-800 transition-colors"
            onClick={() => setSelectedOption(null)}
          >
            ← Back
          </button>
          <h1 className="-mt-8 text-lg text-yellow">Unshielding Transfer</h1>
          <h2 className="text-sm">
            Transfer Assets to your transparent account or to an external
            wallet. <br />
            This action makes your assets public again
          </h2>
        </header>
        <IbcWithdraw />
      </Panel>
    );
  }

  // Internal unshield option
  return (
    <Panel className="relative rounded-none">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <button
          className="self-start px-4 py-1 rounded-md text-yellow hover:bg-gray-800 transition-colors"
          onClick={() => setSelectedOption(null)}
        >
          ← Back
        </button>
        <h1 className="-mt-8 text-lg text-yellow">Unshielding Transfer</h1>
        <NamadaTransferTopHeader
          isSourceShielded={true}
          isDestinationShielded={false}
        />
        <h2 className="text-sm">
          Unshield assets to your transparent Namada account.
          <br />
          This action makes your assets public again.
        </h2>
      </header>
      <MaspInternalUnshield />
    </Panel>
  );
};
