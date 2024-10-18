import { ActionButton, Alert, GapPatterns, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { ConnectInterfaceResponseMsg } from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

export const ApproveConnection: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const interfaceOrigin = params.get("interfaceOrigin");
  const chainId = params.get("chainId")!;

  const handleResponse = async (allowConnection: boolean): Promise<void> => {
    if (interfaceOrigin) {
      await requester.sendMessage(
        Ports.Background,
        new ConnectInterfaceResponseMsg(
          interfaceOrigin,
          chainId,
          allowConnection
        )
      );
      await closeCurrentTab();
    }
  };

  return (
    <Stack full gap={GapPatterns.TitleContent} className="pt-4 pb-8">
      <PageHeader title="Approve Request" />
      <Stack full className="justify-between" gap={12}>
        <Alert type="warning">
          Approve connection for <strong>{interfaceOrigin}</strong> and enable
          signing for <strong>{chainId}</strong>?
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
