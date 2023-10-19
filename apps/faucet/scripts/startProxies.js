const { exec } = require("child_process");
require("dotenv").config();

const {
  REACT_APP_FAUCET_API_URL: apiUrl = "http://localhost:5000",
  REACT_APP_PROXY_PORT: proxyPort = "9000",
} = process.env;

const lcpCommand = `lcp --proxyUrl ${apiUrl} --port ${proxyPort}`;

if (apiUrl) {
  console.log(`Running command '${lcpCommand}'\n`);
  console.log("Starting local-cors-proxy for faucet API endpoint");
  console.log(`-> ${apiUrl} proxied to http://localhost:${proxyPort}/proxy\n`);

  exec(lcpCommand, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });
}
