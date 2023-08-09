import * as puppeteer from "puppeteer";

export const waitForXpath = async <T extends Node>(
  page: puppeteer.Page,
  xpath: string
): Promise<puppeteer.ElementHandle<T>> => {
  const element = await page.waitForXPath(xpath);

  return element as puppeteer.ElementHandle<T>;
};

export const $x = async <T extends Node>(
  page: puppeteer.Page,
  xpath: string
): Promise<puppeteer.ElementHandle<T>[]> => {
  const element = await page.$x(xpath);
  return element.map((e) => e as puppeteer.ElementHandle<T>);
};

export const targetPage = async (
  target: puppeteer.Target
): Promise<puppeteer.Page> => {
  const page = await target.page();
  if (!page) {
    throw new Error("Page not found");
  }
  return page;
};
