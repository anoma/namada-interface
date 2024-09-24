const { exec } = require("child_process");

const proxiesJson = require("./proxies.json");

proxiesJson.forEach(({ alias, url, proxyPort }) => {
  console.log(`Starting local-cors-proxy for ${alias}`);
  console.log(`-> ${url} proxied to http://localhost:${proxyPort}/proxy\n`);

  exec(`lcp --proxyUrl ${url} --port ${proxyPort}`, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });
});
