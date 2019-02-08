console.log('\n\n\n\n\n***new test***\n\n\n\n\n')

const {testData} = require('./testDataProfile.js');

const {checkIfExists} = require('./helpers.js');
const {insertQuery} = require('./helpers.js')
const {checkIfExistsInJunction} = require('./helpers.js')
const {insertQueryIfNotExists} = require('./helpers.js')
const {updateOneFieldDB} = require('./helpers.js')
const {findLastId} = require('./helpers.js')

const connection = require('./connectToDb.js');

const addUserToDb = async function (userInfo, cb) {
    // console.log(userInfo);

    let queryInfo = {};
    if (userInfo) {
        queryInfo = {
            users : {
                fields : 'name, url, headline, location, summary, connections',
                values : [userInfo.name, userInfo.url, userInfo.headline, userInfo.location, userInfo.summary, userInfo.connections.split('+')[0]],
                id : null
            }
        }

        let companiesArr = userInfo.companies;
        for (let i = 0; i < companiesArr.length; i++) {
            let position = companiesArr[i];
            queryInfo[`positionsFROMcompanies_${i}`] = {
                fields : 'position, startToEnd, duration, description',
                values : [ position.position, position.range, position.duration, position.description], 
                targetTable : 'users_companiesFROMusers',
                foreignFields : 'id_users, id_companiesFROMusers, id_positionsFROMcompanies',
                foreignIdList: ['users', `companiesFROMusers_${i}`, 'self'],
                id : null
            }
            queryInfo[`companiesFROMusers_${i}`] = {
                fields : 'name',
                values : [position.name], 
                id : null
            }
        }

        let schoolsArr = userInfo.schools;
        for (let i = 0; i < schoolsArr.length; i++) {
            let school = schoolsArr[i];
            queryInfo[`degrees_${i}`] = {
                fields : 'degree, start, end',
                values : [school.degree, school.start, school.end], 
                targetTable : 'users_schools',
                foreignFields : 'id_users, id_schools, id_degrees',
                foreignIdList: ['users', `schools_${i}`, 'self'],
                id : null
            }
            queryInfo[`schools_${i}`] = {
                fields : 'name',
                values : [school.name], 
                id : null
            }
        }
        
        let volunteeringArr = userInfo.volunteering;
        for (let i = 0; i < volunteeringArr.length; i++) {
            let organization = volunteeringArr[i];
            queryInfo[`positionsFROMorganizations_${i}`] = {
                fields : 'position, experience, description, startToEnd, duration',
                values : [organization.position, organization.experience, organization.description, organization.range, organization.duration], 
                targetTable : 'users_organizations',
                foreignFields : 'id_users, id_organizations, id_positionsFROMorganizations',
                foreignIdList: ['users', `organizations_${i}`, 'self'],
                id : null
            }
            queryInfo[`organizations_${i}`] = {
                fields : 'name',
                values : [organization.experience], 
                id : null
            }
        }

        let skillsArr = userInfo.skills;
        for (let i = 0; i < skillsArr.length; i++) {
            let skill = skillsArr[i];
            queryInfo[`skills_${i}`] = {
                fields : 'name, endorsements',
                values : [skill.title, skill.numOfEndorsements], 
                targetTable : 'users_skills',
                foreignFields : 'id_users, id_skills',
                foreignIdList: ['users', `self`],
                id : null
            }
        }

        let accomplishmentsArr = userInfo.accomplishments;
        for (let i = 0; i < accomplishmentsArr.length; i++) {
            let accomplishment = accomplishmentsArr[i];
            queryInfo[`accomplishments_${i}`] = {
                fields : 'name',
                values : [accomplishment], 
                targetTable : 'users_accomplishments',
                foreignFields : 'id_users, id_accomplishments',
                foreignIdList: ['users', `self`],
                id : null
            }
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
                    // let tableName = propertyName.split('_')[0];
                    // if (tableName !== 'companiesFROMusers') {
                        //find if exists
                        insertQueryIfNotExists(targetTable, queryInfo[propertyName].foreignFields, values, () => {
                            //if exists or if just added, save the id to the object
                            // console.log('successful entry for ', queryInfo[propertyName].targetTable, ': ', values);
                            resolve();
                        });       
                    // }

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
        await console.log('inserted user data');
        await cb();
    } else {
        console.log('no user data provided')
        cb();
    }


    



}

// addUserToDb(testData);

module.exports.addUserToDb = addUserToDb;