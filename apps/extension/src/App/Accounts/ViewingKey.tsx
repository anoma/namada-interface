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
          Your viewing key grants the holder the ability to see all your
          balances and transaction data. Please keep it secure to protect your
          data.
        </p>
        <Input
          label="Viewing Key"
          variant="ReadOnlyCopyText"
          readOnly={true}
          rows={10}
          valueToDisplay={viewingKey}
          value={viewingKey}
          theme="secondary"
          className="pb-20 [&_textarea]:py-2"
        />
      </Stack>
      <ActionButton size="md" onClick={() => navigate(-1)}>
        Close
      </ActionButton>
    </>
  );
};
