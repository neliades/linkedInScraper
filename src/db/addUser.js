// console.log('\n\n\n\n\n***new test***\n\n\n\n\n')


const {insertQueryIfNotExists} = require('./helpers.js')
const {findLastId} = require('./helpers.js')
const {updateOneFieldDB} = require('./helpers.js')


// const connection = require('./connectToDb.js');


const addUserToDb = async function (userInfo, cb) {
    // console.log(userInfo);

    let queryInfo = {};
    if (userInfo) {
        queryInfo = {
            users : {
                fields : 'name, url, headline, location, summary, connections',
                values : [userInfo.profile.name, userInfo.profile.url, userInfo.profile.headline, userInfo.profile.location, userInfo.profile.summary, userInfo.profile.connections.split('+')[0]],
                id : null
            }
        }

        let companiesArr = userInfo.positions;
        for (let i = 0; i < companiesArr.length; i++) {
            let position = companiesArr[i];
            queryInfo[`positionsFROMcompanies_${i}`] = {
                fields : 'position, linkedInUrl, companyUrl, startToEnd, duration, description',
                values : [ position.position, position.linkedInUrl, position.companyUrl, position.startToEnd, position.duration, position.description], 
                targetTable : 'users_companiesFROMusers',
                foreignFields : 'id_users, id_companiesFROMusers',
                foreignIdList: ['users', `companiesFROMusers_${i}`],
                updateFields : ['id_companiesFROMusers'],
                updateIdList: [`companiesFROMusers_${i}`],
                id : null
            }
            queryInfo[`companiesFROMusers_${i}`] = {
                fields : 'name',
                values : [position.name], 
                targetTable : 'positionsFROMcompanies',
                foreignFields : 'id_companiesFROMusers',
                foreignIdList: ['self'],
                id : null
            }
        }

        let schoolsArr = userInfo.educations;
        for (let i = 0; i < schoolsArr.length; i++) {
            let school = schoolsArr[i];
            queryInfo[`degrees_${i}`] = {
                fields : 'degree, start, end',
                values : [school.degree, school.start, school.end], 
                targetTable : 'users_schools',
                foreignFields : 'id_users, id_schools',
                foreignIdList: ['users', `schools_${i}`],
                updateFields : ['id_schools'],
                updateIdList: [`schools_${i}`],
                id : null
            }
            queryInfo[`schools_${i}`] = {
                fields : 'name',
                values : [school.name], 
                id : null
            }
        }
        
        let volunteeringArr = userInfo.volunteerExperience;
        for (let i = 0; i < volunteeringArr.length; i++) {
            let organization = volunteeringArr[i];
            queryInfo[`positionsFROMorganizations_${i}`] = {
                fields : 'position, description, startToEnd, duration',
                values : [organization.position, organization.description, organization.startToEnd, organization.duration], 
                targetTable : 'users_organizations',
                foreignFields : 'id_users, id_organizations',
                foreignIdList: ['users', `organizations_${i}`],
                updateFields : ['id_organizations'],
                updateIdList: [`organizations_${i}`],
                id : null
            }
            queryInfo[`organizations_${i}`] = {
                fields : 'name',
                values : [organization.name], 
                id : null
            }
        }

        let skillsArr = userInfo.skills;
        for (let i = 0; i < skillsArr.length; i++) {
            let skill = skillsArr[i];
            queryInfo[`skills_${i}`] = {
                fields : 'name, endorsements',
                values : [skill.name, skill.endorsements], 
                targetTable : 'users_skills',
                foreignFields : 'id_users, id_skills',
                foreignIdList: ['users', `self`],
                id : null
            }
        }

        // let accomplishmentsArr = userInfo.accomplishments;
        // for (let i = 0; i < accomplishmentsArr.length; i++) {
        //     let accomplishment = accomplishmentsArr[i];
        //     queryInfo[`accomplishments_${i}`] = {
        //         fields : 'name',
        //         values : [accomplishment], 
        //         targetTable : 'users_accomplishments',
        //         foreignFields : 'id_users, id_accomplishments',
        //         foreignIdList: ['users', `self`],
        //         id : null
        //     }
        // }






        let insertForeignAndWait = async (propertyName) => {
            // console.log('starting foreign and junctions: ', propertyName);
            await new Promise (resolve => {
                let values = [];
                let foreignIdList = queryInfo[propertyName].foreignIdList;
                // if (propertyName.split('companiesFROMusers').length > 1) console.log({foreignIdList, id: queryInfo[propertyName].id})

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
                            
                            // if (propertyName.split('companiesFROMusers').length > 1) console.log('inserted', {foreignIdList, id: queryInfo[propertyName].id})

                            resolve();
                        });       
                    // }

                } else {
                    resolve();
                }
            });
            await new Promise ( (resolve) => {
                let updateIdList = queryInfo[propertyName].updateIdList;
                let tableName = propertyName.split('_')[0];
                if (updateIdList !== undefined) {
                    for (let i = 0; i < updateIdList.length; i++) {
                        let value;
                        let field = queryInfo[propertyName].updateFields[i]
                        if (updateIdList[i] === 'self') {
                            value = (queryInfo[propertyName].id);
                        } else if (typeof updateIdList[i] === "object") {
                            value = (updateIdList[i].value);
                        } else {
                            value = (queryInfo[updateIdList[i]].id);
                        }
                        updateOneFieldDB(tableName, 'id', queryInfo[propertyName].id, field, value, () => {
                            resolve();
                        })
                    }
                } else {
                    resolve();
                }
            })
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
        if (cb) await cb();
    } else {
        console.log('no user data provided')
        if (cb) cb();
    }


    



}

// addUserToDb(testData);

module.exports.addUserToDb = addUserToDb;