import { ActionButton, AmountSummaryCard, Image } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/AmountSummaryCard",
  component: AmountSummaryCard,
  argTypes: {},
};

type Story = StoryObj<typeof AmountSummaryCard>;

export const Default: Story = {
  args: {
    as: "div",
    logoElement: <Image imageName="LogoMinimal" />,
    title: "Available NAM to Stake",
    mainAmount: "315 NAM",
    alternativeAmount: "$100.34",
    className: "bg-rblack border-yellow border",
    callToAction: (
      <ActionButton
        className="px-8"
        borderRadius="sm"
        size="xs"
        color="primary"
      >
        Stake
      </ActionButton>
    ),
  },
};
