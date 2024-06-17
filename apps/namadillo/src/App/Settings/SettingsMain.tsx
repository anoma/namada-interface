import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";
import SettingsRoutes from "./routes";

export const SettingsMain = (): JSX.Element => {
  return (
    <div className="flex flex-1 justify-between flex-col pb-4">
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
    </div>
  );
};
