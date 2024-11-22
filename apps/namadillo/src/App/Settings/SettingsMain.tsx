import { routes } from "App/routes";
import { version as sdkVersion } from "../../../../../packages/sdk/package.json";
import { version } from "../../../package.json";
import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";

const { VITE_GIT_SHORT, VITE_GIT_LONG } = import.meta.env;

export const SettingsMain = (): JSX.Element => {
  return (
    <div className="flex flex-1 justify-between flex-col">
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
          Revision:{" "}
          <a
            href={`https://github.com/anoma/namada-interface/commit/${VITE_GIT_LONG}`}
            target="_blank"
            rel="noreferrer"
          >
            {VITE_GIT_SHORT}
          </a>
        </div>
        <div>SDK Version: {sdkVersion}</div>
      </div>
    </div>
  );
};
