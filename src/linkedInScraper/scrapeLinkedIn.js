const puppeteer = require('puppeteer');
const cluster = require('cluster');
const cpuCount = require('os').cpus().length;

const logIn = require('./linkedInPages/logIn.js')
const userProfile = require('./linkedInPages/userProfile.js')
const companyProfile = require('./linkedInPages/companyProfile.js')
const userSearch = require('./linkedInPages/userSearch.js')


//returns a promise that resolves to a completed profile object
const scrapeLinkedIn = async (email, password, url, numOfCpus, isVisible = false, browser, startPage = 1, permitted = cluster.isMaster) => {
    numOfCpus = numOfCpus || cpuCount;
    // console.log(startPage)
    // if (cluster.isMaster) {
    //     browser = await puppeteer.launch({headless: !isVisible})
    //     await logIn(browser, email, password);
    //     console.log('logged in')
    // }
    if (permitted) return new Promise(async (resolve, reject) => {
        console.log(url)
        if (!email || !password || !url) return reject('Email, password, and a profile url are required.');
        let completedProfiles = { profiles : [] };
        try {



            let isProfileUrl = url.split('www.linkedin.com/in').length > 1;
            let isSearchUrl = url.split('www.linkedin.com/search/results/people').length > 1;
            if (isSearchUrl) {
                if (cluster.isWorker) {
                    // console.log(`\n\nhey I'm a worker\n\n`);
                    urlParts = url.split('&page=');
                    currentPage = parseInt(urlParts[1]) || 0;
                    //if this is one of the first n workers
                    if (currentPage < startPage + numOfCpus) {
                        browser = await puppeteer.launch({headless: !isVisible})
                        await logIn(browser, email, password);
                        console.log('logged in and starting on results page: ', currentPage);
                    }
                    //implement a scrape of the search results that calls user profile on each and returns an array of the objects
                    let userSearchResults = await userSearch(browser, url);
                    let num = userSearchResults.num;
                    completedProfiles.profiles = userSearchResults.results;

                    // console.log('completed')
                    // console.log(completedProfiles);

                    process.send({completedProfiles, num});
                    // process.send(url);
                    //if completedProfiles.profiles came back not empty
                    if (completedProfiles.profiles.length > 0) {
                        console.log(`checking results of page that is ${numOfCpus} ahead of current`)
                        //increment the count by the cpu count and reinvoke scrapeLinkedIn
                        nextPage = currentPage + numOfCpus;
                        url = urlParts[0] + '&page=' + nextPage;
                        // console.log(url)
                        await scrapeLinkedIn(email, password, url, numOfCpus, isVisible, browser, startPage, true);
                    }

                } else {
                    // console.log('\n\nMaster process running\n\n')
                    let workers = [];
                    for (let workerNum = 0; workerNum < numOfCpus; workerNum++)  {
                        // console.log('\n\nspinning up worker number ', workerNum + 1, '\n\n')
                        let worker = cluster.fork();
                        
                        appendClusterMethods(worker);
                        let currentPage = startPage + workerNum; //1 or custom + 0-11 (e.g. 1-12 or more) //1001,1002,1003,... //1,2,3,...12
                        url = url.split('&page=')[0] + '&page=' + currentPage;
                        worker.send({email, password, url, numOfCpus, isVisible, browser: null, startPage});
                        workers.push([worker, workerNum]);
                    }
                    let totalResults;
                    let numOfPagesToBeVisited;
                    await new Promise ( (resolve) => {
                        let count = 0;
                        for (let index in workers) {
                            let worker = workers[index][0];
                            let workerNum = workers[index][1];
                            worker.on('message', (msg) => {
                                let profiles = msg.completedProfiles.profiles;
                                if (msg.num && !numOfPagesToBeVisited) {
                                    totalResults = msg.num;
                                    let numOfPages = Math.ceil(totalResults / 10);
                                    let minimumVisitedPagesPerWorker = Math.floor(numOfPages/numOfCpus) + 1; //+1 represents the last page visited with no results
                                    let numOfWorkersThatVisitAnExtraPage = numOfPages % numOfCpus;
                                    numOfPagesToBeVisited = (numOfCpus * minimumVisitedPagesPerWorker) + numOfWorkersThatVisitAnExtraPage;
                                }
                                count++
                                console.log(`   Handling message for worker ${workerNum}: ${count}/${numOfPagesToBeVisited} pages`)
                                // console.log(`\n\nI'm the master, one of my workers sent me a completed profile\n\n`)
                                Array.prototype.push.apply(completedProfiles.profiles, profiles);
                                console.log(`   Array ${count}/${numOfPagesToBeVisited} added to profiles object`);
                                console.log('\n!!!!!\n', {numOfPagesToBeVisited});
                                console.log({count})
                                if(count === numOfPagesToBeVisited) resolve();
                            });
                        }
                    });
                    //wait for workers to send you results
                    // worker.on('message', (msg) => {
                    //     count++;
                    //     console.log(`Handling message for ${count}/${numOfCpus}`)
                    //     // console.log(`\n\nI'm the master, one of my workers sent me a completed profile\n\n`)
                    //     console.log(msg)
                    //     // Array.prototype.push.apply(completedProfiles.profiles, msg.profiles);
                    //     console.log(`Array ${count}/${numOfCpus} added to profiles object`);
                    //     return;
                    // });
                    // while (count < numOfCpus) {
                        
                    // }
                    // for (let workerNum = 1; workerNum <= numOfCpus; workerNum++)  {
                    //     console.log(`Waiting for ${workerNum}/${numOfCpus}`)
                    //     await worker.onPromise('message', (msg) => {
                    //         console.log(`Handling message for ${workerNum}/${numOfCpus}`)
                    //         // console.log(`\n\nI'm the master, one of my workers sent me a completed profile\n\n`)
                    //         Array.prototype.push.apply(completedProfiles.profiles, msg.profiles);
                    //         console.log(`Array ${workerNum}/${numOfCpus} added to profiles object`);
                    //         return;
                    //     });
                    //     console.log('Successfully waited for worker.onPromise')
                    // }
                }
            } else if (isProfileUrl) {
                browser = await puppeteer.launch({headless: !isVisible})
                await logIn(browser, email, password);
                completedProfiles.profiles.push(await userProfile(browser, url));
            } else {
                throw 'URL is invalid or does not match one of the following formats:\nwww.linkedin.com/in\nwww.linkedin.com/search/results/people';
            }
        } catch (error) {
            if (browser) await browser.close()
            return reject(error)
        }
        if (browser) await browser.close();
        return resolve(completedProfiles);


        
    })
}



const awaitEvent = async (classObj, isSender, event, cb) => {
    let action = isSender ? 'send' : 'on';
    return await new Promise((resolve) => {
        classObj[action](event, async (msg) => {
            resolve(cb(msg));
        });
    });
}


const appendClusterMethods = (classObj) => {
    classObj.onPromise = async function (event, cb) {
        return await awaitEvent(this, false, event, cb);
    }
}





if (cluster.isWorker) {
    appendClusterMethods(process);
    // console.log('\n\n', process.send)

    // (async () => {
    //     let test = await process.onPromise('message', (msg) => {
    //         return '973-519-5226'
    //     })
    //     console.log('!!!!!\n', test, '\n!!!!!!!!')

    // //     let test = await new Promise((resolve) => {
    // //         process.on('message', async (msg) => {
    // //             resolve(5);
    // //         });
    // //     });
    // //     console.log('!!!!!\n', test, '\n!!!!!!!!')
    // })()


    process.on('message', async (msg) => {
        // console.log(`\nI'm the worker, my master sent me arguments\n`)
        scrapeLinkedIn(msg.email, msg.password, msg.url, msg.numOfCpus, msg.isVisible, msg.browser, msg.startPage, true);
    });
}

module.exports = scrapeLinkedIn;
