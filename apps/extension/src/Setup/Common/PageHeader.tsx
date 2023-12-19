import { Heading, Text } from "@namada/components";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export const PageHeader = ({
  title,
  subtitle,
}: PageHeaderProps): JSX.Element => {
  return (
    <hgroup className="text-white text-center -mt-2 mb-6">
      <Heading className="uppercase text-3xl" level="h1">
        {title}
      </Heading>
      {subtitle && <Text>{subtitle}</Text>}
    </hgroup>
  );
};
