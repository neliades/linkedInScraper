
const puppeteer = require('puppeteer');
const {login} = require(`../../config.js`);
const {lookupProfile, addProfileToCSV} = require('./main.js');
const searchURL = 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH';
// const searchURL = `https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH&page=175`
let i = 1;

let sampleData = [ { url: '/in/indi/', text: '' },
  { url: '/in/indi/',
    text: 'Inderjeet Kaur\n1st degree connection\n1st \n' },
  { url: '/in/eichhold/', text: '' },
  { url: '/in/eichhold/',
    text: 'Bill Eichhold\n1st degree connection\n1st' },
  { url: '/in/dhpatel15/', text: '' },
  { url: '/in/dhpatel15/',
    text: 'Dev Patel\n1st degree connection\n1st' },
  { url: '/in/mjones61692/', text: '' },
  { url: '/in/mjones61692/',
    text: 'Matthew Jones\n1st degree connection\n1st \n' },
  { url: '/in/kai-chen-168035175/', text: '' },
  { url: '/in/kai-chen-168035175/',
    text: 'Kai Chen\n1st degree connection\n1st \n' } ]

let lookupSearchResults = (data) => {
    // console.log('lookupSearchResults evoked')
    let storage = {};
    let searchResults = [];
    //iterate over array
    for (let i = 0; i < data.length; i++) {
      let url = data[i].url
      if ( url !== undefined) {
        if (storage[url] === undefined) {
            searchResults.push(url);
        }
        storage[url] = url
      }
    }
    // console.log('search results ', searchResults)
    lookupProfile(searchResults, (URL, data, last) => {
            addProfileToCSV(URL, data, () => {
                if (last) {
                    i++
                    // console.log('starting next group');
                    let URL = searchURL + '&page=' + i;
                    // console.log(URL)
                    run(URL);
                }
            })
    })
}




async function run(searchURL) {
    // console.log('run evoked')
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
  //await page.goto('https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH');
  
//   let urls = await page.evaluate(() => {
//     let results = [];
//     let items = document.querySelectorAll('[id^="ember"]');
//     items.forEach((item) => {
//         results.push({
//             url:  item.getAttribute('href'),
//             text: item.innerText,
//         });
//     });
//     console.log(results);
//     return results;
// })
//   await page.waitForNavigation();



function run2 () {
    // console.log('run2 evoked')
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

let results = await run2();
  if (results.length > 0) {
    lookupSearchResults(results)
  } else {
      console.log('end of search results')
  }

// .then(run2(data)).then(console.log)
  //browser.close();
}
//#ember62


run(searchURL);
// run(searchURL).then( (results) => {
// //   console.log(results)
//   if (results.length > 0) {
//     lookupSearchResults(results)

//   }
// });


//https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH&page=2
//https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH
//https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=FACETED_SEARCH
//https://www.linkedin.com/search/results/people/?facetSchool=%5B%22163104%22%5D&origin=GLOBAL_SEARCH_HEADER
//https://www.linkedin.com/search/results/people/?facetSchool=%5B%22163104%22%5D&origin=GLOBAL_SEARCH_HEADER&page=2
//https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&&origin=GLOBAL_SEARCH_HEADER
//https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=GLOBAL_SEARCH_HEADER
//https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&facetSchool=%5B%22163104%22%5D&origin=GLOBAL_SEARCH_HEADER&page=1