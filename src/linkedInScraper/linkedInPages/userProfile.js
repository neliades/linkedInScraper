const openNewPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const clickAll = require('../puppeteerHelpers/clickAll')
const companyProfile = require('./companyProfile.js')
const queryInSection = require('../queryInSection.js')

const openPageWithLoginCircumvention = require('./pageHelpers/openPageWithLoginCircumvention');


const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.userProfile;
const feedSelector = linkedIn.errorHandling.feed;



const userProfile = async (browser, url, checkForLogin = false, max = 5, count = 0) => {
  try {
    let page = await openPageWithLoginCircumvention(browser, url, checkForLogin, [selectors.header, feedSelector], 'profile')

    await scrollToBottom(page, selectors.footer)

    //clicks on every see more button
    await clickAll(page, selectors.seeMore)

    for (let key in selectors.seeLess) {
      try { await page.waitFor(selectors.seeLess[key], { timeout: 1000 * 0.25 }); } catch (error) {};
    }

    let queryResults = {
      'profile': null,
      'positions': null,
      'educations': null,
      'skills': null,
      'recommendationsCount': null,
      'recommendationsReceived': null,
      'recommendationsGiven': null,
      'accomplishments': null,
      'volunteerExperience': null,
      'peopleAlsoViewed': null
    }; 

    //query for the data of each field
    for (let field in queryResults) {
      queryResults[field] = await queryInSection(page, selectors[field]);
    };

    //helper function
    let replaceStringInProperty = (object, property, searchValue, replaceValue ) => {
      if(object[property]) {object[property] = object[property].replace(searchValue, replaceValue);
      }
    }

    //group recommendations info
    let count = queryResults.recommendationsCount;
    count = count ? count[0] : count;
    queryResults.recommendations = {
        givenCount : count ? count.given.replace(/[^\d]/g, '') : null,
        receivedCount : count ? count.received.replace(/[^\d]/g, '') : null,
        received : queryResults.recommendationsReceived,
        given : queryResults.recommendationsGiven
    };

    
    //remove unnecessary parts of strings
    if (queryResults.profile) {
        queryResults.profile = queryResults.profile[0];
        replaceStringInProperty(queryResults.profile, 'connections', ' connections', '');
        queryResults.positions.forEach((position) => {
          replaceStringInProperty(position, 'title', 'Company Name\n', '');
          replaceStringInProperty(position, 'description', 'See more', '');
          if(position.roles) {
              position.roles.forEach((role) => {
              replaceStringInProperty(role, 'title', 'Title\n', '');
              replaceStringInProperty(role, 'description', 'See more', '');
              })
          }
        })
        let recommendationDetails = (key) => {
          if(queryResults.recommendations[key]) {
              queryResults.recommendations[key].forEach((recommendation) => {
                replaceStringInProperty(recommendation, 'summary', 'See more', '');
                replaceStringInProperty(recommendation, 'summary', 'See less', '');
              })
            }
        }
        recommendationDetails('received');
        recommendationDetails('given');
    }


    //delete duplicate information
    delete queryResults.recommendationsCount;
    delete queryResults.recommendationsGiven;
    delete queryResults.recommendationsReceived;

    //click on companies
    for (let i in queryResults.positions) {
      let position = queryResults.positions[i];
      let validUrl = position.linkedInUrl.split('linkedin.com/school').length > 1 || position.linkedInUrl.split('linkedin.com/company').length > 1;
      if (validUrl && position.companyUrl === null) position.companyUrl = await companyProfile(browser, position.linkedInUrl);
      if (position.roles) {
        for(let j in position.roles) {
          let role = position.roles[j];
          role.companyName = position.title;
          role.linkedInUrl = position.linkedInUrl;
          role.companyUrl = position.companyUrl;
        }
        queryResults.positions.splice(i,1,...position.roles);
      }
    }

    await page.close()
    return queryResults;
  } catch (error) {
    count++;
    console.log(error)
    console.log(`Error capturing user profile. Attempt ${count}/${max}`);
    if (count === 5) throw 'Terminating.'
    return userProfile(browser, url, true, max, count);
  }

}

module.exports = userProfile;