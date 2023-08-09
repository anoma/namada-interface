/**
 * @jest-environment node
 */
import * as puppeteer from "puppeteer";
import { ChildProcess } from "child_process";

import {
  address0Alias,
  pwdOrAlias,
  shieldedAddress0Alias,
} from "./utils/values";
import {
  launchPuppeteer,
  openPopup,
  setupNamada,
  startNamada,
  stopNamada,
  targetPage,
  waitForInputValue,
  waitForXpath,
} from "./utils/helpers";
import { createAccount, importAccount } from "./partial/setup";

jest.setTimeout(120000);

let browser: puppeteer.Browser;
let page: puppeteer.Page;

describe("Namada extension", () => {
  const namRefs = new Set<ChildProcess>();

  beforeEach(async function () {
    await setupNamada();
    browser = await launchPuppeteer();
    [page] = await browser.pages();
  });

  afterEach(async function () {
    await browser.close();
  });

  afterAll(async () => {
    for await (const namada of namRefs) {
      // We want to stop the namada process only if:
      // - process is NOT about to stop - SIGKILL
      // - process is NOT already stopped - exitCode is not set
      const stop = !(
        namada.signalCode === "SIGKILL" || namada.exitCode !== null
      );
      if (stop) {
        await stopNamada(namada);
      }
    }
  });

  describe("open the popup", () => {
    test("should open the popup", async () => {
      await openPopup(browser, page);
      // Check H1
      const h1 = await page.$eval("h1", (e) => e.innerText);
      expect(h1).toEqual("Namada Browser Extension");
    });
  });

  describe("account", () => {
    test("create account & derive transparent address", async () => {
      await createAccount(browser, page);

      // Check if address was added
      openPopup(browser, page);
      await page.waitForNavigation();

      const addresses = await page.$$("li[class*='AccountsListItem']");

      expect(addresses.length).toEqual(1);

      // Click to derive new address
      await page.$eval(
        "div[class*='AccountListingContainer-'] a[class*='Button']",
        (e) => e.click()
      );

      // Derive new address
      const input = await page.$("input");
      input?.type(address0Alias);
      await waitForInputValue(page, input, address0Alias);

      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Add')]"
        )
      ).click();

      // Check if address was added
      await page.waitForSelector("ul[class*='AccountsList']");
      const itemsLength = await page.$$eval(
        "li[class*='AccountsListItem']",
        (e) => e.length
      );

      expect(itemsLength).toEqual(2);
    });

    test("create account & derive shielded address", async () => {
      await createAccount(browser, page);

      // Check if address was added
      openPopup(browser, page);
      await page.waitForNavigation();

      const addresses = await page.$$("li[class*='AccountsListItem']");

      expect(addresses.length).toEqual(1);

      // Click to derive new address
      await page.$eval(
        "div[class*='AccountListingContainer-'] a[class*='Button']",
        (e) => e.click()
      );

      // Input text and wait
      const input = await page.$("input");
      input?.type(shieldedAddress0Alias);
      await waitForInputValue(page, input, shieldedAddress0Alias);

      // Switch to shielded
      page.$eval("button[data-testid='Toggle']", (e) => e.click());

      // Derive new address
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Add')]"
        )
      ).click();

      // Check if address was added
      await page.waitForSelector("ul[class*='AccountsList']");
      const itemsLength = await page.$$eval(
        "li[class*='AccountsListItem']",
        (e) => e.length
      );

      expect(itemsLength).toEqual(2);
    });
  });

  describe("send transfer", () => {
    test("should send transfer", async () => {
      const nam = startNamada(namRefs);

      await importAccount(browser, page);

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
        "atest1d9khqw36x9zr2s6pxymrv3z9xcen2s33gvmrxsfjgccnzd2rxez5z3fex5urgsjzg4qnsw2pef6prn"
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
        "//div[contains(., 'Transaction completed!')]"
      );

      await stopNamada(nam);
      expect(toast).toBeDefined();
    });
  });
});
