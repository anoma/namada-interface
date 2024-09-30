import { ErrorBox } from "./ErrorBox";

export const NotFound = (): JSX.Element => {
  return (
    <ErrorBox
      niceError="404 Not found"
      containerProps={{
        className:
          "bg-black max-w-full rounded-sm w-full text-white min-h-full",
      }}
    />
  );
};
