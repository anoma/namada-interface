import { Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useUserHasAccount";
import { useAtomValue } from "jotai";

export const ConnectBanner = ({
  disconnectedText,
  missingAccountText,
}: {
  disconnectedText: string;
  missingAccountText: string;
}): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const hasAccount = useUserHasAccount();

  if (!isConnected || hasAccount === false) {
    return (
      <Panel className="border border-yellow py-3">
        <div className="grid grid-cols-[auto_max-content] items-center pl-15">
          <div className="w-full text-yellow text-xl">
            {!isConnected ?
              disconnectedText
            : !hasAccount ?
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
