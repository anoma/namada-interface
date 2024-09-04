import { Alert, GapPatterns, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import clsx from "clsx";

type Props = {
  warnings?: string[];
};

export const Warnings = ({ warnings }: Props): JSX.Element => {
  return (
    <Stack gap={GapPatterns.TitleContent} full>
      <PageHeader title="Warnings" />
      <Stack className="justify-top" full gap={GapPatterns.FormFields}>
        {warnings &&
          warnings.map((warning, i) => (
            <Alert key={i} type="warning" className={clsx("max-w-84")}>
              {warning}
            </Alert>
          ))}
      </Stack>
    </Stack>
  );
};
