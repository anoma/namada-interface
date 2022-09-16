import { ValidatorDetailsContainer } from "./ValidatorDetails.components";

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
