import { ActionButton, Alert, GapPatterns, Stack } from "@namada/components";
import { NamadaChains } from "@namada/types";
import { PageHeader } from "App/Common";
import {
  CheckIsApprovedSiteMsg,
  ConnectInterfaceResponseMsg,
} from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { useContext, useEffect, useState } from "react";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { ExtensionLockContext } from "./Approvals";

export const ApproveConnection: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const interfaceOrigin = params.get("interfaceOrigin")!;
  const chainId = params.get("chainId")!;
  const { isUnlocked } = useContext(ExtensionLockContext);
  const [isApproved, setIsApproved] = useState<boolean>();

  const chainIdentifier = NamadaChains.get(chainId);

  const checkIsApproved = async (): Promise<void> => {
    requester
      .sendMessage(
        Ports.Background,
        new CheckIsApprovedSiteMsg(interfaceOrigin, chainId)
      )
      .then((isApproved) => {
        setIsApproved(isApproved);
        if (isApproved) {
          // Go ahead and connect as this domain is already approved
          void handleResponse(true);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  useEffect(() => {
    if (isUnlocked) {
      // Test to see if domain is already approved
      void checkIsApproved();
    }
  }, [isUnlocked]);

  const handleResponse = async (allowConnection: boolean): Promise<void> => {
    await requester.sendMessage(
      Ports.Background,
      new ConnectInterfaceResponseMsg(
        interfaceOrigin,
        allowConnection,
        chainId || undefined
      )
    );
    await closeCurrentTab();
  };

  return (
    <Stack full gap={GapPatterns.TitleContent} className="pt-4 pb-8">
      {typeof isApproved !== "undefined" && !isApproved && (
        <>
          <PageHeader title="Approve Request" />
          <Stack full className="justify-between" gap={12}>
            <Alert type="warning">
              Approve connection for <strong>{interfaceOrigin}</strong>
              {chainId && (
                <>
                  {" "}
                  and enable signing for{" "}
                  {chainIdentifier ?
                    <>
                      <strong>{chainIdentifier}</strong> ({chainId})
                    </>
                  : <strong>{chainId}</strong>}
                </>
              )}
              ?
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
        </>
      )}
    </Stack>
  );
};
