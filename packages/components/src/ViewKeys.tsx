import { ActionButton, GapPatterns, Input, Stack } from "@namada/components";

import { shortenAddress } from "@namada/utils";
import clsx from "clsx";

type ViewKeysProps = {
  publicKeyAddress?: string;
  transparentAccountAddress?: string;
  shieldedAccountAddress?: string;
  viewingKeys?: string;
  footer?: React.ReactNode;
};

export const ViewKeys = ({
  publicKeyAddress,
  transparentAccountAddress,
  shieldedAccountAddress,
  viewingKeys,
  footer,
}: ViewKeysProps): JSX.Element => {
  return (
    <Stack
      className="flex-1 justify-center"
      as="section"
      gap={GapPatterns.TitleContent}
    >
      <Stack gap={GapPatterns.FormFields}>
        {transparentAccountAddress && (
          <Input
            label="Your Transparent Address"
            variant="ReadOnlyCopy"
            valueToDisplay={shortenAddress(transparentAccountAddress, 16)}
            value={transparentAccountAddress}
            theme={"primary"}
          />
        )}
        {publicKeyAddress && (
          <Input
            label="Public Key"
            variant="ReadOnlyCopy"
            valueToDisplay={shortenAddress(publicKeyAddress, 16)}
            value={publicKeyAddress}
            theme={"primary"}
          />
        )}
        {shieldedAccountAddress && (
          <Input
            label="Your Shielded Address"
            variant="ReadOnlyCopy"
            readOnly={true}
            valueToDisplay={shortenAddress(shieldedAccountAddress, 16)}
            value={shieldedAccountAddress}
            theme={"secondary"}
          />
        )}
        {viewingKeys && (
          <div className="text-white flex flex-col text-base font-medium gap-3 text-center">
            Viewing keys of shielded account
            <ActionButton size="md" color="secondary">
              Download
            </ActionButton>
          </div>
        )}
      </Stack>
      {(viewingKeys || footer) && (
        <Stack as="footer" gap={4}>
          {viewingKeys && (
            <aside
              className={clsx(
                "bg-neutral-900 rounded-md text-white font-medium text-base leading-[1.25] px-8 py-5"
              )}
            >
              <strong className="block font-bold text-yellow mb-2 uppercase">
                BEFORE SHARING YOUR VIEWING KEYS
              </strong>
              <p>
                Note that ANYONE with your viewing keys can see the assets,
                transaction value, memo field and receiver address of all
                transactions received by or sent by the corresponding shielded
                account.
              </p>
            </aside>
          )}
          {footer}
        </Stack>
      )}
    </Stack>
  );
};
