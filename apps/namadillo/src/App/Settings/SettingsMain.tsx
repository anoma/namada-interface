import { routes } from "App/routes";
import { version } from "../../../package.json";
import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";

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
      </div>
    </div>
  );
};
