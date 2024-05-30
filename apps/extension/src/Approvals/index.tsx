import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { getTheme } from "@namada/utils";
import { RequesterProvider } from "services";
import { ThemeProvider } from "styled-components";
import { Approvals } from "./Approvals";

import "@namada/components/src/base.css";
import "../global.css";
import "../tailwind.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  const theme = getTheme("dark");
  root.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <ThemeProvider theme={theme}>
            <Approvals />
          </ThemeProvider>
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>
  );
}
