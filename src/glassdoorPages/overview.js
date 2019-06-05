const openNewPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const {glassdoor} = require ('../selectorsList.js');
const selectors = glassdoor.overview;
const queryInSection = require('../queryInSection.js');

const getSalary = require('./salary.js');
const getInterview = require('./interview.js');

const addCompanyToDB = require('../db/glassDoorHelpers/addCompany.js');


const companyProfile = async (browser, url, linkedInCompanyName) => {

    let searchTerm = 'Software Engineer';

    const page = await openNewPage(browser, url);
    await scrollToBottom(page, selectors.footer);

    let queryResults = {
        header : null,
        main : null,
        locations : null,
        jobs : null,
        reviews : null
    }



    for (let field in queryResults) {
        queryResults[field] = (await queryInSection(page, selectors[field]))[0];
    };
    
    //handle the data by adding it to company info
    let header = queryResults.header;
    let main = queryResults.main;
    let stats = main.stats;
    let locations = [];
    if (queryResults.locations && queryResults.locations.locations) locations = queryResults.locations.locations;
    let jobs = [];
    if (queryResults.jobs && queryResults.jobs.jobs) jobs = queryResults.jobs.jobs;
    let companyInfo = {
        overview : {
            name : linkedInCompanyName || header.name,
            website : main.website,
            size : '',
            industry : '',
            headquarters: '',
            founded: '',
            type: '',
            revenue: '',
            description: main.description ? main.description.join('\n') : '',
            locations: [],
            jobs: [],
            inNYC: false
        },
        reviews : {
            rating : '',
            recommended : '',
            CEOApproval : ''
        }
    }
    for (let i in stats) {
        stats[i] = stats[i].split('\t');
        let storage = companyInfo.overview;
        let field = stats[i][0].toLowerCase();
        let value = stats[i][1];
        storage[field] = value; 
    }

    for (let i in locations) {
        let location = locations[i]
        let searchPhrases = ['NYC', 'New York City', 'New York, NY', 'New York, New York']
        searchPhrases = searchPhrases.join('|');
        if (location.match(searchPhrases)) companyInfo.overview.inNYC = true;
        companyInfo.overview.locations.push(location);
    }

    for (let i in jobs) {
        let job = jobs[i].match(/\S*\S/g).join(' ');
        let searchPhrases = ['NYC', 'New York City', 'New York, NY', 'New York, New York']
        searchPhrases = searchPhrases.join('|');

        if (job.match(searchPhrases)) companyInfo.overview.inNYC = true;
        companyInfo.overview.jobs.push(job);
    }

    
    let replaceStringInProperty = (object, property, searchValue, replaceValue ) => {
        if(object[property]) {object[property] = object[property].replace(searchValue, replaceValue);
        }
    }
    replaceStringInProperty(companyInfo.overview, 'description', /(<b*r*>)/gi, '');
    
    companyInfo.reviews.rating = parseFloat(queryResults.reviews.rating);
    companyInfo.reviews.recommended = parseFloat(queryResults.reviews.recommended);
    companyInfo.reviews.CEOApproval = parseFloat(queryResults.reviews.CEOApproval);

    if (Number.isNaN(companyInfo.reviews.rating)) companyInfo.reviews.rating = null;
    if (Number.isNaN(companyInfo.reviews.recommended)) companyInfo.reviews.recommended = null;
    if (Number.isNaN(companyInfo.reviews.CEOApproval)) companyInfo.reviews.CEOApproval = null;

    companyInfo.positions = await getSalary(browser, header.salariesLink, header.interviewsLink);

    //scrape the general stats
    let generalStats = (await getInterview(browser, header.interviewsLink)).interviews;
    let stringifiedGeneral = JSON.stringify(generalStats);

    for (let i = 0; i < companyInfo.positions.topThree.length + 1; i++) {
        let current = companyInfo.positions.topThree[i];
        if (i === companyInfo.positions.topThree.length) {
            current = companyInfo.positions.exactMatch;
            if (!current) current = {position: searchTerm};
        }
        //scrape the stats for each position
        let stats = (await getInterview(browser, header.interviewsLink, current.position)).interviews;
        //if the stats dont equal the general, add them
        if (JSON.stringify(stats) !== stringifiedGeneral) {
            current.interview = stats;
        }
        
    }

    //convert size to a num
    companyInfo.overview.size = parseInt(companyInfo.overview.size);
    if(Number.isNaN(companyInfo.overview.size)) companyInfo.overview.size = null;

    // console.log(JSON.stringify(companyInfo.positions));
    // console.log(companyInfo)

    companyInfo.alsoViewed = (await getInterview(browser, header.interviewsLink, null, true)).alsoViewed;


    //addToDB
    // await new Promise ((resolve) => {
    //     addCompanyToDB(companyInfo, () => {
    //         console.log('added completed entry into database')
    //         resolve();
    //    });
    // })

    await page.close();
    return (companyInfo);


}


module.exports = companyProfile;
