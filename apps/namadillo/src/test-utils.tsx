import { RenderResult, render as rtlRender } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

export const render = (element: ReactNode): RenderResult => {
  return rtlRender(<MemoryRouter>{element}</MemoryRouter>);
};

export const mockReactRouterDom = (pathname: string): void => {
  const mockLocation = { pathname };
  jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
    useLocation: () => mockLocation,
  }));
};

export const mockJotai = (): void => {
  jest.mock("jotai", () => ({
    useAtomValue: jest.fn(),
    atom: jest.fn(),
  }));

  jest.mock("jotai-tanstack-query", () => ({
    atomWithQuery: jest.fn(),
    atomWithMutation: jest.fn(),
  }));
};
