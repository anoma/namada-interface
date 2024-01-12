import * as puppeteer from "puppeteer";
import { pasteValueInto, waitForXpath } from "../utils/helpers";
import { approveTransaction } from "./approvals";

export type TransferFromOptions = {
  targetAddress: string;
  amount: string;
  transferTimeout?: number;
};

export const transferFromTransparent = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page,
  { targetAddress, amount, transferTimeout }: TransferFromOptions
): Promise<void> => {
  // Click on send button
  (
    await waitForXpath<HTMLButtonElement>(page, "//button[contains(., 'Send')]")
  ).click();
  await page.waitForNavigation();

  // Navigate to transparent transfers
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Transparent')]"
    )
  ).click();

  await page.waitForSelector("option");

  // Fill transfer data
  const [recipentInput, amountInput] = await page.$$("input");

  await pasteValueInto(page, recipentInput, targetAddress);

  await amountInput.type(amount);

  // Continue transfer
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Continue')]"
    )
  ).click();

  await approveTransaction(browser);

  // Wait for success toast
  const toast = await page.waitForXPath(
    "//div[contains(., 'Transaction completed!')]",
    { timeout: transferTimeout || 60_000 }
  );

  expect(toast).toBeDefined();
};

export const transferFromShielded = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page,
  { targetAddress, amount, transferTimeout }: TransferFromOptions
): Promise<void> => {
  // Click on send button
  (
    await waitForXpath<HTMLButtonElement>(page, "//button[contains(., 'Send')]")
  ).click();
  await page.waitForNavigation();

  // Navigate to transparent transfers
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Shielded')]"
    )
  ).click();
  await page.waitForSelector("option");

  // Fill transfer data
  const [recipentInput, amountInput] = await page.$$("input");

  await pasteValueInto(page, recipentInput, targetAddress);

  await amountInput.type(amount);

  // Continue transfer
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Continue')]"
    )
  ).click();

  await approveTransaction(browser);

  // Wait for success toast
  const toast = await page.waitForXPath(
    "//div[contains(., 'Transaction completed!')]",
    { timeout: transferTimeout || 60_000 }
  );

  expect(toast).toBeDefined();
};
