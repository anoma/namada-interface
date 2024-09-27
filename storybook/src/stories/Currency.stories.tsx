import { Currency } from "@namada/components"; // Adjust the import path to where your Box component is located
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "Components/Currency",
  component: Currency,
  argTypes: {},
} as Meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    currency: { symbol: "NAM" },
    amount: 1000.56,
    spaceAroundSymbol: true,
    separator: "",
    currencyPosition: "right",
    currencySymbolClassName: "text-xl font-light",
    baseAmountClassName: "text-3xl",
    fractionClassName: "text-sm opacity-20",
    className: "font-medium",
    onClick: () => alert("You can use events"),
  },
};
