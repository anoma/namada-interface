import { Stack } from "@namada/components";
import { SelectModal } from "App/Common/SelectModal";
import clsx from "clsx";
import { Chain } from "types";

type SelectChainModalProps = {
  onClose: () => void;
  chains: Chain[];
};

export const SelectChainModal = ({
  onClose,
  chains,
}: SelectChainModalProps): JSX.Element => {
  return (
    <SelectModal title="Select Source Chain" onClose={onClose}>
      <Stack as="ul">
        {chains.map((chain) => (
          <li key={chain.chainId}>
            <button
              className={clsx(
                "grid grid-cols-[30px_auto] w-full px-6 py-2.5 rounded-sm border",
                "hover:border-neutral-400"
              )}
            >
              <img src={chain.iconUrl} />
              <span>{chain.name}</span>
            </button>
          </li>
        ))}
      </Stack>
    </SelectModal>
  );
};
