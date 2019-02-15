const openPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const clickAll = require('../puppeteerHelpers/clickAll')
const userProfile = require('./userProfile.js')
const queryInSection = require('../queryInSection.js')

const timeLap = require('../timeKeeping/trackTime.js')

const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.userSearch;

//open page
//scroll to bottom
//query the selectors for hrefs
//invoke userProfile on hrefs
//return array containing results

const userSearch = async (browser, url, max = 5, count = 0) => {
    try {
        let page;
        try { page = await openPage(browser, url); } catch (error) { throw console.log ('Could not open new page') }
        try {
            await page.waitFor(selectors.header, { timeout: 5000 });
        } catch(error) {
            throw console.log('No search page found at ', url)
        }

        try { await scrollToBottom(page, selectors.footer) } catch (error) { throw console.log ('Could not scroll to bottom') }

        let profileUrls = []
        let num;
        try {
            profileUrls = await queryInSection(page, selectors.searchResult);
            num = (await queryInSection(page, selectors.numOfResultsBanner))[0];
            if(num) num = num.numOfResults.replace(/[^\d]/g, '');
            
        } catch (error) {
            console.log('failed to capture search results');
        }
        
        let results = [];
        try {
            for (let i in profileUrls) {
                let time = timeLap('userSearch', profileUrls.length);
                if (time.lapTime) console.log(`\nUser data collected in ${time.lapTime}`);
                // console.log(`\nGathering info on user profile ${time.currentCount}/${time.expectedCount}`);
                if (time.expectedTime) console.log(`\n${time.currentCount}/${time.expectedCount} complete. Estimated time to completion: ${time.expectedTime}`);
                let {profileUrl} = profileUrls[i];
                results.push(await userProfile(browser, profileUrl));
                if(parseInt(i) === profileUrls.length - 1) console.log('\n', timeLap('userSearch', profileUrls.length, true));
            }
        } catch (error) {
            throw console.log ('Could not get user data')
        }
        //if the page selector bar exists, take the cpuCount and add it to the current page

        //then invoke scrapeLinkedIn
        // scrapeLinkedIn(msg.email, msg.password, msg.url, msg.isVisible, null, true);

        await page.close()
        return {results, num};

    } catch (error) {
        count++;
        console.log(`Error capturing user profiles from search. Attempt ${count}/${max}`);
        if (count === 5) throw console.log ('Terminating.')
        return userSearch(browser, url, max, count);
      }
}

module.exports = userSearch;