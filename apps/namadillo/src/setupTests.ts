import "@testing-library/jest-dom";
import { atom } from "jotai";
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

jest.mock("atoms/integrations", () => ({
  getRestApiAddressByIndex: jest.fn(),
  getRpcByIndex: jest.fn(),
}));

jest.mock("atoms/integrations/atoms", () => ({
  localnetConfigAtom: atom({ data: undefined }),
}));
