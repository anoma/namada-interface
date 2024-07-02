import { useNavigate } from "react-router-dom";

import { ActionButton, Stack } from "@namada/components";

import { ApprovalDetails } from "Approvals/Approvals";
type Props = {
  details: ApprovalDetails;
};

export const ApproveSignTxDetails: React.FC<Props> = ({ details }) => {
  const navigate = useNavigate();

  return (
    <Stack className="text-white" gap={4}>
      <Stack gap={1}>
        <pre>{JSON.stringify(details.txDetails, null, 2)}</pre>
      </Stack>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={() => navigate(-1)}>Back</ActionButton>
      </Stack>
    </Stack>
  );
};
