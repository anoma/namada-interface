import { Stack, ToggleButton } from "@namada/components";
import { SettingsPanelMenuItem } from "./SettingsPanelMenuItem";
import SettingsRoutes from "./routes";

export const SettingsMain = (): JSX.Element => {
  return (
    <div className="flex flex-1 justify-between flex-col">
      <ul className="flex flex-col gap-2">
        <SettingsPanelMenuItem
          url={`${SettingsRoutes.currencySelection().url}`}
          text="Currency"
        />
        <SettingsPanelMenuItem
          url={`${SettingsRoutes.advanced().url}`}
          text="Advanced"
        />
      </ul>

      <Stack as="footer" gap={2.5}>
        <h2 className="text-base">Sign Arbitrary Message</h2>
        <p className="text-sm">
          Enabling this setting puts you at risk of phishing attacks. Please
          check what you are signing very carefully when using this feature. We
          recommend keeping this setting turned off unless absolutely necessary
        </p>
        <ToggleButton
          label="Off (Recommended)"
          checked={true}
          onChange={() => {}}
        />
      </Stack>
    </div>
  );
};
