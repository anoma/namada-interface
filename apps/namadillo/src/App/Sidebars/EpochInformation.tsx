import { Panel } from "@namada/components";
import { chainStatusAtom } from "atoms/chain";
import { settingsAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { TbClockStop } from "react-icons/tb";

export const EpochInformation = (): JSX.Element => {
  const chainStatus = useAtomValue(chainStatusAtom);
  const settings = useAtomValue(settingsAtom);

  if (!chainStatus || !settings.advancedMode) {
    return <></>;
  }

  return (
    <Panel className="py-2">
      <div className="flex gap-3 items-center">
        <i>
          <TbClockStop />
        </i>
        <span className="text-sm">Current Epoch: {chainStatus.epoch}</span>
      </div>
    </Panel>
  );
};
