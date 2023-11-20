import { ActionButton, Alert, Stack } from "@namada/components";
import { ButtonContainer } from "Approvals/Approvals.components";
import { useQuery } from "hooks";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { ConnectInterfaceResponseMsg } from "background/approvals";

export const ApproveConnection: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const interfaceOrigin = params.get("interfaceOrigin");
  const chainId = params.get("chainId");
  const interfaceTabId = params.get("interfaceTabId");

  const handleResponse = (allowConnection: boolean): void => {
    if (interfaceTabId && chainId && interfaceOrigin) {
      requester.sendMessage(
        Ports.Background,
        new ConnectInterfaceResponseMsg(
          parseInt(interfaceTabId),
          chainId,
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
      <ButtonContainer>
        <ActionButton onClick={() => handleResponse(true)}>
          Approve
        </ActionButton>
        <ActionButton onClick={() => handleResponse(false)}>
          Reject
        </ActionButton>
      </ButtonContainer>
    </Stack>
  );
};
