import { test, expect } from "@playwright/test";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const OUR_MAX_ANIMATION_DURATION = 2000;
const TOGGLE_SELECTOR = "data-testid=Toggle";
const BACKGROUND_SELECTOR = "data-testid=AppContainer";

test("main page loads with correct title and allows changing color mode", async ({
  page,
}) => {
  // load the page
  await page.goto("http://localhost:3000");

  // ensure loading correctly by checking the title
  await expect(page).toHaveTitle("Namada Interface");

  // lets get the background and check it's color
  const appContainer = await page.waitForSelector(BACKGROUND_SELECTOR);
  const backgroundColor = await appContainer.evaluate((element) => {
    return window
      .getComputedStyle(element)
      .getPropertyValue("background-color");
  });

  // lets click the dark/light mode toggle
  await (await page.waitForSelector(TOGGLE_SELECTOR)).click();

  // give some time for the animation
  await sleep(OUR_MAX_ANIMATION_DURATION);

  // lets get the color again after click
  const backgroundColorAfterToggle = await appContainer.evaluate((element) => {
    return window
      .getComputedStyle(element)
      .getPropertyValue("background-color");
  });

  // and make sure that the background color has changed
  expect(backgroundColor).not.toEqual(backgroundColorAfterToggle);
});
