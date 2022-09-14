import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { ValidatorDetailsContainer } from "./ValidatorDetails.components";
import { Table } from "components/Table";

type Props = {
  validator?: string;
};

export const ValidatorDetails = (props: Props): JSX.Element => {
  const { validator } = props;
  return (
    <ValidatorDetailsContainer>
      Validator Details for {validator}
    </ValidatorDetailsContainer>
  );
};
