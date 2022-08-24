import { sanitize, stripInvalidCharacters } from "utils/helpers";

export type IBCConfigItem = {
  chainId: string;
  alias: string;
};

type IBCConfigType = {
  development: IBCConfigItem[];
  production: IBCConfigItem[];
};

const {
  REACT_APP_CHAIN_A_ID: chainAId,
  REACT_APP_CHAIN_A_ALIAS: chainAAlias,
  REACT_APP_CHAIN_B_ID: chainBId,
  REACT_APP_CHAIN_B_ALIAS: chainBAlias,
} = process.env;

/**
 * Specify any IBC-enabled chains below per environment. Match the following
 * definitions to settings in .env:
 */
const IBCConfig: IBCConfigType = {
  development: [
    {
      chainId: chainAId ? sanitize(chainAId) : "anoma-test.569195096d4a940e5ee",
      alias: chainAAlias
        ? stripInvalidCharacters(chainAAlias)
        : "Namada - Instance 1",
    },
    {
      chainId: chainBId ? sanitize(chainBId) : "anoma-test.aa4a0f246ca97b6a903",
      alias: chainBAlias
        ? stripInvalidCharacters(chainBAlias)
        : "Namada - Instance 2",
    },
    {
      chainId: "gaia",
      alias: "Cosmos (Gaia)",
    },
  ],
  production: [],
};

export default IBCConfig;
