import { useNavigate } from "react-router-dom";

import { TxType, TxTypeLabel } from "@heliax/namada-sdk/web";
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
        <pre>
          {JSON.stringify(
            {
              ...details.txDetails,
              commitments: details.txDetails.commitments.map((cmt) => ({
                ...cmt,
                txType: TxTypeLabel[cmt.txType as TxType],
              })),
            },
            null,
            2
          )}
        </pre>
      </Stack>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={() => navigate(-1)}>Back</ActionButton>
      </Stack>
    </Stack>
  );
};
