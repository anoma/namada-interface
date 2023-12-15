import { KeyListItem } from "@namada/components";
import { AccountType } from "@namada/types";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/KeyListItem",
  component: KeyListItem,
  argTypes: {
    alias: {
      control: "text",
    },
    type: {
      control: { type: "select" },
      options: Object.keys(AccountType),
    },
    dropdownPosition: {
      control: { type: "select" },
      options: ["top", "bottom"],
    },
  },
};

type Story = StoryObj<typeof KeyListItem>;

export const Default: Story = {
  args: {
    as: "div",
    alias: "Lorem Ipsum Dolor Sit",
    type: AccountType.Mnemonic,
    dropdownPosition: "top",
    isMainKey: true,
    onRename: () => {},
    onDelete: () => {},
    onViewAccount: () => {},
    onSelectAccount: () => {},
    onViewRecoveryPhrase: () => {},
  },
};
