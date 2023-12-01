import { ActionButton, GapPatterns, Input, Stack } from "@namada/components";
import { InputVariants } from "../Input/types";
import {
  DownloadPanel,
  WarningPanel,
  WarningPanelTitle,
} from "./ViewKeys.components";

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
    <Stack as="section" gap={GapPatterns.TitleContent}>
      <Stack gap={GapPatterns.FormFields}>
        {publicKeyAddress && (
          <Input
            label="Public Key"
            variant={InputVariants.ReadOnlyCopy}
            value={publicKeyAddress}
            theme={"primary"}
          />
        )}
        {transparentAccountAddress && (
          <Input
            label="Your Transparent Address"
            variant={InputVariants.ReadOnlyCopy}
            value={transparentAccountAddress}
            theme={"primary"}
          />
        )}
        {shieldedAccountAddress && (
          <Input
            label="Your Shielded Address"
            variant={InputVariants.ReadOnlyCopy}
            readOnly={true}
            value={shieldedAccountAddress}
            theme={"secondary"}
          />
        )}
        {viewingKeys && (
          <DownloadPanel>
            Viewing keys of shielded account
            <ActionButton size="base" variant="secondary">
              Download
            </ActionButton>
          </DownloadPanel>
        )}
      </Stack>
      {(viewingKeys || footer) && (
        <Stack as="footer" gap={4}>
          {viewingKeys && (
            <WarningPanel>
              <WarningPanelTitle>
                BEFORE SHARING YOUR VIEWING KEYS
              </WarningPanelTitle>
              <p>
                Note that ANYONE with your viewing keys can see the assets,
                transaction value, memo field and receiver address of all
                transactions received by or sent by the corresponding shielded
                account.
              </p>
            </WarningPanel>
          )}
          {footer}
        </Stack>
      )}
    </Stack>
  );
};
