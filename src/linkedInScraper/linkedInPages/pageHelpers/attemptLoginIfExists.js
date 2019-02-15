const handleCaptcha = require('./handleCaptcha');
const determineWhichLogin = require('./determineWhichLogin.js');
const {linkedIn} = require('../../selectorsList.js');
const defaultConfirmation = linkedIn.errorHandling.defaultConfirmation;

const attemptLoginIfExists = async (page, credentials, confirmationSelector, timeout = 1000 * 0.5, count = 0, max = 5) => {
  confirmationSelector = confirmationSelector || defaultConfirmation;
  try {
    
    await handleCaptcha(page);
    let selectors = await determineWhichLogin(page);
    if (selectors) {
      let email = await page.$(selectors.email);
      await email.type(credentials.email);
  
      let password= await page.$(selectors.password);
      await password.type(credentials.password);
  
      let submit = await page.$(selectors.submit);
      await submit.click();

    }

    try {
      let pageAfterLoginExists = await page.waitForSelector(confirmationSelector, { timeout });
      await page.close();
      return (pageAfterLoginExists);
    } catch (error) {
      // await browser.close()
      if (!selectors) throw console.log(`No login was required, but the provided confirmation selector could not be found.`);
      throw console.log (`
      There was an error with login.  The provided confirmation selector could not be found.  The site may have required a not-a-robot check.  Try again.
      If the problem persists, check that your username and password are correct.
      Set isVisible to true for visual confirmation.
      If the problem persists further, the selectors used to find the login elements may be outdated.
      
      Error log: `, error, '\n')
    }
  
  
  } catch (error) {
    count++;
    console.log(`Error logging in.  The scraper may not have been able to move past a not-a-robot check. Attempt ${count}/${max}`);
    if (count === max) throw console.log(`
    Terminating. If the problem persists, check that your username and password are correct.
    Set isVisible to true for visual confirmation.
    If the problem persists further, the selectors used to find the login elements may be outdated.
    `)
    return await attemptLoginIfExists(page, credentials, confirmationSelector, timeout, count, max);
  }
}

module.exports = attemptLoginIfExists;