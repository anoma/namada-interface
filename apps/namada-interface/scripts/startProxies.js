const { exec } = require("child_process");
require("dotenv").config();

const {
  NAMADA_INTERFACE_NAMADA_ALIAS = "Namada",
  NAMADA_INTERFACE_NAMADA_URL,
  NAMADA_INTERFACE_COSMOS_ALIAS = "Cosmos",
  NAMADA_INTERFACE_COSMOS_URL,
  NAMADA_INTERFACE_ETH_ALIAS = "Ethereum",
  NAMADA_INTERFACE_ETH_URL,
} = process.env;

const proxyConfigs = [
  {
    alias: NAMADA_INTERFACE_NAMADA_ALIAS,
    url: NAMADA_INTERFACE_NAMADA_URL,
    proxyPort: 8010,
  },
  {
    alias: NAMADA_INTERFACE_COSMOS_ALIAS,
    url: NAMADA_INTERFACE_COSMOS_URL,
    proxyPort: 8011,
  },
  {
    alias: NAMADA_INTERFACE_ETH_ALIAS,
    url: NAMADA_INTERFACE_ETH_URL,
    proxyPort: 8012,
  },
];

proxyConfigs.forEach(({ alias, url, proxyPort }) => {
  if (url) {
    console.log(`Starting local-cors-proxy for ${alias}`);
    console.log(`-> ${url} proxied to http://localhost:${proxyPort}/proxy\n`);

    exec(
      `lcp --proxyUrl ${url} --port ${proxyPort}`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      }
    );
  }
});
