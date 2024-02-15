import { IntegrationsContext, integrations } from "@namada/integrations";

export const IntegrationsProvider = (props: {children: React.ReactNode}): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};
