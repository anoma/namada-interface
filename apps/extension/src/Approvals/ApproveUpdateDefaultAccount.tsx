import { ActionButton, Alert, GapPatterns, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { SubmitUpdateDefaultAccountMsg } from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

export const ApproveUpdateDefaultAccount: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const address = params.get("address");

  const handleResponse = async (approved: boolean): Promise<void> => {
    if (address && approved) {
      await requester.sendMessage(
        Ports.Background,
        new SubmitUpdateDefaultAccountMsg(address)
      );
    }
    await closeCurrentTab();
  };

  return (
    <Stack full gap={GapPatterns.TitleContent} className="pt-4 pb-8">
      <PageHeader title="Approve Request" />
      <Stack full className="justify-between" gap={12}>
        <Alert type="warning">
          Approve update the default account to <strong>{address}</strong>?
        </Alert>
        <Stack gap={2}>
          <ActionButton onClick={() => handleResponse(true)}>
            Approve
          </ActionButton>
          <ActionButton
            outlineColor="yellow"
            onClick={() => handleResponse(false)}
          >
            Reject
          </ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};
