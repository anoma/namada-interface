import { TickedRadioList } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/TickedRadioList",
  component: TickedRadioList,
  argTypes: {},
};

type Story = StoryObj<typeof TickedRadioList>;

export const Default: Story = {
  args: {
    id: "currency-list",
    value: "USD",
    options: [
      {
        text: "USD ($)",
        value: "USD",
      },
      {
        text: "EUR (€)",
        value: "EUR",
      },
      {
        text: "GBP (£)",
        value: "GBP",
      },
      {
        text: "PLN (zł)",
        value: "PLN",
      },
      {
        text: "BRL (R$)",
        value: "BRL",
      },
      {
        text: "PHP (₱)",
        value: "PHP",
      },
      {
        text: "JPY (¥)",
        value: "JPY",
      },
    ],
    onChange: () => {},
  },
};
