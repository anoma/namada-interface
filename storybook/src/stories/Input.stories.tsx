import { Input, Stack } from "@namada/components";
import type { StoryFn, StoryObj } from "@storybook/react";

export default {
  title: "Components/Input",
  component: Input,
  argTypes: {},
};

type Story = StoryObj<typeof Input>;

export const SimpleFieldWithLabel: Story = {
  args: {
    hint: "This is the hint",
    placeholder: "This is the placeholder",
  },
  decorators: [
    (Story: StoryFn, context) => {
      return (
        <Stack gap={10}>
          <Input label="Label (Text)" {...context.args} />
          <Input
            label="Label (Password)"
            variant="Password"
            {...context.args}
          />
          <Input
            label="Label (PasswordOnBlur)"
            variant="PasswordOnBlur"
            {...context.args}
          />
          <Input
            label="Label (ReadOnlyCopy)"
            value="Input content"
            variant="ReadOnlyCopy"
            {...context.args}
          />
          <Input
            label="Label (Textarea)"
            variant="Textarea"
            rows={5}
            value="This is the content"
            {...context.args}
          />
          <Input
            label="Label (type='number')"
            type="number"
            {...context.args}
          />
        </Stack>
      );
    },
  ],
};

export const FieldContaingAnError: Story = {
  args: {
    ...SimpleFieldWithLabel.args,
    error: "This is an error",
  },
  decorators: SimpleFieldWithLabel.decorators,
};

export const SensitiveField: Story = {
  args: {
    ...SimpleFieldWithLabel.args,
    sensitive: true,
  },
  decorators: SimpleFieldWithLabel.decorators,
};
