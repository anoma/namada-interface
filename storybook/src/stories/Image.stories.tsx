import { Image } from "@namada/components";
import type { StoryFn, StoryObj } from "@storybook/react";

export default {
  title: "Components/Image",
  component: Image,
};

type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {},
  decorators: [
    (_Story: StoryFn) => {
      return (
        <div className="grid grid-cols-3 mx-auto gap-12">
          <Image imageName="Ledger" forceLightMode={true} />
          <Image imageName="Ledger" forceLightMode={false} />
          <Image imageName="Logo" forceLightMode={false} />
          <Image imageName="Logo" forceLightMode={true} />
          <Image imageName="LogoMinimal" forceLightMode={true} />
          <Image imageName="LogoMinimal" forceLightMode={false} />
          <Image imageName="SuccessImage" forceLightMode={true} />
          <Image imageName="SuccessImage" forceLightMode={false} />
        </div>
      );
    },
  ],
};
