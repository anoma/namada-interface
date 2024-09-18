import { version } from "../../../package.json";
import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";
import SettingsRoutes from "./routes";

export const SettingsMain = (): JSX.Element => {
  return (
    <div className="flex flex-1 justify-between flex-col">
      <ul className="flex flex-col gap-2">
        <SettingsPanelMenuItem
          url={`${SettingsRoutes.advanced().url}`}
          text="Advanced"
        />
        <SettingsPanelMenuItem
          url={`${SettingsRoutes.signArbitrary().url}`}
          text="Sign Arbitrary"
        />
      </ul>
      <div className="text-xs">
        <div>Namadillo Version: {version}</div>
      </div>
    </div>
  );
};
