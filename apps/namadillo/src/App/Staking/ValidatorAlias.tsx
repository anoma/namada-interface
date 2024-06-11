import { ValidatorAliasPlaceholder } from "./ValidatorAliasPlaceholder";

type ValidatorAliasProps = {
  alias?: string;
};

export const ValidatorAlias = ({ alias }: ValidatorAliasProps): JSX.Element => {
  if (alias) {
    return <strong className="font-medium">{alias}</strong>;
  }
  return <ValidatorAliasPlaceholder />;
};
