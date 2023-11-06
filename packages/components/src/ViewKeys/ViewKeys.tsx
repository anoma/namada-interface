import {
  ActionButton,
  Input,
  InputVariants,
  Stack,
  Textarea,
} from "@namada/components";
import {
  DownloadPanel,
  WarningPanel,
  WarningPanelTitle,
} from "./ViewKeys.components";

type ViewKeysProps = {
  publicKeyAddress: string;
  transparentAccountAddress: string;
  shieldedAccountAddress: string;
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
    <Stack as="section" gap={8}>
      <Stack gap={4}>
        <Input
          label="Public Key"
          variant={InputVariants.ReadOnlyCopy}
          value={publicKeyAddress}
          theme={"primary"}
        />
        <Input
          label="Your Transparent Account"
          variant={InputVariants.ReadOnlyCopy}
          value={transparentAccountAddress}
          theme={"primary"}
        />
        <Textarea
          label="Your Shielded Account"
          readOnly={true}
          value={shieldedAccountAddress}
          theme={"secondary"}
          sensitive={true}
        />
        {viewingKeys && (
          <DownloadPanel>
            Viewing keys of shielded account
            <ActionButton size="base" variant="secondary">
              Download
            </ActionButton>
          </DownloadPanel>
        )}
      </Stack>
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
    </Stack>
  );
};
