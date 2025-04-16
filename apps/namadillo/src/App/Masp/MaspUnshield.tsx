import { Panel, Stack } from "@namada/components";
import { IbcWithdraw } from "App/Ibc/IbcWithdraw";
import { NamadaTransferTopHeader } from "App/NamadaTransfer/NamadaTransferTopHeader";
import clsx from "clsx";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useState } from "react";
import { namadaAsset } from "utils";

type UnshieldingOptionCardProps = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
};

const UnshieldingOptionCard = ({
  title,
  icon,
  children,
  onClick,
}: UnshieldingOptionCardProps): JSX.Element => {
  return (
    <Stack
      gap={6}
      onClick={onClick}
      className={clsx(
        "w-[220px] h-full items-stretch pb-8 pt-2.5 px-4 border rounded-md border-transparent transition-colors cursor-pointer",
        "items-center text-white text-center hover:border-yellow"
      )}
    >
      <h3 className="text-xl font-medium">{title}</h3>
      <aside className="max-w-[78px]">{icon}</aside>
      <div className="text-base/tight">{children}</div>
    </Stack>
  );
};

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
          <UnshieldingOptionCard
            title="IBC Unshield"
            icon={<img src={wallets.keplr.iconUrl} className="w-full" />}
            onClick={() => setSelectedOption("ibc")}
          >
            Unshield assets to external chains over IBC
          </UnshieldingOptionCard>

          <div className="w-px bg-white -my-1" />

          <UnshieldingOptionCard
            title="Internal Unshield"
            icon={
              <span className="flex w-full bg-yellow rounded-md">
                <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
              </span>
            }
            onClick={() => setSelectedOption("internal")}
          >
            Unshield assets to your Namada transparent account
          </UnshieldingOptionCard>
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
            Unshield assets to an external chain over IBC
          </h2>
        </header>
        <IbcWithdraw shielded={false} />
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
      <IbcWithdraw shielded={true} />
    </Panel>
  );
};
