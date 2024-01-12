import * as puppeteer from "puppeteer";
import terminate from "terminate/promise";

import { ChildProcess, exec } from "child_process";
import nodePath from "node:path";
import util from "node:util";

const { NAMADA_LOG = false } = process.env;

// promisify exec
const execPromise = util.promisify(exec);

export const waitForXpath = async <T extends Node>(
  page: puppeteer.Page,
  xpath: string,
  options?: puppeteer.WaitForSelectorOptions
): Promise<puppeteer.ElementHandle<T>> => {
  const element = await page.waitForXPath(xpath, options);

  return element as puppeteer.ElementHandle<T>;
};

export const $x = async <T extends Node>(
  page: puppeteer.Page,
  xpath: string
): Promise<puppeteer.ElementHandle<T>[]> => {
  const element = await page.$x(xpath);
  return element.map((e) => e as puppeteer.ElementHandle<T>);
};

export const targetPage = async (
  target: puppeteer.Target
): Promise<puppeteer.Page> => {
  const page = await target.page();
  if (!page) {
    throw new Error("Page not found");
  }
  return page;
};

const getExtensionId = async (browser: puppeteer.Browser): Promise<string> => {
  // TODO: replace with poll check
  await new Promise((r) => setTimeout(r, 500));
  const targets = browser.targets();
  const extensionTarget = targets.find(
    (target) => target.type() === "service_worker"
  );
  if (!extensionTarget) {
    throw new Error("No extension target found");
  }
  const partialExtensionUrl = extensionTarget.url() || "";
  const [, , extensionId] = partialExtensionUrl.split("/");
  return extensionId;
};

export const openInterface = async (page: puppeteer.Page): Promise<void> => {
  await page.goto("http://localhost:8080", {
    waitUntil: ["domcontentloaded"],
  });
};

export const openPopup = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page
): Promise<void> => {
  const extensionId = await getExtensionId(browser);
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;

  await page.goto(popupUrl, {
    waitUntil: ["domcontentloaded"],
  });
};

export const openSetup = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page
): Promise<void> => {
  const extensionId = await getExtensionId(browser);
  const popupUrl = `chrome-extension://${extensionId}/setup.html`;

  await page.goto(popupUrl, {
    waitUntil: ["domcontentloaded"],
  });
};

export const startNamada = (namRefs: Set<ChildProcess>): ChildProcess => {
  const nam = exec(`sh ${process.cwd()}/start-namada.sh`);

  if (NAMADA_LOG) {
    if (nam.stdout) {
      nam.stdout.setEncoding("utf8");
      nam.stdout.on("data", function (data) {
        console.log(data);
      });
    }

    if (nam.stderr) {
      nam.stderr.setEncoding("utf8");
      nam.stderr.on("data", function (data) {
        console.error(data);
      });
    }
  }

  namRefs.add(nam);
  return nam;
};

export const setupNamada = async (): Promise<void> => {
  const { stderr, stdout } = await execPromise(
    `bash ${process.cwd()}/setup-namada.sh`
  );
  if (NAMADA_LOG) {
    if (stdout) {
      console.log("Setup Namada Log:", stdout);
    }
    if (stderr) {
      console.error("Setup Namada Error:", stderr);
    }
  }
};

export const initProposal = async (): Promise<void> => {
  await execPromise(`bash ${process.cwd()}/init-proposal.sh`);
};

export const stopNamada = async (namada: ChildProcess): Promise<void> => {
  if (namada.pid) {
    await terminate(namada.pid);
  }
};

export const launchPuppeteer = async (): Promise<puppeteer.Browser> => {
  const root = nodePath.resolve(process.cwd(), "..");
  const path = `${root}/apps/extension/build/chrome`;

  const puppeteerArgs = [
    `--disable-extensions-except=${path}`,
    `--load-extension=${path}`,
    "--disable-features=DialMediaRouteProvider",
  ];
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 600000,
    slowMo: 50,
    args: puppeteerArgs,
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  });

  return browser;
};

export const allowClipboardRead = async (
  page: puppeteer.Page
): Promise<void> => {
  const client = await page.target().createCDPSession();
  await client.send("Browser.setPermission", {
    origin: page.url(),
    permission: {
      name: "clipboard-read",
      allowWithoutSanitization: true,
    },
    setting: "granted",
  });
};

export const waitForInputValue = async <T>(
  page: puppeteer.Page,
  input: puppeteer.ElementHandle<HTMLInputElement> | null,
  value: T
): Promise<puppeteer.JSHandle<true> | puppeteer.JSHandle<false>> =>
  await page.waitForFunction(
    (el, value) => el?.value === value,
    { polling: "mutation", timeout: 30000 },
    input,
    value
  );

export const pasteValueInto = async (
  page: puppeteer.Page,
  input: puppeteer.ElementHandle<HTMLInputElement>,
  value: string
): Promise<void> => {
  await page.evaluate((value) => navigator.clipboard.writeText(value), value);

  input.focus();
  await page.keyboard.down("Control");
  await page.keyboard.press("V");
  await page.keyboard.up("Control");
};
