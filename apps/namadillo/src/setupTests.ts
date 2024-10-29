import "@testing-library/jest-dom";

jest.mock("atoms/integrations", () => ({
  getRestApiAddressByIndex: jest.fn(),
  getRpcByIndex: jest.fn(),
}));
