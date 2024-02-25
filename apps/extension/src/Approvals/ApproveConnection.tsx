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
  const interfaceTabId = params.get("interfaceTabId");

  const handleResponse = async (allowConnection: boolean): Promise<void> => {
    if (interfaceTabId && interfaceOrigin) {
      await requester.sendMessage(
        Ports.Background,
        new ConnectInterfaceResponseMsg(
          parseInt(interfaceTabId),
          interfaceOrigin,
          allowConnection
        )
      );
      closeCurrentTab();
    }
  };

  return (
    <Stack full gap={GapPatterns.TitleContent} className="pt-4 pb-8">
      <PageHeader title="Approve Request" />
      <Stack full className="justify-between" gap={12}>
        <Alert type="warning">
          Approve connection for <strong>{interfaceOrigin}</strong>?
        </Alert>
        <Stack gap={2}>
          <ActionButton borderRadius="sm" onClick={() => handleResponse(true)}>
            Approve
          </ActionButton>
          <ActionButton
            borderRadius="sm"
            outlined
            onClick={() => handleResponse(false)}
          >
            Reject
          </ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};
