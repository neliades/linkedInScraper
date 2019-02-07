// console.log('\n\n\n\n\n***new test***\n\n\n\n\n')

const testData = require('./testData.js');

const {checkIfExists} = require('./helpers.js');
const {insertQuery} = require('./helpers.js')
const {checkIfExistsInJunction} = require('./helpers.js')
const {insertQueryIfNotExists} = require('./helpers.js')
const {updateOneFieldDB} = require('./helpers.js')
const {findLastId} = require('./helpers.js')

const connection = require('./connectToDb.js');



const insertToDB = async function (companyInfo, results, specialQuery, cb) {
    // console.log('insertToDB invoked')
    let queryInfo = {};
    if (companyInfo) {
        queryInfo = {
            companies : {
                fields : 'name, website, size, description, rating, recommended, ceoApproval, locatedInNyc, positive, neutral, negative, difficulty',
                values : [companyInfo.overview.name, companyInfo.overview.website, companyInfo.overview.size, companyInfo.overview.description, companyInfo.reviews.rating, companyInfo.reviews.recommended, companyInfo.reviews.CEOApproval, companyInfo.locatedInNYC, companyInfo.interview.experience.positive, companyInfo.interview.experience.neutral, companyInfo.interview.experience.negative, companyInfo.interview.difficulty],
                id : null
            },
            industries : {
                fields : 'name',
                values : [companyInfo.overview.industry],
                targetTable : 'companies',
                foreignFields : 'id_industries',
                foreignIdList: ['self'],
                id : null
            },
            awards : {
                fields : 'name',
                values : [companyInfo.overview.awards],
                targetTable : 'companies_awards',
                foreignFields : 'id_companies, id_awards',
                foreignIdList: ['companies', 'self'],
                id : null
            },
        }
    }
    //loop through all processes
    let processArr = companyInfo.interview.process;
    for (let i = 0; i < processArr.length; i++) {
        let process = processArr[i];
        for (let processName in process) {
            let percent = process[processName];
            queryInfo[`processes_${i}`] = {
                fields : 'name',
                values : [processName], //[{"AppliedOnline":"35"},{"Recruiter":"29"}...
                targetTable : 'companies_processes',
                foreignFields : 'id_companies, id_processes, percent',
                foreignIdList: ['companies', 'self', {'value': percent}],
                id : null
            }
        }
    }
    let positionsArr = companyInfo.salary;
    for (let i = 0; i < positionsArr.length; i++) {
        let position = positionsArr[i];
        let name = position.position;
        let stringToNum = (str) => {
            return parseInt(str.split('$').join('').split(',').join('').split('K').join('000'));
        }
        let low = stringToNum(position.low);
        let high = stringToNum(position.high);
        let average = stringToNum(position.average);
        queryInfo[`companyPositions_${i}`] = {
            fields : 'name',
            values : [name],
            targetTable : 'companies_companyPositions',
            foreignFields : 'id_companies, id_companyPositions, low, high, average',
            foreignIdList: ['companies', 'self', {'value': low}, {'value': high}, {'value': average}],
            id : null
        }
    }
    let competitorsArr = companyInfo.overview.competitors;
    for (let i = 0; i < competitorsArr.length; i++) {
        let competitorName = competitorsArr[i];
        queryInfo[`competitors_${i}`] = {
            fields : 'name',
            values : [competitorName],
            targetTable : 'companies_competitors',
            foreignFields : 'id_companies, id_competitors',
            foreignIdList: ['companies', 'self'],
            id : null
        }
    }
    let alsoViewedArr = companyInfo.alsoViewed;
    for (let i = 0; i < alsoViewedArr.length; i++) {
        let companyName = alsoViewedArr[i];
        queryInfo[`alsoViewed_${i}`] = {
            fields : 'name',
            values : [companyName],
            targetTable : 'companies_alsoViewed',
            foreignFields : 'id_companies, id_alsoViewed',
            foreignIdList: ['companies', 'self'],
            id : null
        }
    }

    if (specialQuery) {
        queryInfo = specialQuery;
    }
    let insertForeignAndWait = (propertyName) => {
            // console.log('starting foreign and junctions: ', propertyName);
            return new Promise (resolve => {
                let values = [];
                let foreignIdList = queryInfo[propertyName].foreignIdList;
                // console.log('foreignIdList for , ', propertyName, ': ', foreignIdList)
                if (foreignIdList !== undefined) {
                    // console.log('foreignIdList found at table: ', propertyName)
                    for (let i =0; i < foreignIdList.length; i++) {
                        if (foreignIdList[i] === 'self') {
                            values.push(queryInfo[propertyName].id);
                        } else if (typeof foreignIdList[i] === "object") {
                            values.push(foreignIdList[i].value);
                        } else {
                            values.push(queryInfo[foreignIdList[i]].id);
                        }
                    }
                    // console.log('idList for ', queryInfo[propertyName].targetTable, ': ', values);
                    let targetTable = queryInfo[propertyName].targetTable;
                    if (targetTable === 'companies') {
                        //const updateOneFieldDB = (propertyName, fieldLookup, valueLookup, field, value, cb) => {
                        updateOneFieldDB(targetTable, 'id', queryInfo[targetTable].id, queryInfo[propertyName].foreignFields, values[0], () => {
                            // console.log('inserted id_industries into companies');
                            resolve();
                        })
                    } else {
                        //find if exists
                        insertQueryIfNotExists(targetTable, queryInfo[propertyName].foreignFields, values, () => {
                            //if exists or if just added, save the id to the object
                            // console.log('successful entry for ', queryInfo[propertyName].targetTable, ': ', values);
                            resolve();
                        });
                    }
                } else {
                    resolve();
                }
            });
    }
    let insertAndWait = (propertyName) => {
        // console.log('starting initial inserts: ', propertyName);
        return new Promise (resolve => {
            //find if exists
            let tableName = propertyName.split('_')[0];
            insertQueryIfNotExists(tableName, queryInfo[propertyName].fields, queryInfo[propertyName].values, (id) => {
                //if exists or if just added, save the id to the object
                if (queryInfo[propertyName].id === null) {
                    if (id) {
                        queryInfo[propertyName].id = id;
                        resolve();
                    } else {
                        findLastId ( (lastId) => {
                            queryInfo[propertyName].id = lastId;
                            resolve();
                        })
                    }
                }
            });
        });
    }
    for (let propertyName in queryInfo) {
        await insertAndWait(propertyName);
    }
    for (let propertyName in queryInfo) {
        await insertForeignAndWait(propertyName);
    }
    await console.log('inserted company data');
    await connection.end();
    // console.log('queryInfo: ', queryInfo)
}






const addCompanyIfNotExists = (companyInfo, cb) => {
    checkIfExists(companyInfo, 'companies', 'name', companyInfo.overview.name, null, insertToDB);
}

// addCompanyIfNotExists(testData);




module.exports.addCompanyIfNotExists = addCompanyIfNotExists;

