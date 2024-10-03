import { Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { useAuthenticatedStatus } from "hooks/useAuthenticatedStatus";

export const ConnectBanner = ({
  disconnectedText,
  missingAccountText,
}: {
  disconnectedText: string;
  missingAccountText: string;
}): JSX.Element => {
  const { isExtensionConnected, hasDefaultAccount } = useAuthenticatedStatus();

  if (!isExtensionConnected || !hasDefaultAccount) {
    return (
      <Panel className="border border-yellow py-3">
        <div className="grid grid-cols-[auto_max-content] items-center pl-15">
          <div className="w-full text-yellow text-xl">
            {!isExtensionConnected ?
              disconnectedText
            : !hasDefaultAccount ?
              missingAccountText
            : ""}
          </div>
          <ConnectExtensionButton />
        </div>
      </Panel>
    );
  }

  return <></>;
};
