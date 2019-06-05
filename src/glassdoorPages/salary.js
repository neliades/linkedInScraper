const openNewPage = require('../puppeteerHelpers/openNewPage')
const scrollToBottom = require('../puppeteerHelpers/scrollToBottom.js')
const {glassdoor} = require ('../selectorsList.js');
const selectors = glassdoor.salaries;
const queryInSection = require('../queryInSection.js');




const getSalary = async (browser, url) => {

    console.log('***********\ngetSalary invoked\n*************')

    let searchTerm = 'Software Engineer';

    const page = await openNewPage(browser, url);
    await scrollToBottom(page, selectors.footer);

    let salaryInfo = {
        exactMatch: null,
        topThree: []
    }

    let jobTitleBox = await page.$(selectors.jobTitleBox);

    if (jobTitleBox) {
        await jobTitleBox.type(searchTerm);
    
        let submitButton = await page.$(selectors.submitButton);
        await submitButton.click();
    
        await page.waitForNavigation();
        await scrollToBottom(page, selectors.footer);
    
    
        let queryResults = {
            main : null,
        }
    
        for (let field in queryResults) {
            queryResults[field] = (await queryInSection(page, selectors[field]))[0];
        };
    
        console.log({queryResults})
        
    
    
        let convertTextToNum = (text, checkIfAnnual) => {
            if (!text) return null;
            let k = text.match(/K/g) ? 1000 : 1;
            if (checkIfAnnual) {
                let yr = text.match(/yr/g);
                if (!yr) return 'non-annual';
            }
            let amount = text.replace(/[^0-9.]/g, '');
            return amount * k;
        }
    
        // console.log({queryresults: queryResults.main.row})
        for (let i in queryResults.main.row) {
            let results = salaryInfo.topThree;
            let row = queryResults.main.row[i];
            let template = {
                    position: row.jobTitle || null,
                    salary: {
                        average: convertTextToNum(row.average, true),
                        low: convertTextToNum(row.range[0]),
                        high: convertTextToNum(row.range[1])
                    }
            }
    
            if (template.position === searchTerm) {
                salaryInfo.exactMatch = template;
            } else if (results.length < 3 && template.salary.average !== 'non-annual') {
                results.push(template);
            }
            if (salaryInfo.exactMatch && results.length === 3) break;
        }
        
    }
    await page.close();
    return salaryInfo;


}


module.exports = getSalary;
