import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { ErrorBox } from "App/Common/ErrorBox";
import { routes } from "App/routes";
import { chainAtom } from "atoms/chain";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageLoader } from "../Common/PageLoader";

const UpdateSettingsButton = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <button
      className="text-yellow hover:text-cyan"
      onClick={() => {
        navigate(routes.settingsAdvanced, {
          state: { backgroundLocation: location },
        });
      }}
    >
      update your settings
    </button>
  );
};

export const ChainLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const chain = useAtomValue(chainAtom);

  const errorContainerProps = {
    className: "bg-black max-w-full rounded-sm w-full text-white min-h-full",
  };

  if (chain.isPending) {
    return <PageLoader />;
  }

  if (chain.isError) {
    return (
      <AtomErrorBoundary
        containerProps={errorContainerProps}
        result={chain}
        buttonProps={{ onClick: () => window.location.reload() }}
        niceError={
          <>
            <p>
              Unable to load chain info. Please check your internet connection.
            </p>
            <p className="mt-1">
              If the problem persists, you can <UpdateSettingsButton />.
            </p>
          </>
        }
      />
    );
  }

  if (!chain.data?.rpcUrl) {
    return (
      <ErrorBox
        containerProps={errorContainerProps}
        niceError={
          <>
            <p>RPC Url was not provided</p>
            <p className="mt-1">
              Would you like to <UpdateSettingsButton />?
            </p>
          </>
        }
      />
    );
  }

  return <>{children}</>;
};
