import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const NETLIFY_SITE_PROTECTION_PASSWORD =
  process.env.NETLIFY_SITE_PROTECTION_PASSWORD || "";

test("user should be able to create an initial account and set up a password", async ({
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

  // start the flow
  await (await page.waitForSelector(`text=Create an account`)).click();

  // lets get the seed phrase to an array
  // gets a single seed phrase word by index, returns undefined when one is not found
  const getWordByIndex = async (index: string): Promise<string | undefined> => {
    try {
      const label = await page.waitForSelector(`css=span >> text="${index}"`, {
        timeout: 10000,
      });
      const labelContainer = await label.waitForSelector(`xpath=..`);
      // if we have gone through all it wont be found, let's do a shorter timeout
      const labelContainerHtml = await labelContainer.innerHTML();
      console.log("labelContainerHtml");
      console.log(labelContainerHtml);
      return Promise.resolve(labelContainerHtml.split("</span>")[1]);
    } catch {
      return Promise.reject(undefined);
    }
  };

  // get the seed phrase words to an array
  let words: string[] = [];
  let index = 1;

  while (true) {
    try {
      const indexAsString = `${index}`;
      const seedPhraseWord = await getWordByIndex(indexAsString);
      if (seedPhraseWord) {
        const word = seedPhraseWord;
        words.push(`${word.trim()}`);
        index++;
        continue;
      }
    } catch {
      break;
    }
  }

  // ok we wrote down the mnemonic
  const mnemonicButton = await page.waitForSelector(
    `text=I wrote down my mnemonic`
  );
  await mnemonicButton.click();
  // go to enter the seed phrase
  const text = await page.waitForSelector("h5");
  const requestedIndex = (await text.innerHTML()).split("#")[1];

  // enter the correct word
  console.log("words");
  console.log(words);
  console.log("requestedIndex");
  console.log(requestedIndex);
  console.log("Number(requestedIndex)");
  console.log(Number(requestedIndex));
  await (
    await page.waitForSelector(`input`)
  ).fill(words[Number(requestedIndex) - 1]);

  const verifyButton = await page.waitForSelector(`button >> text=Verify`);
  await verifyButton.click();

  // set password
  const createAccountButton = await page.waitForSelector(
    `text=Create an Account`
  );
  // the button should be disabled before we have entered 2 same values
  expect(await createAccountButton.isDisabled()).toBeTruthy();
  const password = "aaa";
  const passwordField = await page.waitForSelector(
    `text=Create password >> xpath=..`
  );
  await (await passwordField.waitForSelector("input")).fill(password);
  const connfirmPasswordField = await page.waitForSelector(
    `text=Confirm password >> xpath=..`
  );
  // it should still be disabled
  expect(await createAccountButton.isDisabled()).toBeTruthy();
  await (await connfirmPasswordField.waitForSelector("input")).fill(password);

  // now it should be enabled
  expect(await createAccountButton.isDisabled()).toBeFalsy();
  await createAccountButton.click();

  // ensure creation of an account
  // could this be flaky if it happens before this notices it?
  await page.waitForSelector(`text=Creating your wallet`);
  await page.waitForSelector(`text=Total Balance`);
});
