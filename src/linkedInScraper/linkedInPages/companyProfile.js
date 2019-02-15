const openPage = require('../puppeteerHelpers/openNewPage')
const queryInSection = require('../queryInSection.js')

const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.companyProfile;

const companyProfile = async (browser, url, max = 5, count = 0) => {
    try {
        const page = await openPage(browser, url);
        try {
            await page.waitFor(selectors.header, { timeout: 5000 });
        } catch(error) {
            console.log(url)
            throw new Error('No company found');
        }
        
        let {website} = (await queryInSection(page, selectors.topCard))[0];

        await page.close()

        return website;

    } catch (error) {
        count++;
        console.log(`Error capturing company profile. Attempt ${count}/${max}`);
        if (count === 5) throw 'Terminating.'
        return companyProfile(browser, url, max, count);
      }
}

module.exports = companyProfile;