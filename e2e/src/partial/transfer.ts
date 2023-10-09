import * as puppeteer from "puppeteer";
import { targetPage, waitForXpath, pwdOrAlias } from "../utils";

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
    "//div[contains(., 'Transaction completed!')]",
    { timeout: transferTimeout || 60_000 }
  );

  expect(toast).toBeDefined();
};
