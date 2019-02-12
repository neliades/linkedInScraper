const openPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const clickAll = require('../puppeteerHelpers/clickAll')
const queryInSection = require('../queryInSection.js')
const {linkedIn} = require('../selectorsList.js');
const selectors = linkedIn.userProfile;


module.exports = async (browser, url) => {
  const page = await openPage(browser, url);
  try {
    await page.waitFor(selectors.header, { timeout: 5000 });
  } catch(error) {
    throw new Error('No profile found')
  }

  
  await scrollToBottom(page, selectors.footer)

  //clicks on every see more button
  await clickAll(page, selectors.seeMore)

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
  queryResults.recommendations = {
      givenCount : queryResults.recommendationsCount[0].given.replace(/[^\d]/g, ''),
      receivedCount : queryResults.recommendationsCount[0].received.replace(/[^\d]/g, ''),
      received : queryResults.recommendationsReceived,
      given : queryResults.recommendationsGiven
  };

  
  //remove unnecessary parts of strings
  if (queryResults.profile) {
      console.log('queryResults.profile[0]: ', queryResults.profile[0]);
      console.log('queryResults.profile: ', queryResults.profile);
      queryResults.profile = queryResults.profile[0];
      replaceStringInProperty(queryResults.profile, 'connections', ' connections', '');
      console.log('\n!!!!!!!!!!!!!!!!!!!!\n')
      console.log(queryResults.positions)
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



//   for (let field in queryResults) {
//     let data = await queryInSection(page, selectors[field]);
//     delete queryResults[field];
//     if(field === 'recommendationsCount') {
//         queryResults.recommendations = {};
//         queryResults.recommendations.givenCount = data[0].given;
//         queryResults.recommendations.receivedCount = data[0].received;
//     } else if (field === 'recommendationsReceived') queryResults.recommendations.received = data;
//     else if (field === 'recommendationsGiven') queryResults.recommendations.given = data;
//     else if (field === 'profile') queryResults[field] = data[0];
//     else queryResults[field] = data;
//   }


  await page.close()
  return queryResults;

}
