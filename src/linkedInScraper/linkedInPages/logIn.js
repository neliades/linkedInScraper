const openPage = require('../puppeteerHelpers/openNewPage.js')
const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.logIn;

const logIn = async (browser, email, password) => {
  const url = 'https://www.linkedin.com'
  const page = await openPage(browser, url)

  await page.goto(url)
  await page.waitFor(selectors.emailBox)

  let emailBox = await page.$(selectors.emailBox);
  await emailBox.type(email);

  let passwordBox = await page.$(selectors.passwordBox);
  await passwordBox.type(password);

  let submitButton = await page.$(selectors.submitButton);
  await submitButton.click();

  try {
    let searchBox = await page.waitFor(selectors.searchBox, { timeout: 15000 });
    await page.close();
    return (searchBox);
  } catch (error) {
    await browser.close()
    console.log(`
    There was an error with login.  The site may have required a not-a-robot check.  Try again.
    If the problem persists, check that your username and password are correct.
    Set isVisible to true for visual confirmation.
    If the problem persists further, the selectors used to find the login elements may be outdated.
    
    Error log: `, error, '\n')
    return;
  }
}

module.exports = logIn;