import { ToggleButton } from "@namada/components";
import { IconTooltip } from "App/Common/IconTooltip";
import { routes } from "App/routes";
import {
  indexerHeartbeatAtom,
  maspIndexerHeartbeatAtom,
  settingsAtom,
  updateSettingsProps,
} from "atoms/settings";
import { useAtomValue } from "jotai";
import { FaInfo } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";
import { version as sdkVersion } from "../../../../../packages/sdk/package.json";
import { version } from "../../../package.json";
import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";

const { VITE_REVISION: revision = "" } = import.meta.env;

export const SettingsMain = (): JSX.Element => {
  const indexerHealth = useAtomValue(indexerHeartbeatAtom);
  const maspIndexerHealth = useAtomValue(maspIndexerHeartbeatAtom);
  const settingsMutation = useAtomValue(updateSettingsProps);
  const settings = useAtomValue(settingsAtom);

  return (
    <div className="flex flex-1 justify-between flex-col w-full">
      <ul className="flex flex-col gap-2">
        {settings.advancedMode && (
          <SettingsPanelMenuItem
            url={routes.settingsAdvanced}
            text="Advanced"
          />
        )}
        {settings.advancedMode && (
          <SettingsPanelMenuItem
            url={routes.settingsSignArbitrary}
            text="Sign Arbitrary"
          />
        )}
        <SettingsPanelMenuItem url={routes.settingsMASP} text="MASP" />
        <SettingsPanelMenuItem url={routes.settingsLedger} text="Ledger" />
      </ul>
      <div className="text-xs">
        <div className="relative mb-4 flex items-center gap-2 max-w-full">
          <ToggleButton
            onChange={() => {
              settingsMutation.mutateAsync({
                key: "advancedMode",
                value: !settings.advancedMode,
              });
            }}
            label="PRO mode"
            checked={settings.advancedMode}
            activeColor="yellow"
            color="white"
            containerProps={{ className: "[&_span]:order-3 gap-3" }}
          />
          <span className="text-yellow relative group/tooltip py-3 -my-1.5">
            <IconTooltip
              icon={<FaInfo />}
              text={
                <>
                  PRO mode unlocks more technically advanced features in
                  Namadillo that replicates the UX of the CLI. You can learn
                  more about these features{" "}
                  <a
                    href="https://docs.namada.net/users"
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="hover:text-yellow underline"
                  >
                    here
                  </a>
                </>
              }
              tooltipPosition="top"
              className="bg-transparent border border-yellow"
              tooltipClassName="block left-2 top-0"
            />
          </span>
        </div>
        <div>
          Namadillo Version:{" "}
          {version && (
            <a
              href={`https://github.com/anoma/namada-interface/releases/tag/namadillo%40v${version}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {version ?? "-"}{" "}
              <GoLinkExternal className="inline h-2.5 w-2.5 -mt-0.5" />
            </a>
          )}
        </div>
        <div>
          Indexer Version:{" "}
          {indexerHealth?.data?.version && (
            <a
              href={`https://github.com/anoma/namada-indexer/releases/tag/v${indexerHealth?.data?.version}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {indexerHealth?.data?.version ?? "-"}{" "}
              <GoLinkExternal className="inline h-2.5 w-2.5 -mt-0.5" />
            </a>
          )}
        </div>
        <div>
          Masp Indexer Version:{" "}
          {maspIndexerHealth?.data?.version && (
            <a
              href={`https://github.com/anoma/namada-masp-indexer/releases/tag/v${maspIndexerHealth?.data?.version}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {maspIndexerHealth?.data?.version ?? "-"}{" "}
              <GoLinkExternal className="inline h-2.5 w-2.5 -mt-0.5" />
            </a>
          )}
        </div>
        <div>
          SDK Version:{" "}
          <a
            href="https://docs.namada.net/integrating-with-namada/sdk"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {sdkVersion ?? "-"}{" "}
            <GoLinkExternal className="inline h-2.5 w-2.5 -mt-0.5" />
          </a>
        </div>
        <div>
          <span>Revision: </span>
          <a
            href={`https://github.com/anoma/namada-interface/commit/${revision}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {revision.substring(0, 8)}{" "}
            <GoLinkExternal className="inline h-2.5 w-2.5 -mt-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
