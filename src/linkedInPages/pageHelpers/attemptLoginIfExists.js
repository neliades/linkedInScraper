const handleCaptcha = require('./handleCaptcha');
const determineWhichLogin = require('./determineWhichLogin.js');
const {linkedIn} = require('../../selectorsList.js');
const defaultConfirmation = linkedIn.errorHandling.defaultConfirmation;
const credentials = require('../../config.js');

const openNewPage = require('../../puppeteerHelpers/openNewPage.js');

const attemptLoginIfExists = async (page, browser, url, timeout = 1000 * 2, closePage = false, confirmationSelector, count = 0, max = 5) => {
  console.log('attempting Login if exists invoked')
  confirmationSelector = confirmationSelector || defaultConfirmation;
  try {
    
    await handleCaptcha(page);
    let selectors;
    try {
      selectors = await determineWhichLogin(page);
    } catch (error) {
      console.log('no login selectors found or encountered error')
    }
    console.log({selectors})
    if (selectors) {

      let email = await page.$(selectors.email);
      await email.type(credentials.email);
  
      let password= await page.$(selectors.password);
      await password.type(credentials.password);
  
      let submit = await page.$(selectors.submit);
      await submit.click();

    }

    try {
      await page.waitFor(linkedIn.errorHandling.skipButton, { timeout: 1000 * 0.25});
      page.waitForNavigation({ timeout: 1000 * 1});
      console.log('handled skip')
    } catch (error) {
      console.log('could not find another skip button')
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
    console.log('bout to close page')
    await page.close()
    console.log('opening new page')
    page = await openNewPage(browser, url)
    console.log('reinvoking attempt login if exists')
    return await attemptLoginIfExists(page, browser, url, timeout, closePage, confirmationSelector, count, max);
  
  }
}

module.exports = attemptLoginIfExists;