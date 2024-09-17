import { PageLoader } from "App/Common/PageLoader";
import { defaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";

export const AccountLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const defaultAccount = useAtomValue(defaultAccountAtom);
  if (defaultAccount.isPending) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
