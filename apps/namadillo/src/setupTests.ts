import "@testing-library/jest-dom";
import { atom } from "jotai";

jest.mock("atoms/integrations", () => ({
  getRestApiAddressByIndex: jest.fn(),
  getRpcByIndex: jest.fn(),
}));

jest.mock("atoms/integrations/atoms", () => ({
  localnetConfigAtom: atom({ data: undefined }),
}));
