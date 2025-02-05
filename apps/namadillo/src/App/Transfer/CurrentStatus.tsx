type CurrentStatusProps = {
  status: string;
  explanation?: React.ReactNode;
};

export const CurrentStatus = ({
  status,
  explanation,
}: CurrentStatusProps): JSX.Element => {
  return (
    <>
      <div className="flex border border-current rounded-md px-4 py-2 text-yellow">
        <span>{status}</span>
        <span></span>
      </div>
      {explanation && (
        <div className="text-center text-sm leading-tight text-yellow my-3 max-w-[80%] mx-auto">
          {explanation}
        </div>
      )}
    </>
  );
};
