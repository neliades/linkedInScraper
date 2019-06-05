const openNewPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const {glassdoor} = require ('../selectorsList.js');
const selectors = glassdoor.searchResults;
const queryInSection = require('../queryInSection.js');

const getSalary = require('./salary.js');
const getInterview = require('./interview.js');

const addCompanyToDB = require('../db/glassDoorHelpers/addCompany.js');


const findCompany = async (browser, page, searchName, searchUrl, maxPages = 5) => {

    if (!searchUrl && !searchName) return;

    if (searchUrl) searchUrl = searchUrl.split('//').join('');

    while (maxPages > 0) {
        await scrollToBottom(page, selectors.footer);

        let queryResults = {
            main: null
        }
        for (let field in queryResults) {
            queryResults[field] = (await queryInSection(page, selectors[field]))[0];
        };

        let results = queryResults.main.result;

        if (!results) return;

        for (let i = 0; i < results.length; i++) {
            let {companyUrl, glassdoorUrl, glassdoorName} = results[i];

            if (searchUrl) {
                if (companyUrl === searchUrl) return glassdoorUrl;
    
                if (companyUrl) {
                    companyUrl = companyUrl.split('.');
                    companyUrl.pop();
                    if (companyUrl[0] && companyUrl[0].includes('ww')) companyUrl.shift();
                    companyUrl = companyUrl.join('');
                }
    
                searchUrl = searchUrl.split('.');
                searchUrl.pop();
                if (searchUrl[0] && searchUrl[0].includes('ww')) searchUrl.shift();
                searchUrl = searchUrl.join('');
    
                if (companyUrl === searchUrl) return glassdoorUrl;
            } else {
                if (glassdoorName === searchName) return glassdoorUrl;
            }

        }

        let nextButton = await page.$(selectors.nextButton);
        if (nextButton) await nextButton.click();
        else return;
        maxPages--;
    }

    return
    
    // //handle the data by adding it to company info
    // let header = queryResults.header;
    // let main = queryResults.main;
    // let stats = main.stats;
    // let {locations} = queryResults.locations;
    // let {jobs} = queryResults.jobs;
    // let companyInfo = {
    //     overview : {
    //         name : header.name,
    //         website : main.website,
    //         size : '',
    //         industry : '',
    //         headquarters: '',
    //         founded: '',
    //         type: '',
    //         revenue: '',
    //         description : main.description.join('\n'),
    //         locations: [],
    //         jobs: [],
    //         inNYC: false
    //     },
    //     reviews : {
    //         rating : '',
    //         recommended : '',
    //         CEOApproval : ''
    //     }
    // }
    // for (let i in stats) {
    //     stats[i] = stats[i].split('\t');
    //     let storage = companyInfo.overview;
    //     let field = stats[i][0].toLowerCase();
    //     let value = stats[i][1];
    //     storage[field] = value; 
    // }

    // for (let i in locations) {
    //     let location = locations[i]
    //     let searchPhrases = ['NYC', 'New York City', 'New York, NY', 'New York, New York']
    //     searchPhrases = searchPhrases.join('|');
    //     if (location.match(searchPhrases)) companyInfo.overview.inNYC = true;
    //     companyInfo.overview.locations.push(location);
    // }

    // for (let i in jobs) {
    //     let job = jobs[i].match(/\S*\S/g).join(' ');
    //     let searchPhrases = ['NYC', 'New York City', 'New York, NY', 'New York, New York']
    //     searchPhrases = searchPhrases.join('|');

    //     if (job.match(searchPhrases)) companyInfo.overview.inNYC = true;
    //     companyInfo.overview.jobs.push(job);
    // }

    
    // let replaceStringInProperty = (object, property, searchValue, replaceValue ) => {
    //     if(object[property]) {object[property] = object[property].replace(searchValue, replaceValue);
    //     }
    // }
    // replaceStringInProperty(companyInfo.overview, 'description', /(<b*r*>)/gi, '');
    
    // companyInfo.reviews.rating = parseFloat(queryResults.reviews.rating);
    // companyInfo.reviews.recommended = parseFloat(queryResults.reviews.recommended);
    // companyInfo.reviews.CEOApproval = parseFloat(queryResults.reviews.CEOApproval);


    // companyInfo.positions = await getSalary(browser, header.salariesLink, header.interviewsLink);

    // //scrape the general stats
    // let generalStats = (await getInterview(browser, header.interviewsLink)).interviews;
    // let stringifiedGeneral = JSON.stringify(generalStats);

    // for (let i = 0; i < companyInfo.positions.topThree.length + 1; i++) {
    //     let current = companyInfo.positions.topThree[i];
    //     if (i === companyInfo.positions.topThree.length) {
    //         current = companyInfo.positions.exactMatch;
    //         if (!current) current = {position: searchTerm};
    //     }
    //     //scrape the stats for each position
    //     let stats = (await getInterview(browser, header.interviewsLink, current.position)).interviews;
    //     //if the stats dont equal the general, add them
    //     if (JSON.stringify(stats) !== stringifiedGeneral) {
    //         current.interview = stats;
    //     }
        
    // }

    // //convert size to a num
    // companyInfo.overview.size = parseInt(companyInfo.overview.size);
    

    // // console.log(JSON.stringify(companyInfo.positions));
    // // console.log(companyInfo)

    // companyInfo.alsoViewed = (await getInterview(browser, header.interviewsLink, null, true)).alsoViewed;


    // //addToDB
    // addCompanyToDB(companyInfo);


    // return (companyInfo);


}


module.exports = findCompany;
