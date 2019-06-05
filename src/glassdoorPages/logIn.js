
const openNewPage = require('../puppeteerHelpers/openNewPage.js')
const {glassdoor} = require('../selectorsList.js');
const selectors = glassdoor.logIn;

// const attemptLoginIfExists = require('./pageHelpers/attemptLoginIfExists');

const logIn = async (browser, email, password) => {
  try {
    const url = 'https://www.glassdoor.com'
    const page = await openNewPage(browser, url)

    //click sign in
    //await for email box
    let signInButton = await page.$(selectors.signInButton);
    await signInButton.click();
    await page.waitForSelector(selectors.emailBox);

    let emailBox = await page.$(selectors.emailBox);
    await emailBox.type(email);

    let passwordBox = await page.$(selectors.passwordBox);
    await passwordBox.type(password);

    let submit = await page.$(selectors.submitButton);
    await submit.click();

    await page.waitForSelector(selectors.searchBox);

    await page.close();

    // return await attemptLoginIfExists(page, browser, url, 1000 * 15, true);

        // throw (`
        // There was an error with login.  The site may have required a not-a-robot check.  Try again.
        // If the problem persists, check that your username and password are correct.
        // Set isVisible to true for visual confirmation.
        // If the problem persists further, the selectors used to find the login elements may be outdated.
        
        // Error log: `, error, '\n')
  } catch (error) {
    throw console.log(error, 'Failed to log in.  Terminating.');
  }
}

module.exports = logIn;