const { exec } = require("child_process");
require("dotenv").config();

const {
  NAMADA_INTERFACE_NAMADA_URL,
  NAMADA_INTERFACE_COSMOS_URL,
  NAMADA_INTERFACE_ETH_URL,
  NAMADA_INTERFACE_OSMOSIS_URL,
} = process.env;

const proxyConfigs = [
  {
    alias: "Namada",
    url: NAMADA_INTERFACE_NAMADA_URL,
    proxyPort: 8010,
  },
  {
    alias: "Cosmos",
    url: NAMADA_INTERFACE_COSMOS_URL,
    proxyPort: 8011,
  },
  {
    alias: "Ethereum",
    url: NAMADA_INTERFACE_ETH_URL,
    proxyPort: 8012,
  },
  {
    alias: "Osmosis",
    url: NAMADA_INTERFACE_OSMOSIS_URL,
    proxyPort: 8013,
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
