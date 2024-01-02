import * as puppeteer from "puppeteer";
import { targetPage, waitForXpath } from "../utils/helpers";
import { pwd } from "../utils/values";

export const approveConnection = async (
  browser: puppeteer.Browser,
  page: puppeteer.Page
): Promise<void> => {
  // Click on connect to extension
  (
    await waitForXpath<HTMLButtonElement>(
      page,
      "//button[contains(., 'Connect to')]"
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
};

export const approveTransaction = async (
  browser: puppeteer.Browser
): Promise<void> => {
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

  (await approvalsPage.$("input"))?.type(pwd);

  // Click approve auth button
  (
    await waitForXpath<HTMLButtonElement>(
      approvalsPage,
      "//button[contains(., 'Authenticate')]"
    )
  ).click();
};
