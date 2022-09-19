import { ValidatorDetailsContainer } from "./ValidatorDetails.components";
import { Table, TableConfigurations, KeyValueData } from "components/Table";
import { Validator } from "slices/StakingAndGovernance/types";

const validatorDetailsConfigurations: TableConfigurations<KeyValueData, never> =
  {
    rowRenderer: (rowData: KeyValueData) => {
      // we have to figure if this is the row for validator homepage, hench an anchor
      const linkOrText = rowData.value.startsWith("https:") ? (
        <a href={rowData.value} target="_blank" rel="noopener noreferrer">
          {rowData.value}
        </a>
      ) : (
        <span>{rowData.value}</span>
      );

      return (
        <>
          <td style={{ display: "flex" }}>{rowData.key}</td>
          <td>{linkOrText}</td>
        </>
      );
    },
    columns: [
      { uuid: "1", columnLabel: "", width: "30%" },
      { uuid: "2", columnLabel: "", width: "70%" },
    ],
  };

const myStakingWithValidatorConfigurations: TableConfigurations<never, never> =
  {
    rowRenderer: () => <div>Row</div>,
    columns: [
      { uuid: "1", columnLabel: "", width: "30%" },
      { uuid: "2", columnLabel: "", width: "70%" },
    ],
  };

type Props = {
  validator?: Validator;
};

// this turns the Validator object to rows that are passed to the table
const validatorToDataRows = (
  validator?: Validator
): { uuid: string; key: string; value: string }[] => {
  if (validator === undefined) {
    return [];
  }
  return [
    { uuid: "1", key: "Name", value: validator.name },
    { uuid: "2", key: "Commission", value: validator.commission },
    { uuid: "3", key: "Voting Power", value: validator.votingPower },
    {
      uuid: "4",
      key: "Description",
      value: validator.description,
    },
    { uuid: "5", key: "Website", value: validator.homepageUrl },
  ];
};

export const ValidatorDetails = (props: Props): JSX.Element => {
  const { validator } = props;
  const validatorDetailsData = validatorToDataRows(validator);

  return (
    <ValidatorDetailsContainer>
      <Table
        title="Validator Details"
        tableConfigurations={validatorDetailsConfigurations}
        data={validatorDetailsData}
      />
      <Table
        title={`My Staking with ${validator?.name}`}
        tableConfigurations={myStakingWithValidatorConfigurations}
        data={[]}
      />
    </ValidatorDetailsContainer>
  );
};
