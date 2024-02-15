import { IntegrationsContext, integrations } from "@namada/integrations";

export const IntegrationsProvider: React.FC = (props): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};
