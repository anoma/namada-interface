import { Address } from "types";

export const sanitizeAddress = (address: Address): Address =>
  address.toLowerCase().trim();
