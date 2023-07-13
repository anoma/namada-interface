/**
 * @jest-environment node
 */
import * as puppeteer from "puppeteer";
import nodePath from "node:path";

import { mnemonic, pwdOrAlias } from "./utils/values";
import { targetPage, waitForXpath } from "./utils/helpers";

const root = nodePath.resolve(process.cwd(), "..");
const path = `${root}/apps/extension/build/chrome`;

const puppeteerArgs = [
  `--disable-extensions-except=${path}`,
  `--load-extension=${path}`,
  "--disable-features=DialMediaRouteProvider",
];
jest.setTimeout(120000);

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const getExtensionId = async (): Promise<string> => {
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

const openInterface = async (): Promise<void> => {
  await page.goto("http://localhost:3000", {
    waitUntil: ["domcontentloaded"],
  });
};

const openPopup = async (): Promise<void> => {
  const extensionId = await getExtensionId();
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;

  await page.goto(popupUrl, {
    waitUntil: ["domcontentloaded"],
  });
};

const openSetup = async (): Promise<void> => {
  const extensionId = await getExtensionId();
  const popupUrl = `chrome-extension://${extensionId}/setup.html`;

  await page.goto(popupUrl, {
    waitUntil: ["domcontentloaded"],
  });
};

describe("Namada extension", () => {
  beforeEach(async function () {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: puppeteerArgs,
    });
    [page] = await browser.pages();
  });

  afterEach(async function () {
    await browser.close();
  });

  describe("open the popup", () => {
    test("should open the popup", async () => {
      await openPopup();
      // Check H1
      const h1 = await page.$eval("h1", (e) => e.innerText);
      expect(h1).toEqual("Anoma Browser Extension");
    });
  });

  describe("send transfer", () => {
    test("should send transfer", async () => {
      await openSetup();

      // Check H1
      const setupH1 = await page.$eval("h1", (e) => e.innerText);
      expect(setupH1).toEqual("Create Your Account");

      // Click on import account
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Import an account')]"
        )
      ).click();
      await page.waitForNavigation();

      // Check H1
      const mnemonicH1 = await page.$eval("h1", (e) => e.innerText);
      expect(mnemonicH1).toEqual("Import Account");

      // Fill mnemonic
      const wordInputs = await page.$$("input");
      let index = 0;
      for await (const input of wordInputs) {
        await input.type(mnemonic[index]);
        index++;
      }

      // Click on import account
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Import')]"
        )
      ).click();
      await page.waitForNavigation();

      const pwdInputs = await page.$$("input");
      for await (const input of pwdInputs) {
        await input.type(pwdOrAlias);
      }

      // Click on create account
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Create an Account')]"
        )
      ).click();
      await page.waitForNavigation();

      // Wait for setup completion and open the interface
      await page.waitForXPath("//p[contains(., 'Setup is complete')]");
      await openInterface();

      // Click on connect to extension
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Connect to')]"
        )
      ).click();

      // Click on send button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Send')]"
        )
      ).click();

      // Navigate to transparent transfers
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Transparent')]"
        )
      ).click();

      // Fill transfer data
      const [recipentInput, amountInput] = await page.$$("input");
      await recipentInput.type(
        "atest1d9khqw368qury3phx3prsvp4gezrssenxqmyxwpn8qmrqvpsg4znjdjp8ycry3p3g4p5vd6x66dnmw"
      );
      await amountInput.type("10");

      // Continue transfer
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Continue')]"
        )
      ).click();

      // Wait for approvals window to show up
      const approvalsTarget = await browser.waitForTarget((t) =>
        t.url().includes("approvals.html")
      );
      const approvalsPage = await targetPage(approvalsTarget);

      // Click approve button
      (
        await waitForXpath<HTMLButtonElement>(
          approvalsPage,
          "//button[contains(., 'Approve')]"
        )
      ).click();

      (await approvalsPage.$("input"))?.type(pwdOrAlias);

      // Click approve auth button
      (
        await waitForXpath<HTMLButtonElement>(
          approvalsPage,
          "//button[contains(., 'Authenticate')]"
        )
      ).click();

      // Wait for success toast
      const toast = await page.waitForXPath(
        "//div[contains(., 'Transfer successful!')]"
      );
      expect(toast).toBeDefined();
    });
  });
});
