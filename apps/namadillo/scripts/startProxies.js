const { exec } = require("child_process");

const MASP_MPC_URL =
  "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup";

const proxyConfigs = [
  {
    alias: "MASP MPC URL",
    url: MASP_MPC_URL,
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
