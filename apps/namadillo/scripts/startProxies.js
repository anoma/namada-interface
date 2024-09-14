const { exec } = require("child_process");
require("dotenv").config();

const { TRUSTED_SETUP_URL } = process.env;

const proxyConfigs = [
  {
    alias: "Trusted-Setup GitHub URL",
    url: TRUSTED_SETUP_URL,
    proxyPort: 8010,
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
