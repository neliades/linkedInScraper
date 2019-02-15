const openNewPage = require('../puppeteerHelpers/openNewPage.js')
const attemptLoginIfExists = require('./pageHelpers/attemptLoginIfExists');

const logIn = async (browser, email, password) => {
  try {
    const url = 'https://www.linkedin.com'
    const page = await openNewPage(browser, url)

    await attemptLoginIfExists(page, {email, password}, null, 1000 * 15)

        // throw (`
        // There was an error with login.  The site may have required a not-a-robot check.  Try again.
        // If the problem persists, check that your username and password are correct.
        // Set isVisible to true for visual confirmation.
        // If the problem persists further, the selectors used to find the login elements may be outdated.
        
        // Error log: `, error, '\n')
  } catch (error) {
    throw console.log('Failed to log in.  Terminating.');
  }
}

module.exports = logIn;