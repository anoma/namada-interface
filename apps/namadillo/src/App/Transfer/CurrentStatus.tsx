type CurrentStatusProps = {
  status: string;
};

export const CurrentStatus = ({ status }: CurrentStatusProps): JSX.Element => {
  return (
    <div className="flex border border-current rounded-md px-4 py-2 text-yellow">
      <span className="animate-pulse">{status}</span>
      <span></span>
    </div>
  );
};
