import { ViewKeys } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/ViewKeys",
  component: ViewKeys,
  argTypes: {},
};

type Story = StoryObj<typeof ViewKeys>;

export const Default: Story = {
  args: {
    publicKeyAddress: "public-key-address-123",
    transparentAccountAddress: "transparent-account-123",
    shieldedAccountAddress: "shielded-account-123",
    viewingKeys: "viewing-keys-123",
    footer: "This is the footer",
  },
};
