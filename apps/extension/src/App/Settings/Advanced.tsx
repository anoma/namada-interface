import { GapPatterns, Stack, ToggleButton } from "@namada/components";
import { PageHeader } from "App/Common";
import { useSettingsContext } from "context";

export const Advanced = (): JSX.Element => {
  const { showDisposableAccounts, toggleShowDisposableAccounts } =
    useSettingsContext();

  return (
    <Stack gap={GapPatterns.TitleContent} full>
      <PageHeader title="Advanced" />

      <ToggleButton
        onChange={toggleShowDisposableAccounts}
        label="Disposable refund target"
        checked={showDisposableAccounts}
        activeColor="yellow"
        color="white"
        containerProps={{
          className:
            "w-full justify-between text-base font-medium text-white p-5 bg-neutral-900 rounded-md",
        }}
      />
    </Stack>
  );
};
