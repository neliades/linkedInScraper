const openPage = require('../puppeteerHelpers/openNewPage')
const queryInSection = require('../queryInSection.js')

const openPageWithLoginCircumvention = require('./pageHelpers/openPageWithLoginCircumvention');


const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.companyProfile;
const feedSelector = linkedIn.errorHandling.feed;

const companyProfile = async (browser, url, checkForLogin = false, max = 5, count = 0) => {
    try {

        let page = await openPageWithLoginCircumvention(browser, url, checkForLogin, [selectors.header, feedSelector], 'company')

        
        let {website} = (await queryInSection(page, selectors.topCard))[0];

        await page.close()

        return website;

    } catch (error) {
        count++;
        console.log(`Error capturing company profile. Attempt ${count}/${max}`);
        if (count === 5) {
            console.log('Terminating company capture');
            return null;
        }
        return companyProfile(browser, url, true, max, count);
      }
}

module.exports = companyProfile;