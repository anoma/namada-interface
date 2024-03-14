import { StyledTable } from "@namada/components";
import type { StoryObj } from "@storybook/react";
import cosmostationLogo from "../../public/images/cosmostation.png";
import everstakeLogo from "../../public/images/everstake.png";

export default {
  title: "Components/StyledTable",
  component: StyledTable,
  argTypes: {},
};

type Story = StoryObj<typeof StyledTable>;

export const Default: Story = {
  args: {
    tableProps: { className: "w-full" },
    headers: [
      "Validator",
      "Address",
      <div key="voting-power" className="text-right">
        Voting Power
      </div>,
      "Comission",
    ],
    rows: [
      {
        cells: [
          "Cosmostation",
          "tnamf5jdn...fhth57",
          <div className="text-right" key={`row-7000`}>
            7,000,000 NAM
          </div>,
          "2.0%",
        ],
        className:
          "cursor-pointer transition-all duration-150 hover:text-yellow",
      },
      {
        cells: [
          "ZK Validator",
          "tnamf5jdn...fhth57",
          <div className="text-right" key={`row-7000`}>
            7,000,000 NAM
          </div>,
          ,
          "2.0%",
        ],
        className:
          "cursor-pointer transition-all duration-150 hover:text-yellow",
      },
    ],
  },
};

export const WithEmptyTitles: Story = {
  args: {
    headers: ["", "Validator", "Address", "Voting Power", "Comission", ""],
    rows: [
      {
        cells: [
          <img src={cosmostationLogo} key="cosmostation-logo" />,
          "Cosmostation",
          "tnamf5jdn...fhth57",
          "7,000,000 NAM",
          "340 NAM",
          "2.0%",
          ">",
        ],
      },
      {
        cells: [
          <img src={everstakeLogo} key="everstake-logo" />,
          "Everstake",
          "tnamf5jdn...fhth57",
          "7,000,000 NAM",
          "340 NAM",
          "2.0%",
          ">",
        ],
      },
    ],
  },
};

export const WithEvents: Story = {
  args: {
    headers: ["", "Validator", "Address", "Voting Power", "Comission", ""],
    rows: [
      {
        cells: [
          <img src={cosmostationLogo} key="cosmostation-logo" />,
          "Cosmostation",
          "tnamf5jdn...fhth57",
          "7,000,000 NAM",
          "340 NAM",
          "2.0%",
          ">",
        ],
        className: "cursor-pointer",
        onClick: () => alert("clicked on Cosmostation"),
      },
      {
        cells: [
          <img src={everstakeLogo} key="everstake-logo" />,
          "Everstake",
          "tnamf5jdn...fhth57",
          "7,000,000 NAM",
          "340 NAM",
          "2.0%",
          ">",
        ],
        className: "cursor-pointer",
        onClick: () => alert("clicked on Everstake"),
      },
    ],
  },
};
