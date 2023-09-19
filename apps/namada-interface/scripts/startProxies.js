const { exec } = require('child_process');
require('dotenv').config();

const {
  REACT_APP_NAMADA_ALIAS = "Namada",
  REACT_APP_NAMADA_URL,
  REACT_APP_COSMOS_ALIAS = "Cosmos",
  REACT_APP_COSMOS_URL,
  REACT_APP_ETH_ALIAS = "Ethereum",
  REACT_APP_ETH_URL,
} = process.env;

const proxyConfigs = [
  {
    alias: REACT_APP_NAMADA_ALIAS,
    url: REACT_APP_NAMADA_URL,
    proxyPort: 8010,
  },
  {
    alias: REACT_APP_COSMOS_ALIAS,
    url: REACT_APP_COSMOS_URL,
    proxyPort: 8011,
  },
  {
    alias: REACT_APP_ETH_ALIAS,
    url: REACT_APP_ETH_URL,
    proxyPort: 8012,
  }
];

proxyConfigs.forEach(({ alias, url, proxyPort }) => {
  if (url) {
    console.log(`Starting local-cors-proxy for ${alias}`)
    console.log(`-> ${url} proxied to http://127.0.0.1:${proxyPort}/proxy\n`);

    exec(`lcp --proxyUrl ${url} --port ${proxyPort}`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`)
      }
    })
  }
})
