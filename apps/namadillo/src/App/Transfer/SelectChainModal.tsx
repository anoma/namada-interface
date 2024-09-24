import { Chain, Chains } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { SelectModal } from "App/Common/SelectModal";
import clsx from "clsx";

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
  return (
    <SelectModal title="Select Source Chain" onClose={onClose}>
      {chains.length > 0 && (
        <Stack as="ul">
          {chains.map((chain) => (
            <li key={chain.chain_id}>
              <button
                onClick={() => onSelect(chain)}
                className={clsx(
                  "grid grid-cols-[30px_auto] w-full px-6 py-2.5 rounded-sm border",
                  "hover:border-neutral-400"
                )}
              >
                <img
                  src={chain.logo_URIs?.svg}
                  alt={chain.pretty_name + " logo"}
                />
                <span>{chain.pretty_name}</span>
              </button>
            </li>
          ))}
        </Stack>
      )}
      {chains.length === 0 && <p>There are no available chains</p>}
    </SelectModal>
  );
};
