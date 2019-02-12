
const puppeteer = require('puppeteer');
const {login} = require(`../../config.js`);
const {addUserToDb} = require(`../../db/addUser.js`);
const {handleProfiles, lookupProfile, addProfileToCSV} = require('./buildUserProfile.js');

const testURL = 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH';


async function collectAllUsersFromSearch (searchURL) {
    return new Promise (async function (resolve) {
        console.log('collectAllUsersFromSearch invoked')
        let pageNumber = 1;
        
        let lookupSearchResults = async function (data, searchURL) {
            console.log('lookupSearchResults invoked')
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
            await handleProfiles(searchResults)
            await function () {
                console.log('callback on handleProfiles invoked')
                pageNumber++;
                let URL = searchURL + '&page=' + pageNumber;
                console.log('page: ', pageNumber)
                scrapeAllPages(URL);
            }();
            // handleProfiles(searchResults, () => {
            //     console.log('callback on handleProfiles invoked')
            //     pageNumber++;
            //     let URL = searchURL + '&page=' + pageNumber;
            //     console.log('page: ', pageNumber)
            //     scrapeAllPages(URL);
            // })
        }
        
        
        
        
        async function scrapeAllPages(searchURL) {
            console.log('scrapeAllPages invoked')
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
            console.log('searchForSelectors invoked')
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
        console.log('\n\ncompleted page one, terminating early')
        console.log('\nresults: ', results);
        resolve();

        //   if (results.length > 0) {
        //     console.log('\nsearch yielded results\n')
        //     lookupSearchResults(results, searchURL)
        //   } else {
        //       console.log('end of search results');
        //       resolve();
        //   }
        
        }
        
        
        scrapeAllPages(searchURL);
        //return promise / resolve

    })
}

collectAllUsersFromSearch(testURL);


module.exports.collectAllUsersFromSearch = collectAllUsersFromSearch;