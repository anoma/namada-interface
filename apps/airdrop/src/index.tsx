import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { IntegrationsContext } from "@namada/hooks";
import { Keplr, Namada } from "@namada/integrations";
import namada from "@namada/chains/src/chains/namada";
import cosmos from "@namada/chains/src/chains/cosmos";

const {
  REACT_APP_NAMADA_CHAIN_ID: namadaChainId = "namadaChainId",
  REACT_APP_COSMOS_CHAIN_ID: cosmosChainId = "cosmosChainId",
} = process.env;

const integrations = {
  [namadaChainId]: new Namada(namada),
  [cosmosChainId]: new Keplr(cosmos),
};
//TODO: move to shares
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
