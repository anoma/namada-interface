import { AmountInput } from "@namada/components"; // Adjust the import path to where your Box component is located
import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import BigNumber from "bignumber.js";

export default {
  title: "Components/AmountInput",
  component: AmountInput,
  argTypes: {},
} as Meta;

type Story = StoryObj<typeof AmountInput>;

export const Default: Story = {
  args: {
    maxDecimalPlaces: 5,
    min: new BigNumber(0),
    max: new BigNumber("1000000"),
    autoFocus: true,
  },
  decorators: [
    (Story, ctx) => {
      const [, setArgs] = useArgs<typeof ctx.args>();
      return (
        <Story
          args={{
            ...ctx.args,
            onChange: (e) => setArgs({ value: e.target.value }),
          }}
        />
      );
    },
  ],
};
