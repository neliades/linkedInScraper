const puppeteer = require('puppeteer');
const cluster = require('cluster');
const cpuCount = require('os').cpus().length;

const logIn = require('./linkedInPages/logIn.js')
const userProfile = require('./linkedInPages/userProfile.js')
const companyProfile = require('./linkedInPages/companyProfile.js')
const userSearch = require('./linkedInPages/userSearch.js')
const config = require('./config.js');
const {connection} = require('./db/connectToDb.js');

let {addUserToDb} = require('./db/addUser.js')

// const mysql = require('./db/connectToDb.js');

let progress = require('./progressTracking/progressBars.js');

//returns a promise that resolves to a completed profile object
const scrapeLinkedIn = async (email, password, url, numOfCpus, isVisible = false, browser, startPage = 1, permitted = cluster.isMaster) => {
    if (cluster.isWorker) require('./db/connectToDb.js');
    numOfCpus = numOfCpus || cpuCount;
    if (email) config.email = email;
    if (password) config.password = password;

        if (permitted) return new Promise(async (resolve, reject) => {
            let totalResults;
            let numOfPagesToBeVisited;
            
        if (!email || !password || !url) return reject('Email, password, and a profile url are required.');
        let completedProfiles = { profiles : [] };
        try {

            let isProfileUrl = url.split('www.linkedin.com/in').length > 1;
            let isSearchUrl = url.split('www.linkedin.com/search/results/people').length > 1;
            if (isSearchUrl) {
                if (cluster.isWorker) {
                    // console.log(`\n\nI'm a worker\n\n`);
                    
                    urlParts = url.split('&page=');
                    currentPage = parseInt(urlParts[1]) || 0;

                    if (currentPage < startPage + numOfCpus) {
                        browser = await puppeteer.launch({headless: !isVisible})
                        await logIn(browser, email, password);
                        progress.log('logged in and starting on results page: ', currentPage);
                    }
                    //implement a scrape of the search results that calls user profile on each and returns an array of the objects
                    let userSearchResults = await userSearch(browser, url);
                    let num = userSearchResults.num;
                    completedProfiles.profiles = userSearchResults.results;

                    process.send({completedProfiles, num});

                    if (completedProfiles.profiles.length > 0) {
                        //increment the count by the cpu count and reinvoke scrapeLinkedIn
                        nextPage = currentPage + numOfCpus;
                        url = urlParts[0] + '&page=' + nextPage;
                        await scrapeLinkedIn(email, password, url, numOfCpus, isVisible, browser, startPage, true);
                    }

                } else {
                    // console.log('\n\nMaster process running\n\n')

                    progress.buildProgressBar();

                    let workers = [];
                    for (let workerNum = 0; workerNum < numOfCpus; workerNum++)  {
                        let worker = cluster.fork();
                        let currentPage = startPage + workerNum; //1 or custom + 0-11 (e.g. 1-12 or more) //1001,1002,1003,... //1,2,3,...12
                        url = url.split('&page=')[0] + '&page=' + currentPage;
                        worker.send({email, password, url, numOfCpus, isVisible, browser: null, startPage});
                        workers.push([worker, workerNum]);
                    }
                    await new Promise ( (resolve) => {
                        let count = 0;
                        for (let index in workers) {
                            let worker = workers[index][0];
                            let workerNum = workers[index][1];
                            worker.on('message', (msg) => {
                                if (msg.tick && msg.num) {
                                    if (progress.bar.total === Infinity) {
                                        progress.updateTotal(msg.num);
                                    }
                                    progress.tick();
                                } else if (msg.log && msg.msg) {
                                    progress.log(msg.msg)
                                // } else if (msg.profile) {
                                //     addUserToDb(msg.profile);
                                } else {
                                    let profiles = msg.completedProfiles.profiles;
                                    if (msg.num && !numOfPagesToBeVisited) {
                                        totalResults = msg.num;
                                        let numOfPages = Math.ceil(totalResults / 10);
                                        let minimumVisitedPagesPerWorker = Math.floor(numOfPages/numOfCpus) + 1; //+1 represents the last page visited with no results
                                        let numOfWorkersThatVisitAnExtraPage = numOfPages % numOfCpus;
                                        numOfPagesToBeVisited = (numOfCpus * minimumVisitedPagesPerWorker) + numOfWorkersThatVisitAnExtraPage;
                                    }
                                    count++
    
                                    progress.log(`Message from worker on cpu core ${workerNum}: ${count}/${numOfPagesToBeVisited} pages visited`)
                                    
                                    Array.prototype.push.apply(completedProfiles.profiles, profiles);
                                    if(count === numOfPagesToBeVisited) resolve();
                                }
                            });
                        }
                    });
                }
            } else if (isProfileUrl) {
                browser = await puppeteer.launch({headless: !isVisible})
                await logIn(browser, email, password);
                completedProfiles.profiles.push(await userProfile(browser, url));
            } else {
                throw 'URL is invalid or does not match one of the following formats:\nwww.linkedin.com/in\nwww.linkedin.com/search/results/people';
            }
        } catch (error) {
            if (browser) await browser.close();
            // console.log('error in scrapeLinkedIn', error)
            return reject(error)
        }
        if (browser) await browser.close();
        if(cluster.isWorker) process.exit();
        return resolve(completedProfiles);


        
    })
}


if (cluster.isWorker) {
    process.on('message', async (msg) => {
        // console.log(`\nI'm a worker, the master sent me arguments\n`)
        scrapeLinkedIn(msg.email, msg.password, msg.url, msg.numOfCpus, msg.isVisible, msg.browser, msg.startPage, true);
    });
}

module.exports = scrapeLinkedIn;
