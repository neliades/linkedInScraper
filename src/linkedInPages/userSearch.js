const openPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const clickAll = require('../puppeteerHelpers/clickAll')
const userProfile = require('./userProfile.js')
const queryInSection = require('../queryInSection.js')
const attemptLoginIfExists = require('./pageHelpers/attemptLoginIfExists');
const openPageWithLoginCircumvention = require('./pageHelpers/openPageWithLoginCircumvention');

const timeLap = require('../timeKeeping/trackTime.js')

const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.userSearch;
const feedSelector = linkedIn.errorHandling.feed;

const progress = require('../progressTracking/progressBars.js')

//open page
//scroll to bottom
//query the selectors for hrefs
//invoke userProfile on hrefs
//return array containing results

const userSearch = async (browser, url, checkForLogin = false, max = 5, count = 0) => {
    try {
        let page = await openPageWithLoginCircumvention(browser, url, checkForLogin, [selectors.header, feedSelector], 'search')
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
                // let time = timeLap('userSearch', num);
                
                // if (time.lapTime) console.log(`\nUser data collected in ${time.lapTime}`);

                // console.log(`\nGathering info on user profile ${time.currentCount}/${time.expectedCount}`);
                // if (time.expectedTime) console.log(`\n${time.currentCount}/${time.expectedCount} complete. Estimated time to completion: ${time.expectedTime}`);
                let {profileUrl, distance} = profileUrls[i];
                if (distance) distance = parseFloat(distance);
                
                let profile = await userProfile(browser, profileUrl, null, null, null, distance);
                results.push(profile);

                // console.log('tick')
                //send index and num to master
                process.send({tick: true, num});

                // if(parseInt(i) === profileUrls.length - 1) {
                //     console.log(profileUrl)
                //     console.log('\n', timeLap('userSearch', profileUrls.length, true))};
            }
        } catch (error) {
            throw console.log ('Could not get user data', error)
        }
        //if the page selector bar exists, take the cpuCount and add it to the current page

        //then invoke scrapeLinkedIn
        // scrapeLinkedIn(msg.email, msg.password, msg.url, msg.isVisible, null, true);

        await page.close()
        return {results, num};

    } catch (error) {
        count++;
        console.log(error)
        console.log(`Error capturing user profiles from search. Attempt ${count}/${max}`);
        if (count === 5) throw console.log ('Terminating.')
        return userSearch(browser, url, true, max, count);
      }
}

module.exports = userSearch;