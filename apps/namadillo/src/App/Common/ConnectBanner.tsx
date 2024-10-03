import { Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { defaultAccountAtom } from "atoms/accounts";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { useAtomValue } from "jotai";

export const ConnectBanner = ({
  disconnectedText,
  missingAccountText,
}: {
  disconnectedText: string;
  missingAccountText: string;
}): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const account = useAtomValue(defaultAccountAtom);

  const missingAccount = !account.isPending && Boolean(account.data) === false;

  if (!isConnected || missingAccount) {
    return (
      <Panel className="border border-yellow py-3">
        <div className="grid grid-cols-[auto_max-content] items-center pl-15">
          <div className="w-full text-yellow text-xl">
            {!isConnected ?
              disconnectedText
            : missingAccount ?
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
