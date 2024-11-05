import { ActionButton, GapPatterns, Input, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { useNavigate, useParams } from "react-router-dom";

type ViewingKeyParams = {
  viewingKey: string;
};

export const ViewingKey = (): JSX.Element => {
  const navigate = useNavigate();
  const { viewingKey = "" } = useParams<ViewingKeyParams>();
  return (
    <>
      <Stack full gap={GapPatterns.TitleContent}>
        <PageHeader title="Viewing Key" />
        <p className="text-white">
          Your viewing key grants the holder access to all your balances and
          transadction data. Please keep it secure to protect your data.
        </p>
        <Input
          label="Viewing Key"
          variant="ReadOnlyCopyText"
          readOnly={true}
          rows={9}
          valueToDisplay={viewingKey}
          value={viewingKey}
          theme="secondary"
          className="pb-20"
        />
      </Stack>
      <ActionButton size="md" onClick={() => navigate(-1)}>
        Close
      </ActionButton>
    </>
  );
};
