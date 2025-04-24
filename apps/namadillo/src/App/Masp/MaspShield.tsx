import { Panel } from "@namada/components";
import { IbcTransfer } from "App/Ibc/IbcTransfer";
import { NamadaTransferTopHeader } from "App/NamadaTransfer/NamadaTransferTopHeader";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useState } from "react";
import { namadaAsset } from "utils";
import { MaspInternalShield } from "./MaspInternalShield";
import { ShieldingOptionCard } from "./ShieldingOptionCard";

type ShieldingOption = "ibc" | "internal" | null;

export const MaspShield: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<ShieldingOption>(null);

  // If no option is selected, show the selection screen
  if (selectedOption === null) {
    return (
      <Panel className="relative rounded-none">
        <header className="flex flex-col items-center text-center mb-6 gap-6">
          <h1 className="mt-6 text-lg text-yellow">Shield Assets</h1>
          <h2 className="text-sm">Select an option to shield your assets</h2>
        </header>

        <div className="flex justify-center gap-8 pt-4 pb-8">
          <ShieldingOptionCard
            title="IBC Shield"
            icon={<img src={wallets.keplr.iconUrl} className="w-full" />}
            onClick={() => setSelectedOption("ibc")}
          >
            Shield external assets over IBC to Namada
          </ShieldingOptionCard>

          <div className="w-px bg-white -my-1" />

          <ShieldingOptionCard
            title="Internal Shield"
            icon={
              <span className="flex w-full bg-yellow rounded-md">
                <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
              </span>
            }
            onClick={() => setSelectedOption("internal")}
          >
            Shield Assets from your Namada transparent account
          </ShieldingOptionCard>
        </div>
      </Panel>
    );
  }

  // Show the selected shielding option component
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
          <h1 className="-mt-8 text-lg text-yellow">Shielding Transfer</h1>
          <h2 className="text-sm">
            Shield IBC assets into Namada&apos;s Shieldpool
          </h2>
        </header>
        <IbcTransfer />
      </Panel>
    );
  }

  // Internal shield option
  return (
    <Panel className="relative rounded-none">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <button
          className="self-start px-4 py-1 rounded-md text-yellow hover:bg-gray-800 transition-colors"
          onClick={() => setSelectedOption(null)}
        >
          ← Back
        </button>
        <h1 className="-mt-8 text-lg text-yellow">Shielding Transfer</h1>
        <NamadaTransferTopHeader
          isSourceShielded={false}
          isDestinationShielded={true}
        />
        <h2 className="text-sm">Shield assets into Namada&apos;s Shieldpool</h2>
      </header>
      <MaspInternalShield />
    </Panel>
  );
};
