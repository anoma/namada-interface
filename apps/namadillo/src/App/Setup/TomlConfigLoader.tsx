import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { defaultServerConfigAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { PageLoader } from "../Common/PageLoader";

export const TomlConfigLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const tomlConfig = useAtomValue(defaultServerConfigAtom);

  if (tomlConfig.isPending) {
    return <PageLoader />;
  }

  if (tomlConfig.isError && tomlConfig.error.name === "SyntaxError") {
    return (
      <AtomErrorBoundary
        containerProps={{ className: "text-white h-svh" }}
        result={tomlConfig}
        niceError={
          <>
            <p>You have a syntax error in your /config.toml file</p>
            {tomlConfig.error.message && (
              <p className="mt-2 text-xs text-neutral-500">
                Error: {tomlConfig.error.message}
              </p>
            )}
          </>
        }
      />
    );
  }

  return <>{children}</>;
};
