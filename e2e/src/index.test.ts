/**
 * @jest-environment node
 */
import * as puppeteer from "puppeteer";
import { ChildProcess } from "child_process";

import {
  address0Alias,
  address1,
  shieldedAddress0,
  shieldedAddress0Alias,
  launchPuppeteer,
  openPopup,
  setupNamada,
  startNamada,
  stopNamada,
  targetPage,
  waitForInputValue,
  waitForXpath,
} from "./utils";
import {
  createAccount,
  importAccount,
  transferFromTransparent,
} from "./partial";

jest.setTimeout(240000);

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

  describe("send transfer (transparent->transparent)", () => {
    test("should send transfer", async () => {
      const nam = startNamada(namRefs);

      await importAccount(browser, page);

      // Click on connect to extension
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Connect to')]"
        )
      ).click();

      // Wait for approvals window to show up
      const at = await browser.waitForTarget((t) =>
        t.url().includes("approvals.html")
      );
      const ap = await targetPage(at);

      // Click approve button
      (
        await waitForXpath<HTMLButtonElement>(
          ap,
          "//button[contains(., 'Approve')]"
        )
      ).click();

      await transferFromTransparent(browser, page, {
        targetAddress: address1,
      });

      await stopNamada(nam);
    });
  });

  describe("send transfer (transparent->shielded)", () => {
    test("should send transfer", async () => {
      const nam = startNamada(namRefs);

      await importAccount(browser, page);

      // Click on connect to extension
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Connect to')]"
        )
      ).click();

      // Wait for approvals window to show up
      const at = await browser.waitForTarget((t) =>
        t.url().includes("approvals.html")
      );
      const ap = await targetPage(at);

      // Click approve button
      (
        await waitForXpath<HTMLButtonElement>(
          ap,
          "//button[contains(., 'Approve')]"
        )
      ).click();

      await transferFromTransparent(browser, page, {
        targetAddress: shieldedAddress0,
        transferTimeout: 120000,
      });

      await stopNamada(nam);
    });
  });
});
