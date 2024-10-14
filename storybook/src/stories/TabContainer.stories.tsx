import { TabContainer } from "@namada/components";
import { Meta, Story } from "@storybook/react";

export default {
  title: "Components/TabContainer",
  component: TabContainer,
} as Meta;

// Template for generating stories
const Template: Story = (args) => <TabContainer {...args} />;

// Default story with 3 tabs
export const Default = Template.bind({});
Default.args = {
  tabs: [
    {
      title: "Tab 1",
      children: <div>This is the content of Tab 1</div>,
    },
    {
      title: "Tab 2",
      children: <div>This is the content of Tab 2</div>,
    },
    {
      title: "Tab 3",
      children: <div>This is the content of Tab 3</div>,
    },
  ],
};

// Story with different tab content
export const CustomTabs = Template.bind({});
CustomTabs.args = {
  tabs: [
    {
      title: "Introduction",
      children: <div>Welcome to the introduction content</div>,
    },
    {
      title: "Overview",
      children: <div>Here is an overview of the content</div>,
    },
    {
      title: "Details",
      children: <div>This is where the details are explained</div>,
    },
  ],
};

// Story with only two tabs
export const TwoTabs = Template.bind({});
TwoTabs.args = {
  tabs: [
    {
      title: "First Tab",
      children: <div>Content for the first tab</div>,
    },
    {
      title: "Second Tab",
      children: <div>Content for the second tab</div>,
    },
  ],
};
