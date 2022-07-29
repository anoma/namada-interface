import { test, expect } from "@playwright/test";

const sleepMs = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const OUR_MAX_ANIMATION_DURATION = 2000;
const TOGGLE_SELECTOR = "data-testid=Toggle";
const BACKGROUND_SELECTOR = "data-testid=AppContainer";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const NETLIFY_SITE_PROTECTION_PASSWORD =
  process.env.NETLIFY_SITE_PROTECTION_PASSWORD || "";

test.only("user create an initial account and set up a seed phrase", async ({
  page,
}) => {
  // load the page
  if (BASE_URL.startsWith("https://pull-request")) {
    await page.goto(BASE_URL);
    await (
      await page.waitForSelector(`[name='password']`)
    ).fill(NETLIFY_SITE_PROTECTION_PASSWORD);
    await (await page.waitForSelector(`text=Submit`)).click();
  } else {
    await page.goto(BASE_URL);
  }

  await (await page.waitForSelector(`text=Create an account`)).click();

  const getWordByIndex = async (index: string): Promise<string | undefined> => {
    const text = await page.locator("span", {
      hasText: new RegExp(`^${index}$`, "i"),
    });
    if (text) {
      try {
        const parent = await text.locator("xpath=..");
        // this takes a bit but not long, we want to throw if it does not find it
        const word = await parent?.innerHTML({ timeout: 1500 });
        // TODO checkout the proper way to do this with the API
        return Promise.resolve(word.split("</span>")[1]);
      } catch {
        return undefined;
      }
    }
  };

  // get the seed phrase to an array
  let words: string[] = [];

  let index = 1;
  while (true) {
    const indexAsString = `${index}`;
    const seedPhraseWord = await getWordByIndex(indexAsString);
    if (seedPhraseWord) {
      const word = seedPhraseWord;
      words.push(`${word.trim()}`);
      index++;
      continue;
    } else {
      break;
    }
  }

  // go to enter the seed phrase
  // I wrote down my mnemonic
  await (await page.waitForSelector(`text=I wrote down my mnemonic`)).click();

  await sleepMs(2000);
  const text = await page.locator("h5");
  const requestedIndex = (await text.innerHTML()).split("#")[1];
  expect(true).toEqual(true);

  // enter the correct word
  await (
    await page.waitForSelector(`input`)
  ).fill(words[Number(requestedIndex) - 1]);

  await (await page.waitForSelector(`text=Verify`)).click();
  await sleepMs(2000);
});

// test("user can go back and forth in the account initiation process and the seed phrase is being persisted", async ({
//   page,
// }) => {
//   // load the page
//   if (BASE_URL.startsWith("https://pull-request")) {
//     await page.goto(BASE_URL);
//     await (
//       await page.waitForSelector(`[name='password']`)
//     ).fill(NETLIFY_SITE_PROTECTION_PASSWORD);
//     await (await page.waitForSelector(`text=Submit`)).click();
//   } else {
//     console.log(`BASE_URL: ${BASE_URL}`);
//     await page.goto(BASE_URL);
//   }

//   // ensure loading correctly by checking the title
//   await expect(page).toHaveTitle("Namada Interface");

//   // lets get the background and check it's color
//   const appContainer = await page.waitForSelector(BACKGROUND_SELECTOR);
//   const backgroundColor = await appContainer.evaluate((element) => {
//     return window
//       .getComputedStyle(element)
//       .getPropertyValue("background-color");
//   });

//   // lets click the dark/light mode toggle
//   await (await page.waitForSelector(TOGGLE_SELECTOR)).click();

//   // give some time for the animation
//   await sleep(OUR_MAX_ANIMATION_DURATION);

//   // lets get the color again after click
//   const backgroundColorAfterToggle = await appContainer.evaluate((element) => {
//     return window
//       .getComputedStyle(element)
//       .getPropertyValue("background-color");
//   });

//   // and make sure that the background color has changed
//   expect(backgroundColor).not.toEqual(backgroundColorAfterToggle);
// });
