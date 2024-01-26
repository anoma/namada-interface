import { ActionButton, Alert, Stack } from "@namada/components";
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
    <Stack gap={12}>
      <Alert type="warning">
        Approve connection for <strong>{interfaceOrigin}</strong>?
      </Alert>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={() => handleResponse(true)}>
          Approve
        </ActionButton>
        <ActionButton onClick={() => handleResponse(false)}>
          Reject
        </ActionButton>
      </Stack>
    </Stack>
  );
};
