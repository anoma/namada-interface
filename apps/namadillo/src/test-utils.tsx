import { RenderResult, render as rtlRender } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

export const render = (element: ReactNode): RenderResult => {
  return rtlRender(<MemoryRouter>{element}</MemoryRouter>);
};
