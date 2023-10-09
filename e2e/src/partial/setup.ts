import * as puppeteer from "puppeteer";

import {
  openInterface,
  openSetup,
  waitForXpath,
  $x,
  pasteValueInto,
  allowClipboardRead,
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

  // Check H1
  const setupH1 = await page.$eval("h1", (e) => e.innerText);
  expect(setupH1).toEqual("Create Your Account");

  // Click on create account
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Create an account')]"
    )
  ).click();
  await page.waitForNavigation();

  // Copy mnemonic
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//a[contains(., 'Copy to clipboard')]"
    )
  ).click();

  // Wait for clipboard to be filled
  await new Promise((r) => setTimeout(r, 500));

  const wordsHtml = await $x<HTMLDivElement>(
    page,
    "//div[starts-with(@class, 'SeedPhraseCard-')]"
  );

  const words = await Promise.all(
    wordsHtml.map((w) =>
      // Evaluate and remove indexes
      w.evaluate((ew) => ew.innerText.replace(/\d+\s/g, ""))
    )
  );

  expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
    words.join(" ")
  );

  // Continue to verification
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'I wrote down my mnemonic')]"
    )
  ).click();
  await page.waitForNavigation();

  // Verify mnemonic
  const wordNo = (
    await (
      await waitForXpath<HTMLButtonElement>(
        page,
        "//label[contains(., 'Word')]"
      )
    ).evaluate((e) => e.innerText)
  ).replace("Word #", "");
  const input = await page.$("input");
  await input?.type(words[Number(wordNo) - 1]);

  // Verify
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Verify')]"
    )
  ).click();
  await page.waitForNavigation();

  // Fill account info
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

  // Wait for setup completion
  await page.waitForXPath("//p[contains(., 'Setup is complete')]");
};
