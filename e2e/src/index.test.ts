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
  transferFromShielded,
  transferFromTransparent,
} from "./partial";
import {
  initProposal,
  launchPuppeteer,
  openInterface,
  openPopup,
  pasteValueInto,
  setupNamada,
  startNamada,
  stopNamada,
  waitForXpath,
} from "./utils/helpers";
import {
  address0,
  address1,
  ethAddress0,
  passphrase0,
  passphrase1,
  shieldedAddress0,
  shieldedAddress1,
} from "./utils/values";

jest.setTimeout(600000);

let browser: puppeteer.Browser;
let page: puppeteer.Page;

describe("Namada", () => {
  const namRefs = new Set<ChildProcess>();

  beforeEach(async function () {
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
    test("create account & derive addresses", async () => {
      await createAccount(browser, page);
    });

    test("import account & derive addresses", async () => {
      await importAccount(browser, page);
    });

    test("import accounts with passphrases", async () => {
      await importAccount(browser, page, { passphrase: passphrase0 });
      await importAccount(browser, page, { passphrase: passphrase1 });

      // Wait for close page button
      const closePageBtn = await page.waitForSelector(
        "[data-testid='setup-close-page-btn']"
      );
      expect(closePageBtn).not.toBeNull();

      await importAccount(browser, page, {
        passphrase: passphrase1,
        skipExpect: true,
      });

      // Wait for alert
      const errorAlert = await page.waitForSelector(
        "[data-testid='setup-error-alert']"
      );
      expect(errorAlert).not.toBeNull();
    });
  });

  describe("transfer", () => {
    let nam: ChildProcess;

    beforeEach(async function () {
      await setupNamada();
      nam = startNamada(namRefs);
    });

    afterEach(async function () {
      await stopNamada(nam);
    });

    test("transparent->transparent", async () => {
      await importAccount(browser, page);
      await openInterface(page);
      await approveConnection(browser, page);

      await transferFromTransparent(browser, page, {
        targetAddress: address1,
        amount: "1000",
      });
    });

    test("transparent->shielded", async () => {
      await importAccount(browser, page);
      await openInterface(page);
      await approveConnection(browser, page);

      await transferFromTransparent(browser, page, {
        targetAddress: shieldedAddress0,
        amount: "1000",
        transferTimeout: 240000,
      });
    });

    test("shielded->transparent", async () => {
      await importAccount(browser, page);
      await openInterface(page);
      await approveConnection(browser, page);

      await transferFromTransparent(browser, page, {
        targetAddress: shieldedAddress0,
        amount: "1000",
        transferTimeout: 240000,
      });

      await openInterface(page);
      await transferFromShielded(browser, page, {
        targetAddress: address0,
        amount: "10",
        transferTimeout: 360000,
      });
    });

    test("shielded->shielded", async () => {
      await importAccount(browser, page);
      await openInterface(page);
      await approveConnection(browser, page);

      await transferFromTransparent(browser, page, {
        targetAddress: shieldedAddress0,
        amount: "1000",
        transferTimeout: 240000,
      });

      await openInterface(page);
      await transferFromShielded(browser, page, {
        targetAddress: shieldedAddress1,
        amount: "10",
        transferTimeout: 360000,
      });
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
