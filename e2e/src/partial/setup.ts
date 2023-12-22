import * as puppeteer from "puppeteer";

import {
  allowClipboardRead,
  openInterface,
  openSetup,
  pasteValueInto,
  waitForXpath,
} from "../utils/helpers";
import { mnemonic, pwdOrAlias } from "../utils/values";

export const importAccount = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page
): Promise<void> => {
  await openSetup(browser, page);

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

  const wordInputs = await page.$$("input");

  // Fill mnemonic
  await pasteValueInto(page, wordInputs[5], mnemonic.join(" "));

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
  await openInterface(page);
};

export const createAccount = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page
): Promise<void> => {
  await openSetup(browser, page);
  await allowClipboardRead(page);

  // Click on create account
  (
    await page.waitForSelector("[data-testid='setup-create-keys-button']")
  )?.click();

  await page.waitForNavigation();

  // Click on show phrase
  (
    await page.waitForSelector("[data-testid='setup-show-phrase-button']")
  )?.click();

  await page.waitForNavigation();

  // Copy mnemonic
  (
    await page.waitForSelector("[data-testid='setup-copy-to-clipboard-button']")
  )?.click();

  // Wait for clipboard to be filled
  await new Promise((r) => setTimeout(r, 500));

  const words = await page.$$eval(
    "[data-testid='setup-seed-phrase-list'] li",
    (els) => els.map((el) => el.textContent as string)
  );

  expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
    words.join(" ")
  );

  // Continue to verification
  (
    await page.waitForSelector(
      "[data-testid='setup-go-to-verification-button']"
    )
  )?.click();
  await page.waitForNavigation();

  // Verify mnemonic
  const input1 = await page.$(
    "[data-testid='setup-seed-phrase-verification-1-input']"
  );

  const input2 = await page.$(
    "[data-testid='setup-seed-phrase-verification-2-input']"
  );

  const word1Number = (await input1?.evaluate((el) => el.textContent))?.replace(
    "Word #",
    ""
  );

  const word2Number = (await input2?.evaluate((el) => el.textContent))?.replace(
    "Word #",
    ""
  );

  await (await input1?.$("input"))?.type(words[Number(word1Number) - 1]);
  await (await input2?.$("input"))?.type(words[Number(word2Number) - 1]);

  // Fill alias and pwd
  const aliasInput = await page.$(
    "[data-testid='setup-seed-phrase-alias-input']"
  );
  await aliasInput?.type(pwdOrAlias);

  const pwdInputs = await page.$$(
    "[data-testid='setup-seed-phrase-pwd-input']"
  );

  for await (const input of pwdInputs) {
    await input.type(pwdOrAlias);
  }

  (
    await page.waitForSelector(
      "[data-testid='setup-seed-phrase-verification-next-btn']"
    )
  )?.click();

  await page.waitForNavigation();

  const closePageBtn = await page.waitForSelector(
    "[data-testid='setup-close-page-btn']",
    {}
  );

  expect(closePageBtn).not.toBeNull();
};
