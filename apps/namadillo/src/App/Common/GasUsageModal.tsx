import { Modal, Stack } from "@namada/components";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { minimumGasPriceAtom } from "slices/fees";
import { gasUsageOptionAtom } from "slices/settings";
import { GasFeeOption } from "./GasFeeOption";

type GasUsageModalProps = {
  onClose: () => void;
};

export const GasUsageModal = ({ onClose }: GasUsageModalProps): JSX.Element => {
  const minimumGasFee = useAtomValue(minimumGasPriceAtom);

  const [gasUsageOption, setGasUsageOption] = useAtom(gasUsageOptionAtom);

  if (!minimumGasFee.isSuccess) {
    return <></>;
  }

  return (
    <Modal onClose={onClose}>
      <form
        className={clsx(
          "fixed bg-black min-w-[550px] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
          "px-6 py-7 border border-neutral-200 rounded-md"
        )}
      >
        <h2 className="text-lg font-bold mb-4">Fee Options</h2>
        <Stack gap={4}>
          <div>
            <ul className="grid grid-cols-3 rounded-sm overflow-hidden">
              <li>
                <GasFeeOption
                  title="Low"
                  priceInNam={minimumGasFee.data}
                  checked={gasUsageOption === "low"}
                  onChange={() => setGasUsageOption("low")}
                />
              </li>
              <li>
                <GasFeeOption
                  title="Average"
                  priceInNam={minimumGasFee.data}
                  checked={gasUsageOption === "average"}
                  onChange={() => setGasUsageOption("average")}
                />
              </li>
              <li>
                <GasFeeOption
                  title="High"
                  priceInNam={minimumGasFee.data}
                  checked={gasUsageOption === "high"}
                  onChange={() => setGasUsageOption("high")}
                />
              </li>
            </ul>
          </div>
        </Stack>
      </form>
    </Modal>
  );
};
