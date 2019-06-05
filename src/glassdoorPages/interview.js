//includes job seekers also viewed

const openNewPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const {glassdoor} = require ('../selectorsList.js');
const selectors = glassdoor.interviews;
const queryInSection = require('../queryInSection.js');



const getInterview = async (browser, url, searchTerm = '', getOtherCompanies) => {

    const page = await openNewPage(browser, url);
    await scrollToBottom(page, selectors.footer);


    let info = {}

    if (getOtherCompanies) {

        let queryResults = {
            alsoViewed : null,
        }
    
        for (let field in queryResults) {
            queryResults[field] = (await queryInSection(page, selectors[field]))[0];
        };

        if (queryResults.alsoViewed) info.alsoViewed = queryResults.alsoViewed.links;

    } 
    if (searchTerm) {
        let jobTitleBox = await page.$(selectors.jobTitleBox);
        if (jobTitleBox) {
            await jobTitleBox.type(searchTerm);
        
            let submitButton = await page.$(selectors.submitButton);
            await submitButton.click();
        
            await scrollToBottom(page, selectors.footer);
        
        
            let queryResults = {
                main : null,
            }
        
            for (let field in queryResults) {
                queryResults[field] = (await queryInSection(page, selectors[field]))[0];
            };
        
            let interviewInfo = {
                experience: null,
                process: null,
                difficulty: null
            }
            for (let key in queryResults.main) {
                if(typeof queryResults.main[key] === 'object' && queryResults.main[key].length) {
                    interviewInfo[key] = {};
                    for (let i in queryResults.main[key]) {
                        let {type, percent} = queryResults.main[key][i]
                        interviewInfo[key][type] = parseFloat(percent);
                    }
                } else {
                    interviewInfo[key] = queryResults.main[key];
                }
            }
        
            info.interviews = interviewInfo

        }
        
    }
    
    await page.close();
    return info;


    

}


module.exports = getInterview;
