import { ActionButton, Alert, GapPatterns, Stack } from "@namada/components";
import { Chain } from "@namada/types";
import { PageHeader } from "App/Common";
import { ConnectInterfaceResponseMsg } from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { GetChainMsg } from "provider";
import { useEffect, useState } from "react";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

export const ApproveConnection: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const interfaceOrigin = params.get("interfaceOrigin");
  const chainId = params.get("chainId") || undefined;
  const [chain, setChain] = useState<Chain>();

  const fetchChain = async (): Promise<Chain> => {
    const chainResponse = await requester.sendMessage(
      Ports.Background,
      new GetChainMsg()
    );
    return chainResponse;
  };

  useEffect(() => {
    if (chainId) {
      fetchChain()
        .then((chain) => {
          setChain(chain);
        })
        .catch((e) => console.error(e));
    }
  }, [chainId]);

  const handleResponse = async (allowConnection: boolean): Promise<void> => {
    if (interfaceOrigin) {
      await requester.sendMessage(
        Ports.Background,
        new ConnectInterfaceResponseMsg(
          interfaceOrigin,
          allowConnection,
          chainId
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
          Approve connection for <strong>{interfaceOrigin}</strong>?
        </Alert>
        {chainId && chain && chain.chainId !== chainId && (
          <Alert type="warning">Enable signing for {chainId}?</Alert>
        )}
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
