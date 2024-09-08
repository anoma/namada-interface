import { createContext, FunctionComponent, PropsWithChildren } from "react";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: FunctionComponent<PropsWithChildren> = (
  props
): JSX.Element => {
  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
