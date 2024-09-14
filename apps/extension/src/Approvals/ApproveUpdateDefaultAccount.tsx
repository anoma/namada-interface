import {
  ActionButton,
  Alert,
  Checkbox,
  GapPatterns,
  Stack,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { PageHeader } from "App/Common";
import { SubmitUpdateDefaultAccountMsg } from "background/approvals";
import clsx from "clsx";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

export const ApproveUpdateDefaultAccount: React.FC = () => {
  const requester = useRequester();
  const params = useQuery();
  const address = params.get("address");
  const alias = params.get("alias");

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
        <div className="text-yellow">
          <Alert type="warning">Approve update default account?</Alert>
          <div
            className={clsx(
              "flex items-center gap-3 mt-4",
              "px-4 py-3 bg-neutral-900 rounded-md"
            )}
          >
            <div className="text-yellow">
              <Checkbox checked readOnly />
            </div>
            <div className="leading-[1.2]">
              <div className="text-base text-white">{alias}</div>
              <p className="text-sm text-neutral-400 font-medium">
                {address && shortenAddress(address, 24)}
              </p>
            </div>
          </div>
        </div>
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
