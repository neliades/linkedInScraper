const {collectAllUsersFromSearch} = require('./linkedIn/userSearch.js');

// const testURL = 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH';
const testURL = 'https://www.linkedin.com/search/results/people/?facetCurrentCompany=%5B%223032535%22%5D&facetGeoRegion=%5B%22us%3A70%22%5D&facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH'

const addToDb = async function (searchURL) {
  await collectAllUsersFromSearch(searchURL)
  //INSERT AWAITED FUNC THAT SEARCHES TABLE COMPANIESFROMUSERS, SEARCHES COMPANIES AND ADDS IDS TO TABLE
  await console.log('\n\n\n\ndone\n\n\n\n');
}

addToDb(testURL);