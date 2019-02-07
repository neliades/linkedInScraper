
const puppeteer = require('puppeteer');
const {login} = require(`../../config.js`);
const {addUserToDb} = require(`../../db/addUser.js`);
const {handleProfiles, lookupProfile, addProfileToCSV} = require('./buildUserProfile.js');

// const testURL = 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH';

let pageNumber = 1;

let lookupSearchResults = (data, searchURL) => {
    let storage = {};
    let searchResults = [];
    for (let i = 0; i < data.length; i++) {
      let url = data[i].url
      if ( url !== undefined) {
        if (storage[url] === undefined) {
            searchResults.push(url);
        }
        storage[url] = url
      }
    }
    handleProfiles(searchResults, (data) => {
        addUserToDb(data);
        let URL = searchURL + '&page=' + pageNumber;
        scrapeAllPages(URL);
    })
}




async function scrapeAllPages(searchURL) {
  const browser = await puppeteer.launch({
      //headless : false
  });
  const page = await browser.newPage();
  
  await page.goto('https://www.linkedin.com/');

  await page.click(login.emailSelector);
  await page.keyboard.type(login.email);
  
  await page.click(login.passwordSelector);
  await page.keyboard.type(login.password);
  
  await page.click(login.submitSelector);
  
  await page.waitForNavigation();
  await page.goto(searchURL);



function searchForSelectors () {
    return new Promise(async (resolve, reject) => {
        try {
            await page.evaluate(_ => {
                window.scrollBy(0, 772);
                });
            await page.waitFor(5*1000);
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll('a.search-result__result-link');

                items.forEach((item) => {
                    results.push({
                        url:  item.getAttribute('href'),
                        text: item.innerText,
                    });
                });
                return results;
            })

            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}

let results = await searchForSelectors();
  if (results.length > 0) {
    lookupSearchResults(results, searchURL)
  } else {
      console.log('end of search results')
  }

}


// scrapeAllPages(testURL);

module.exports.scrapeAllPages = scrapeAllPages;