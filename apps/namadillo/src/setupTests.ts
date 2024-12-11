import "@testing-library/jest-dom";
import { atom } from "jotai";
import { TextDecoder, TextEncoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder });

jest.mock("atoms/integrations", () => ({
  getRestApiAddressByIndex: jest.fn(),
  getRpcByIndex: jest.fn(),
}));

jest.mock("atoms/integrations/atoms", () => ({
  localnetConfigAtom: atom({ data: undefined }),
}));
