import { ActionButton, Alert, GapPatterns, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { ConnectInterfaceResponseMsg } from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { AllowedPermissions } from "storage";
import { closeCurrentTab } from "utils";

export const ApproveConnection: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const interfaceOrigin = params.get("interfaceOrigin");
  const chainId = params.get("chainId")!;

  const handleResponse = async (
    permissions: AllowedPermissions
  ): Promise<void> => {
    if (interfaceOrigin) {
      await requester.sendMessage(
        Ports.Background,
        new ConnectInterfaceResponseMsg(interfaceOrigin, chainId, permissions)
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
          <ActionButton
            onClick={() =>
              // NOTE: In the future we may want the user to have
              // granular control over what access the extension may
              // have for any particular domain
              handleResponse(["accounts", "proofGenKeys", "signing"])
            }
          >
            Approve
          </ActionButton>
          <ActionButton
            outlineColor="yellow"
            onClick={() => handleResponse([])}
          >
            Reject
          </ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};
