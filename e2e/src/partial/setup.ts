import * as puppeteer from "puppeteer";
import {
  allowClipboardRead,
  openSetup,
  pasteValueInto,
} from "../utils/helpers";
import { alias0, mnemonic0, pwd } from "../utils/values";

export const importAccount = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page,
  options?: { passphrase?: string; skipExpect?: boolean }
): Promise<void> => {
  await openSetup(browser, page);

  // Click on import account
  (
    await page.waitForSelector("[data-testid='setup-import-keys-button']")
  )?.click();
  await page.waitForNavigation();

  const wordInputs = await page.$$(
    "[data-testid='setup-seed-phrase-list'] input"
  );

  // Fill mnemonic
  await pasteValueInto(page, wordInputs[5], mnemonic0.join(" "));

  const passphrase = options?.passphrase;
  if (typeof passphrase === "string") {
    // Click on import with passphrase button
    await (
      await page.waitForSelector(
        "[data-testid='setup-import-keys-use-passphrase-button']"
      )
    )?.click();

    // Fill passphrase
    await (
      await page.$("[data-testid='setup-import-keys-passphrase-input']")
    )?.type(passphrase);
  }

  // Click on import button
  (
    await page.waitForSelector(
      "[data-testid='setup-import-keys-import-button']"
    )
  )?.click();
  await page.waitForNavigation();

  // Fill alias and pwd
  await (
    await page.$("[data-testid='setup-import-keys-alias-input']")
  )?.type(alias0);

  const pwdInputs = await page.$$(
    "[data-testid='setup-import-keys-pwd-input']"
  );
  for await (const input of pwdInputs) {
    await input.type(pwd);
  }

  // Click on next button
  (
    await page.waitForSelector("[data-testid='setup-import-keys-next-button']")
  )?.click();
  await page.waitForNavigation();

  if (!options?.skipExpect) {
    const closePageBtn = await page.waitForSelector(
      "[data-testid='setup-close-page-btn']",
      {}
    );
    expect(closePageBtn).not.toBeNull();
  }
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
  await aliasInput?.type(alias0);

  const pwdInputs = await page.$$(
    "[data-testid='setup-seed-phrase-pwd-input']"
  );

  for await (const input of pwdInputs) {
    await input.type(pwd);
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
