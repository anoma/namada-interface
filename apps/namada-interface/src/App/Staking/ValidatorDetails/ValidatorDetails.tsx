import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { ValidatorDetailsContainer } from "./ValidatorDetails.components";
import { Table } from "components/Table";

type Props = {};

export const ValidatorDetails = (props: Props): JSX.Element => {
  return (
    <ValidatorDetailsContainer>Validator Details</ValidatorDetailsContainer>
  );
};
