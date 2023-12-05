import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { IntegrationsContext } from "@namada/hooks";
import { Namada } from "@namada/integrations";
import namada from "@namada/chains/src/chains/namada";

const { NAMADA_INTERFACE_NAMADA_CHAIN_ID: namadaChainId = "namadaChainId" } =
  process.env;

//We just use this for Namada
const integrations = {
  [namadaChainId]: new Namada(namada),
};

export const IntegrationsProvider: React.FC = (props): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <IntegrationsProvider>
        <App />
      </IntegrationsProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
