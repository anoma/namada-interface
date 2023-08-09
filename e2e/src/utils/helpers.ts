import * as puppeteer from "puppeteer";
import terminate from "terminate/promise";

import { ChildProcess, exec } from "child_process";
import util from "node:util";
import nodePath from "node:path";

// promisify exec
const execPromise = util.promisify(exec);

export const waitForXpath = async <T extends Node>(
  page: puppeteer.Page,
  xpath: string
): Promise<puppeteer.ElementHandle<T>> => {
  const element = await page.waitForXPath(xpath);

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
  await new Promise((r) => setTimeout(r, 200));
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
  namRefs.add(nam);
  return nam;
};

export const setupNamada = async (): Promise<void> => {
  await execPromise(`sh ${process.cwd()}/setup-namada.sh`);
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
    slowMo: 50,
    args: puppeteerArgs,
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
