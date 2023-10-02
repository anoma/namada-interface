import * as puppeteer from "puppeteer";
import { approveTransaction } from "./approvals";
import { waitForXpath } from "../utils/helpers";

export type TransferFromOptions = {
  targetAddress: string;
  transferTimeout?: number;
};

export const transferFromTransparent = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page,
  { targetAddress, transferTimeout }: TransferFromOptions
): Promise<void> => {
  // Click on send button
  (
    await waitForXpath<HTMLButtonElement>(page, "//button[contains(., 'Send')]")
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
  await recipentInput.type(targetAddress);
  await amountInput.type("10");

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
