import { Button, ButtonVariant } from "@namada/components";
import { useQuery } from "hooks";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { ConnectInterfaceResponseMsg } from "background/approvals";

import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

export const ApproveConnection: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const interfaceOrigin = params.get("interfaceOrigin");
  const chainId = params.get("chainId");
  const interfaceTabId = params.get("interfaceTabId");

  const handleResponse = (allowConnection: boolean) => {
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
    <ApprovalContainer>
      <p>
        Approve connection for <strong>{interfaceOrigin}</strong>?
      </p>
      <ButtonContainer>
        <Button
          variant={ButtonVariant.Contained}
          onClick={() => handleResponse(true)}
        >Approve</Button>
        <Button
          variant={ButtonVariant.Contained}
          onClick={() => handleResponse(false)}
        >Reject</Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};
