/**
 * @jest-environment node
 */
import { ChildProcess } from "child_process";
import * as puppeteer from "puppeteer";

import {
  approveConnection,
  approveTransaction,
  createAccount,
  importAccount,
  transferFromTransparent,
} from "./partial";
import {
  initProposal,
  launchPuppeteer,
  openPopup,
  pasteValueInto,
  setupNamada,
  startNamada,
  stopNamada,
  waitForInputValue,
  waitForXpath,
} from "./utils/helpers";
import {
  address0Alias,
  address1,
  ethAddress0,
  shieldedAddress0,
  shieldedAddress0Alias,
} from "./utils/values";

jest.setTimeout(240000);

let browser: puppeteer.Browser;
let page: puppeteer.Page;

describe("Namada", () => {
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

  describe("popup", () => {
    test("open the popup", async () => {
      await openPopup(browser, page);

      // Check if button exists
      const initButton = await page.$(
        "button[data-testid='setup-init-button']"
      );
      expect(initButton).not.toBeNull();
    });
  });

  describe("account", () => {
    test("create account & derive transparent address", async () => {
      await createAccount(browser, page);
    });

    test.skip("create account & derive transparent address", async () => {
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

    test.skip("create account & derive shielded address", async () => {
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

  describe.skip("transfer", () => {
    test("transparent->transparent", async () => {
      const nam = startNamada(namRefs);

      await importAccount(browser, page);
      await approveConnection(browser, page);

      await transferFromTransparent(browser, page, {
        targetAddress: address1,
      });

      await stopNamada(nam);
    });

    test("transparent->shielded", async () => {
      const nam = startNamada(namRefs);

      await importAccount(browser, page);
      await approveConnection(browser, page);

      await transferFromTransparent(browser, page, {
        targetAddress: shieldedAddress0,
        transferTimeout: 120000,
      });

      await stopNamada(nam);
    });
  });

  // TODO: we need to upload contract first
  describe.skip("bridge", () => {
    test("add to bridge pool", async () => {
      const nam = startNamada(namRefs);
      await importAccount(browser, page);
      await approveConnection(browser, page);

      // Click on staking button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Bridge')]"
        )
      ).click();

      // Click on "Ethereum" button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Ethereum')]"
        )
      ).click();

      const [recipient, amount, feeAmount] = await page.$$("input");
      await pasteValueInto(page, recipient, ethAddress0);
      await amount.type("100");

      const value =
        (await page.$$eval(
          "[data-testid='eth-bridge-fee'] option",
          (options) =>
            options.find((option) => option.value.includes("NAM"))?.value
        )) || "";

      await page.select("[data-testid='eth-bridge-fee'] select", value);
      await feeAmount.type("1");

      // Click on submit button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Submit')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const toast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(toast).toBeDefined();

      await stopNamada(nam);
    });
  });

  describe.skip("staking", () => {
    test("bond -> unbond -> withdraw", async () => {
      jest.setTimeout(360000);

      const nam = startNamada(namRefs);

      await importAccount(browser, page);
      await approveConnection(browser, page);

      // Click on staking button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Staking')]"
        )
      ).click();

      // Click on validator
      (
        await waitForXpath<HTMLSpanElement>(
          page,
          "//span[contains(., 'atest1v4')]"
        )
      ).click();

      // Click on stake button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Stake')]"
        )
      ).click();

      // Type staking amount
      const [stakeInput] = await page.$$("input");
      await stakeInput.type("100");

      // Click confirm
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Confirm')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const bondCompletedToast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(bondCompletedToast).toBeDefined();

      // Click on unstake
      (
        await waitForXpath<HTMLSpanElement>(
          page,
          "//span[contains(., 'unstake')]"
        )
      ).click();

      await page.waitForNavigation();
      const [unstakeInput] = await page.$$("input");
      await unstakeInput.type("100");

      // Click confirm
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Confirm')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const unbondCompletedToast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(unbondCompletedToast).toBeDefined();

      // Wait for new epoch
      page.on("dialog", async (dialog) => {
        await new Promise((resolve) => setTimeout(resolve, 70000));
        await dialog.accept();
      });

      await page.evaluate(() =>
        alert(
          'E2E info: We need to wait a minute before we can withdraw funds :|\n[do not touch "Ok" :), this window will close automatically]'
        )
      );

      // Click on send button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Staking')]"
        )
      ).click();
      await page.waitForNavigation();

      // Click on validator
      (
        await waitForXpath<HTMLSpanElement>(
          page,
          "//span[contains(., 'atest1v4')]"
        )
      ).click();

      // Click on withdraw
      (
        await waitForXpath<HTMLSpanElement>(
          page,
          "//span[contains(., 'withdraw')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const withdrawCompletedToast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(withdrawCompletedToast).toBeDefined();

      await stopNamada(nam);
    });
  });

  describe.skip("proposals", () => {
    test("vote", async () => {
      const nam = startNamada(namRefs);

      await importAccount(browser, page);
      await approveConnection(browser, page);

      initProposal();

      // Click on staking button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Staking')]"
        )
      ).click();

      // Click on validator
      (
        await waitForXpath<HTMLSpanElement>(
          page,
          "//span[contains(., 'atest1v4')]"
        )
      ).click();

      // Click on stake button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Stake')]"
        )
      ).click();

      // Type staking amount
      const [stakeInput] = await page.$$("input");
      await stakeInput.type("100");

      // Click confirm
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Confirm')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const bondCompletedToast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(bondCompletedToast).toBeDefined();

      await new Promise((resolve) => setTimeout(resolve, 40000));

      // Click on proposals button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Proposals')]"
        )
      ).click();

      // Click on ongoing proposal
      (
        await page.waitForSelector(
          "div[data-testid='proposals-list'] > div:nth-child(1)"
        )
      )?.click();

      // Click on Vote YAY button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Vote YAY')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const yayCompletedToast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(yayCompletedToast).toBeDefined();

      // Click on Vote NAY button
      (
        await waitForXpath<HTMLButtonElement>(
          page,
          "//button[contains(., 'Vote NAY')]"
        )
      ).click();

      await approveTransaction(browser);

      // Wait for success toast
      const nayCompletedToast = await page.waitForXPath(
        "//div[contains(., 'Transaction completed!')]"
      );

      expect(nayCompletedToast).toBeDefined();

      await stopNamada(nam);
    });
  });
});
