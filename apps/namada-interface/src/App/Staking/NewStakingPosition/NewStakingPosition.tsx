import { NewStakingPositionContainer } from "./NewStakingPosition.components";
import { Table, TableConfigurations, KeyValueData } from "components/Table";

const validatorDetailsConfigurations: TableConfigurations<KeyValueData, never> =
  {
    rowRenderer: (rowData: KeyValueData) => {
      return (
        <>
          <td style={{ display: "flex" }}>{rowData.key}</td>
          <td>{rowData.value}</td>
        </>
      );
    },
    columns: [
      { uuid: "1", columnLabel: "", width: "30%" },
      { uuid: "2", columnLabel: "", width: "70%" },
    ],
  };

export const NewStakingPosition = (): JSX.Element => {
  return (
    <NewStakingPositionContainer>
      <Table
        title="Summary"
        tableConfigurations={validatorDetailsConfigurations}
        data={[]}
      />
    </NewStakingPositionContainer>
  );
};
