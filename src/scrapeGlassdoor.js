//takes a list of companies from the db (name and url) or a single company (linkedInUrl or glassDoorUrl or name and url) and runs the search for company on every page
const puppeteer = require('puppeteer');

const logIn = require('./glassdoorPages/logIn.js');
const companyProfile =  require('./glassdoorPages/overview.js');
const searchForCompany =  require('./glassdoorPages/companySearch.js');
const {findCompanyInDB} = require('./db/queryHelpers/queryForUserCompanies.js');
const {insertQueryIfNotExists, deleteQuery, insertQuery, updateOneFieldDB} = require('./db/helpers.js')
const addCompanyToDB = require('./db/glassDoorHelpers/addCompany.js');

const scrapeGlassdoor = async (email, password, searchInfo, isVisible = false, glassDoorUrl) => {

    //login
    if (!email || !password || !(searchInfo || glassDoorUrl)) return reject('Email, password, and a glassdoor url or list of search items are required.');
    let completedCompanyProfiles = { companies : [] };

    if (searchInfo) {
        console.log('multiple company pages')
        browser = await puppeteer.launch({headless: !isVisible});
        await logIn(browser, email, password);
        for (let i = 0; i < searchInfo.length; i++) {
            
            let {id, name, companyUrl} = searchInfo[i];
            console.log('\nnew entry\n', ' ***', name)
                if (name) {
                //check if exists in db
                let exists = true;
                console.log('checking if exists...', ' ***', name)
                await new Promise ((resolve) => {
                    findCompanyInDB(name, (data) => {
                        exists = data.length > 0;
                        console.log('query complete', ' ***', name)
                        console.log({exists}, ' ***', name);
                        resolve();
                    });
                })
                if (!exists) {
                    console.log('about to search since it does not exist...', ' ***', name)
                    let searchedGlassDoorUrl = await searchForCompany(browser, name, companyUrl);
                    let companyInfo
                    if (searchedGlassDoorUrl) companyInfo = await companyProfile(browser, searchedGlassDoorUrl, name);
                    if (companyInfo){
                        
                        completedCompanyProfiles.companies.push(companyInfo);

                        await new Promise ((resolve) => {
                            addCompanyToDB(companyInfo, (results) => {
                                console.log('inserted', ' ***', name)
                                let insertId = results.companies.id;
                                // console.log('\ndata inserted from query insertQuery: ', results, '\n');
                                //append the insertID to the companiesFROMusers entry
                                updateOneFieldDB('companiesFROMusers', 'id', id, 'id_companies', insertId, () => {
                                    console.log('companiesFROMusers updated with id_companies', ' ***', name)
                                    resolve();
                                });
                            });
                        })
                    }
                    //add to db if not exists (after companyProfile was invoked or not)
                    // findCompanyInDB(name, (data) => {
                    //     if (data.length === 0) {
                    //         //add name and url to db
                            
                    //     }
                    // });
                    console.log('inserting...', ' ***', name);
                    // await new Promise ((resolve) => {
                    //     insertQueryIfNotExists('companies', 'name, website', [name, companyUrl], () => {
                    //         resolve();
                    //     });
                    // })
                    exists = true;
                    await new Promise ((resolve) => {
                        findCompanyInDB(name, (data) => {
                            console.log('checking for existing entries:', {data}, ' ***', name)
                            exists = data.length > 0;
                            console.log({exists}, ' ***', name)
                            // console.log('\ndata found from query findCompanyInDB: ', data, '\n');
                            if (!exists) {
                                console.log('does not exist! performing insert', ' ***', name)
                                insertQuery('companies', 'name, website', [name, companyUrl], (results) => {
                                    console.log('inserted', ' ***', name)
                                    let {insertId} = results;
                                    // console.log('\ndata inserted from query insertQuery: ', results, '\n');
                                    //append the insertID to the companiesFROMusers entry
                                    updateOneFieldDB('companiesFROMusers', 'id', id, 'id_companies', insertId, () => {
                                        console.log('companiesFROMusers updated with id_companies', ' ***', name)
                                        resolve();
                                    });
                                })
                            } else {
                                resolve();
                            }
                        });
                    })

                }
                //instead of deleting, add new id to old company 
            //remove from companiesFROMusers list
            //    console.log('deleting...')
            //    await new Promise ((resolve) => {
            //         deleteQuery('companiesFROMusers', 'name, companyUrl', [name, companyUrl], (data) => {
            //             // console.log('\ndata deleted from query deleteQuery: ', data, '\n');
            //             resolve();
            //         });
    
            //     })
            } else {
                console.log('no name provided')
                //remove from companiesFROMusers list
                console.log('deleting...')
                await new Promise ((resolve) => {
                    deleteQuery('companiesFROMusers', 'name, companyUrl', [name, companyUrl], (data) => {
                        // console.log('\ndata deleted from query deleteQuery: ', data, '\n');
                        resolve();
                    });
    
                })
            }
        }
              
    } else if (glassDoorUrl.includes('glassdoor.com/Overview')) {
        console.log('single company page')
        browser = await puppeteer.launch({headless: !isVisible});
        await logIn(browser, email, password);
        completedCompanyProfiles.companies.push(await companyProfile(browser, glassDoorUrl));
    } else {
        throw 'URL is invalid or does not match one of the following formats:\nwww.glassdoor.com/Overview\nwww.glassdoor.com/Reviews';
    }
    return completedCompanyProfiles;
}


module.exports = scrapeGlassdoor;