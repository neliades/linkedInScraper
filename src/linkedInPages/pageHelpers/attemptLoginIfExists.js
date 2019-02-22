const handleCaptcha = require('./handleCaptcha');
const determineWhichLogin = require('./determineWhichLogin.js');
const {linkedIn} = require('../../selectorsList.js');
const defaultConfirmation = linkedIn.errorHandling.defaultConfirmation;
const credentials = require('../../config.js');

const attemptLoginIfExists = async (page, browser, url, timeout = 1000 * 2, closePage = false, confirmationSelector, count = 0, max = 5) => {
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
      let pageAfterLoginExists;
      let successfulSelector;
      if (typeof confirmationSelector === 'string') { confirmationSelector = [confirmationSelector] }
      for (let i in confirmationSelector) {
        let selector  = confirmationSelector[i];
        if (!pageAfterLoginExists) {
          if (i > 0) timeout = 0.25 * 1000;
          try { pageAfterLoginExists = await page.waitForSelector(confirmationSelector[i], { timeout }) } catch(error) {}; 
        }
        if (pageAfterLoginExists) {
          successfulSelector = confirmationSelector[i];
          break;
        }
      }
      if (closePage) await page.close();
      if (!pageAfterLoginExists) throw new Error();
      return (successfulSelector);
    } catch (error) {
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
    await page.close()
    page = await openNewPage(browser, url)
    return await attemptLoginIfExists(page, browser, url, timeout, closePage, confirmationSelector, count, max);
  }
}

module.exports = attemptLoginIfExists;