import { IntegrationsContext, integrations } from "@anoma/hooks";

export const IntegrationsProvider: React.FC = (props): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};
