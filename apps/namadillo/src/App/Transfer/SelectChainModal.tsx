import { Chain, Chains } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { Search } from "App/Common/Search";
import { SelectModal } from "App/Common/SelectModal";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChainCard } from "./ChainCard";

type SelectChainModalProps = {
  onClose: () => void;
  onSelect: (chain: Chain) => void;
  chains: Chains;
};

export const SelectChainModal = ({
  onClose,
  onSelect,
  chains,
}: SelectChainModalProps): JSX.Element => {
  const [filter, setFilter] = useState("");

  const filteredChains = useMemo(() => {
    return chains.filter((chain) => chain.pretty_name.indexOf(filter) >= 0);
  }, [chains, filter]);

  return (
    <SelectModal title="Select Source Chain" onClose={onClose}>
      <div className="mb-4">
        <Search placeholder="Search chain" onChange={setFilter} />
      </div>
      {filteredChains.length > 0 && (
        <Stack
          as="ul"
          gap={0}
          className="max-h-[300px] overflow-auto dark-scrollbar pb-4 mr-[-0.5rem]"
        >
          {filteredChains.map((chain) => (
            <li key={chain.chain_id}>
              <button
                onClick={() => {
                  onSelect(chain);
                  onClose();
                }}
                className={twMerge(
                  clsx(
                    "w-full rounded-sm border border-transparent",
                    "hover:border-neutral-400 transition-colors duration-150"
                  )
                )}
              >
                <ChainCard chain={chain} />
              </button>
            </li>
          ))}
        </Stack>
      )}
      {filteredChains.length === 0 && <p>There are no available chains</p>}
    </SelectModal>
  );
};
