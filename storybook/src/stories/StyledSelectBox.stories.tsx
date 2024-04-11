import { StyledSelectBox } from "@namada/components";
import { useArgs } from "@storybook/preview-api";
import type { StoryFn, StoryObj } from "@storybook/react";

export default {
  title: "Components/StyledSelectBox",
  component: StyledSelectBox,
  argTypes: {},
};

type Story = StoryObj<typeof StyledSelectBox>;

const getCurrencySymbol = (symbol: string): React.ReactNode => (
  <span className="mr-2 w-6 h-6 rounded-full bg-yellow text-black flex justify-center items-center">
    {symbol}
  </span>
);

export const Default: Story = {
  args: {
    id: "currency",
    options: [
      {
        id: "usd",
        value: <>{getCurrencySymbol("$")} USD</>,
        ariaLabel: "US Dollar",
      },
      {
        id: "eur",
        value: <>{getCurrencySymbol("€")} EUR</>,
        ariaLabel: "Euros",
      },
    ],
    name: "default-select",
    value: "usd",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
    },
  },
  decorators: [
    (Story: StoryFn, context) => {
      const [, setArgs] = useArgs<typeof context.args>();

      const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setArgs({ value: e.target.value });
      };

      return (
        <div className="text-white">
          <Story args={{ ...context.args, onChange }} />
        </div>
      );
    },
  ],
};
