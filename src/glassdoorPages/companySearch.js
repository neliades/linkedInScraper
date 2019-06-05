//collect an array of objects containing the links to company profile and the company urls in the format {url: companyLink}
//iterate through
    //add each key value to a storage object containing urls,
    //deconstruct the key to just get the domain (left of last .), add key value to storage object containing domains
//visit the first page that meets one of the following criteria:
    //if the desired url exists in the url object (constant lookup)
    //if the desired domain (left of last .) exists in the domain object (constant lookup)
//repeat process for desired number of pages
//if no match is found, don't visit an unconfirmed company



const openNewPage = require('../puppeteerHelpers/openNewPage')
const {glassdoor} = require ('../selectorsList.js');
const selectors = glassdoor.search;

const findCompany = require ('./searchResults.js');


const searchForCompany = async (browser, companyName, companyUrl) => {
    if (!companyName) return;
    try {
        let url = 'https://www.glassdoor.com/Reviews';
        const page = await openNewPage(browser, url);

        await page.waitForSelector(selectors.searchBox);
        let emailBox = await page.$(selectors.searchBox);
        await emailBox.type(companyName);

        let submit = await page.$(selectors.submitButton);
        // await submit.click();

        // await page.waitForNavigation({ timeout: 1000 * 0.5});

        // await Promise.all([
        //     submit.click(),
        //     () => {
        //         try {
        //             page.waitForNavigation({ timeout: 1000 * 0.5});
        //         } catch (error) {
        //             console.log('waited too long for page to update')
        //         }
        //     }
        // ]);
        await submit.click().then(() => page.waitForNavigation({waitUntil: 'load'}));


        let glassdoorUrl;
        let currentUrl = await page.url();
        console.log(currentUrl)
        //if the page navigated to a company overview page, set glassdoorUrl = the current url
        if (currentUrl.includes('glassdoor.com/Overview')) {
            console.log('currentUrl is a webpage!!!!')
            glassdoorUrl = currentUrl;
        } else {
            glassdoorUrl = await findCompany(browser, page, companyName, companyUrl);
        }

        await page.close();
        console.log({companyName, glassdoorUrl})
        return glassdoorUrl;
    } catch (error) {
        console.log({error})
        await page.close();
    }

}


module.exports = searchForCompany;
