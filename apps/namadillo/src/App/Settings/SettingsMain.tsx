import { routes } from "App/routes";
import { GoLinkExternal } from "react-icons/go";
import { version as sdkVersion } from "../../../../../packages/sdk/package.json";
import { version } from "../../../package.json";
import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";

const { VITE_REVISION: revision = "" } = import.meta.env;

export const SettingsMain = (): JSX.Element => {
  return (
    <div className="flex flex-1 justify-between flex-col w-full">
      <ul className="flex flex-col gap-2">
        <SettingsPanelMenuItem url={routes.settingsAdvanced} text="Advanced" />
        <SettingsPanelMenuItem
          url={routes.settingsSignArbitrary}
          text="Sign Arbitrary"
        />
      </ul>
      <div className="text-xs">
        <div>Namadillo Version: {version}</div>
        <div>
          <span>Revision: </span>
          <a
            href={`https://github.com/anoma/namada-interface/commit/${revision}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {revision.substring(0, 8)}{" "}
            <GoLinkExternal className="inline h-2.5 w-2.5" />
          </a>
        </div>
        <div>SDK Version: {sdkVersion}</div>
      </div>
    </div>
  );
};
