import { ActionButton } from "@namada/components";
import clsx from "clsx";
import { MdOutlineFace5 } from "react-icons/md";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export const RouteErrorBoundary = (): JSX.Element => {
  const error = useRouteError();

  const renderError = (): string => {
    if (typeof error === "string") {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (isRouteErrorResponse(error)) {
      return error.statusText;
    }

    return "An unknown error occurred while loading the page";
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center flex-1 w-full",
        "relative text-yellow h-[100svh]"
      )}
    >
      <div className="flex flex-col gap-2 items-center max-w-[40%] text-center">
        <i className="text-7xl">
          <MdOutlineFace5 />
        </i>
        <strong className="text-2xl">Oops... an error occurred</strong>
        <p>{renderError()}</p>
        <footer className="flex flex-col w-full gap-2 mt-8">
          <ActionButton
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </ActionButton>
          {error instanceof Error && (
            <ActionButton
              outlineColor="yellow"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(error.stack))
              }
            >
              Copy Error Info
            </ActionButton>
          )}
        </footer>
      </div>
    </div>
  );
};
