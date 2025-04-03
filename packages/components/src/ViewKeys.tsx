import { ActionButton, GapPatterns, Input, Stack } from "@namada/components";

import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { useState } from "react";

type ViewKeysProps = {
  publicKeyAddress?: string;
  privateKey?: string;
  privateKeyLoading?: boolean;
  transparentAccountAddress?: string;
  transparentAccountPath?: string;
  shieldedAccountAddress?: string;
  shieldedAccountPath?: string;
  viewingKeys?: string;
  footer?: React.ReactNode;
  trimCharacters?: number;
};

const Path = ({ path }: { path: string }): React.ReactNode => (
  <p className="text-white text-xs p-0 ml-2">{path}</p>
);

export const ViewKeys = ({
  publicKeyAddress,
  privateKey,
  privateKeyLoading,
  transparentAccountAddress,
  transparentAccountPath,
  shieldedAccountAddress,
  shieldedAccountPath,
  viewingKeys,
  footer,
  trimCharacters = 16,
}: ViewKeysProps): JSX.Element => {
  const [seeViewingKey, setSeeViewingKey] = useState(false);
  return (
    <Stack
      className="flex-1 justify-center"
      as="section"
      gap={GapPatterns.TitleContent}
    >
      <Stack gap={GapPatterns.FormFields}>
        {transparentAccountAddress && (
          <div>
            <Input
              label="Your Transparent Address"
              variant="ReadOnlyCopy"
              valueToDisplay={shortenAddress(
                transparentAccountAddress,
                trimCharacters
              )}
              value={transparentAccountAddress}
              theme={"primary"}
            />
            {transparentAccountPath && <Path path={transparentAccountPath} />}
          </div>
        )}
        {typeof privateKey !== "undefined" && (
          <Input
            label="Private Key"
            variant="ReadOnlyCopy"
            loading={privateKeyLoading}
            hideIcon={privateKeyLoading}
            sensitive={true}
            valueToDisplay={shortenAddress(privateKey, trimCharacters)}
            value={privateKey}
            theme={"primary"}
          />
        )}
        {publicKeyAddress && (
          <Input
            label="Public Key"
            variant="ReadOnlyCopy"
            valueToDisplay={shortenAddress(publicKeyAddress, trimCharacters)}
            value={publicKeyAddress}
            theme={"primary"}
          />
        )}
        {shieldedAccountAddress && (
          <div>
            <Input
              label="Your Shielded Address"
              variant="ReadOnlyCopy"
              readOnly={true}
              valueToDisplay={shortenAddress(
                shieldedAccountAddress,
                trimCharacters
              )}
              value={shieldedAccountAddress}
              theme={"secondary"}
            />
            {shieldedAccountPath && <Path path={shieldedAccountPath} />}
          </div>
        )}
        {viewingKeys &&
          (seeViewingKey ?
            <Input
              label="Viewing Key"
              variant="ReadOnlyCopy"
              readOnly={true}
              valueToDisplay={shortenAddress(viewingKeys, trimCharacters)}
              value={viewingKeys}
              theme={"secondary"}
            />
          : <div className="text-white flex flex-col text-base font-medium gap-3">
              <ActionButton
                size="md"
                backgroundColor="cyan"
                onClick={() => setSeeViewingKey(true)}
              >
                See Viewing Key
              </ActionButton>
            </div>)}
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
