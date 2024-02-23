import { Heading } from "@namada/components";

type PageHeaderProps = {
  title: string;
};

export const PageHeader = ({ title }: PageHeaderProps): JSX.Element => {
  return <Heading className="text-xl text-center text-white">{title}</Heading>;
};
