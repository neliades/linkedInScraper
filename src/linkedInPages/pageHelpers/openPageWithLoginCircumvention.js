const openPage = require('../../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../../puppeteerHelpers/scrollToBottom.js')
const clickAll = require('../../puppeteerHelpers/clickAll')
const userProfile = require('../userProfile.js')
const queryInSection = require('../../queryInSection.js')
const attemptLoginIfExists = require('../pageHelpers/attemptLoginIfExists');

const timeLap = require('../../timeKeeping/trackTime.js')

const {linkedIn} = require('../../selectorsList.js');
const selectors = linkedIn.userSearch;
const feedSelector = linkedIn.errorHandling.feed;

const openPageWithLoginCircumvention = async (browser, url, checkForLogin = false, confirmationSelectors, pageName = '') => {
    let page;
    if (typeof confirmationSelectors === 'string') confirmationSelectors = [confirmationSelectors];
    try { page = await openPage(browser, url); } catch (error) { throw console.log ('Could not open new page') }
    try {
        await page.waitFor(confirmationSelectors[0], { timeout: 1000 * 0.25 });
    } catch(error) {
        console.log(url)
        throw console.log (`No ${pageName} found`)
    };
    if (checkForLogin) {
        console.log('\nsecure open\n')
        try {
            let successfulSelector = await attemptLoginIfExists(page, browser, url, 1000 * 2, false, confirmationSelectors);
            if (!successfulSelector || successfulSelector === feedSelector) {
                await page.close();
                page = await openPage(browser, url);
            }
        } catch(error) {
            throw console.log(`Failed a security check or no ${pageName} page found at `, url)
        }
    }
        return page;
}

module.exports = openPageWithLoginCircumvention;