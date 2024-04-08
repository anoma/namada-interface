import { Currency } from "@namada/components"; // Adjust the import path to where your Box component is located
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "Components/Currency",
  component: Currency,
  argTypes: {},
} as Meta;

type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: {
    currency: "nam",
    amount: 1000.56,
    spaceAroundSign: true,
    separator: "",
    currencyPosition: "right",
    currencySignClassName: "text-xl font-light",
    baseAmountClassName: "text-3xl",
    fractionClassName: "text-sm opacity-20",
    className: "font-medium",
    onClick: () => alert("You can use events"),
  },
};
