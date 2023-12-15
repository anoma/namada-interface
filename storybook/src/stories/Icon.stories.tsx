import { Icon, icons } from "@namada/components/src/Icon";
import type { StoryFn, StoryObj } from "@storybook/react";

export default {
  title: "Components/Icon",
  component: Icon,
  argTypes: {},
};

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    size: "sm",
    fill: false,
    stroke: true,
  },
  decorators: [
    (_Story: StoryFn, context) => {
      const keys = Object.keys(icons) || [];
      return (
        <div className="grid grid-cols-12 grid-rows-[40px] gap-4">
          {keys.map((iconKey) => (
            <span key={`icon-key-${iconKey}`} className="hover:text-cyan">
              <Icon
                name={iconKey}
                size={context.args.size}
                fill={context.args.fill}
                stroke={context.args.fill}
              />
            </span>
          ))}
        </div>
      );
    },
  ],
};
