import {
  SortableHeaderOptions,
  StyledTable,
  StyledTableProps,
} from "@namada/components";
import type { StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
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
      "Commission",
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

const SortableTitlesExample = (props: StyledTableProps): JSX.Element => {
  const [nameSort, setNameSort] = useState<SortableHeaderOptions | undefined>();
  const data = [
    { id: 1, name: "Justin" },
    { id: 2, name: "Mateusz" },
    { id: 3, name: "Pedro" },
    { id: 4, name: "Eric" },
    { id: 5, name: "Harri" },
  ];

  const rows = useMemo(() => {
    if (!nameSort) return data;
    return data.sort((entry1, entry2) => {
      if (nameSort === "asc") return entry2.name.localeCompare(entry1.name);
      return entry1.name.localeCompare(entry2.name);
    });
  }, [nameSort]);

  return (
    <StyledTable
      {...props}
      headers={[
        "ID",
        {
          children: "Name",
          sortable: true,
          onSort: (order: SortableHeaderOptions) => {
            setNameSort(order);
          },
          sorting: nameSort,
        },
      ]}
      rows={rows.map((row) => ({ cells: [row.id, row.name] }))}
    />
  );
};

export const WithSortableTitles: Story = {
  decorators: [
    (_Story, context) => {
      return <SortableTitlesExample {...context.args} />;
    },
  ],
};

export const WithEmptyTitles: Story = {
  args: {
    headers: ["", "Validator", "Address", "Voting Power", "Commission", ""],
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
    headers: ["", "Validator", "Address", "Voting Power", "Commission", ""],
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
