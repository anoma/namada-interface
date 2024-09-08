import { IntegrationsContext, integrations } from "@namada/integrations";
import { FunctionComponent, PropsWithChildren } from "react";

export const IntegrationsProvider: FunctionComponent<PropsWithChildren> = (
  props
): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};
