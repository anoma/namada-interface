import { useNavigate } from "react-router-dom";

import { ActionButton, GapPatterns, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { SignArbitraryDetails } from "Approvals/Approvals";

type Props = {
  details: SignArbitraryDetails;
};

export const ApproveSignArbitraryDetails: React.FC<Props> = ({ details }) => {
  const navigate = useNavigate();

  const displayData = (data: string): string => {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch (_) {
      // Not JSON, return raw data
      return data;
    }
  };

  return (
    <Stack full gap={GapPatterns.TitleContent} className="text-white pt-4 pb-8">
      <PageHeader title="Approve Sign Arbitrary Request" />
      <pre>{displayData(details.data)}</pre>
      <Stack gap={2}>
        <ActionButton borderRadius="sm" onClick={() => navigate(-1)}>
          Back
        </ActionButton>
      </Stack>
    </Stack>
  );
};
