import { useIsChannelInactive } from "hooks/useIsChannelInactive";

const Warning = ({ trace }: { trace: string }): JSX.Element => {
  return <div className="text-xs text-neutral-500">inactive: {trace}</div>;
};

export const InactiveChannelWarning = ({
  address,
}: {
  address: string;
}): JSX.Element => {
  const { isInactive, trace } = useIsChannelInactive(address);
  if (isInactive) return <Warning trace={trace} />;
  return <></>;
};
