

const {insertQueryIfNotExists} = require('../helpers.js')
const {findLastId} = require('../helpers.js')
const {updateOneFieldDB} = require('../helpers.js')


const addCompanyToDB = async function (companyInfo, cb) {
console.log('addCompanyToDB function was run')
    //queryInfo is a reformatted object to better run insert queries
    let queryInfo = {};
    if (companyInfo) {

    //     //add users to query info
    //     queryInfo = {
    //         users : {
    //             //field names in string
    //             fields : 'name, url, headline, location, summary, connections',
    //             //corresponding values in array
    //             values : [userInfo.profile.name, userInfo.profile.url, userInfo.profile.headline, userInfo.profile.location, userInfo.profile.summary, userInfo.profile.connections.split('+')[0]],
    //             //unknown id (may or may not exist already)
    //             id : null
    //         }
    //     }

        queryInfo = {
            companies : {
                fields: 'name, website, size, description, rating, recommended, ceoApproval, locatedInNYC',
                values: [companyInfo.overview.name, companyInfo.overview.website, companyInfo.overview.size, companyInfo.overview.description, companyInfo.reviews.rating, companyInfo.reviews.recommended, companyInfo.reviews.CEOApproval, companyInfo.overview.inNYC],
                updateFields: ['id_industries'],
                updateIdList: ['industries'],
                id: null
            }
        }

        queryInfo.industries = {
            fields: 'name',
            values: [companyInfo.overview.industry],
            id: null
        }

        let positions = companyInfo.positions.topThree;
        if (companyInfo.positions.exactMatch) positions.push(companyInfo.positions.exactMatch);

        console.log('companyInfo.positions: ', companyInfo.positions)
        console.log({positions});
        for (let i = 0; i < positions.length; i++) {
            queryInfo[`companies_companyPositions_${i}`] = {
                fields: 'low, high, average',
                values: [positions[i].salary.low, positions[i].salary.high, positions[i].salary.average],
                updateFields : ['id_companies', 'id_companyPositions'],
                updateIdList: ['companies', `companyPositions_${i}`],
                id: null
            }
            queryInfo[`companyPositions_${i}`] = {
                fields: 'name',
                values: [positions[i].position],
                id: null
            }

        }
        console.log({queryInfo})

        

    //     //variable name for convenience
    //     let companiesArr = userInfo.positions;
    //     //for every item in list, add an entry
    //     for (let i = 0; i < companiesArr.length; i++) {

    //         let position = companiesArr[i];
    //         queryInfo[`positionsFROMcompanies_${i}`] = {
    //             fields : 'position, linkedInUrl, companyUrl, startToEnd, duration, description, location',
    //             values : [ position.position, position.linkedInUrl, position.companyUrl, position.startToEnd, position.duration, position.description, position.location], 
    //             //join table
    //             targetTable : 'users_companiesFROMusers',
    //             //foreign field names
    //             foreignFields : 'id_users, id_companiesFROMusers',
    //             //foreign table names
    //             foreignIdList: ['users', `companiesFROMusers_${i}`],
    //             //fields where id was not initially present
    //             updateFields : ['id_companiesFROMusers'],
    //             //table? that will need to be updated
    //             updateIdList: [`companiesFROMusers_${i}`],
    //             id : null
    //         }
    //         queryInfo[`companiesFROMusers_${i}`] = {
    //             fields : 'name',
    //             values : [position.name], 
    //             targetTable : 'positionsFROMcompanies',
    //             foreignFields : 'id_companiesFROMusers',
    //             foreignIdList: ['self'],
    //             id : null
    //         }
    //     }

    //     let schoolsArr = userInfo.educations;
    //     for (let i = 0; i < schoolsArr.length; i++) {
    //         let school = schoolsArr[i];
    //         queryInfo[`degrees_${i}`] = {
    //             fields : 'degree, start, end',
    //             values : [school.degree, school.start, school.end], 
    //             targetTable : 'users_schools',
    //             foreignFields : 'id_users, id_schools',
    //             foreignIdList: ['users', `schools_${i}`],
    //             updateFields : ['id_schools'],
    //             updateIdList: [`schools_${i}`],
    //             id : null
    //         }
    //         queryInfo[`schools_${i}`] = {
    //             fields : 'name',
    //             values : [school.name], 
    //             id : null
    //         }
    //     }
        
    //     let volunteeringArr = userInfo.volunteerExperience;
    //     for (let i = 0; i < volunteeringArr.length; i++) {
    //         let organization = volunteeringArr[i];
    //         queryInfo[`positionsFROMorganizations_${i}`] = {
    //             fields : 'position, description, startToEnd, duration',
    //             values : [organization.position, organization.description, organization.startToEnd, organization.duration], 
    //             targetTable : 'users_organizations',
    //             foreignFields : 'id_users, id_organizations',
    //             foreignIdList: ['users', `organizations_${i}`],
    //             updateFields : ['id_organizations'],
    //             updateIdList: [`organizations_${i}`],
    //             id : null
    //         }
    //         queryInfo[`organizations_${i}`] = {
    //             fields : 'name',
    //             values : [organization.name], 
    //             id : null
    //         }
    //     }

    //     let skillsArr = userInfo.skills;
    //     for (let i = 0; i < skillsArr.length; i++) {
    //         let skill = skillsArr[i];
    //         queryInfo[`skills_${i}`] = {
    //             fields : 'name, endorsements',
    //             values : [skill.name, skill.endorsements], 
    //             targetTable : 'users_skills',
    //             foreignFields : 'id_users, id_skills',
    //             foreignIdList: ['users', `self`],
    //             id : null
    //         }
    //     }






        let insertForeignAndWait = async (propertyName) => {
            // console.log('starting foreign and junctions: ', propertyName);
            let insert = await new Promise (resolve => {
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
                let tableName = propertyName.split('_');
                if (tableName.length > 1) tableName.pop();
                tableName = tableName.join('_');
                // console.log('insertForeignAndWait: ', {tableName, propertyName})
                if (updateIdList !== undefined) {
                    for (let i = 0; i < updateIdList.length; i++) {
                        let value;
                        let field = queryInfo[propertyName].updateFields[i]
                        if (updateIdList[i] === 'self') {
                            value = (queryInfo[propertyName].id);
                            console.log('self: ', {value})
                        } else if (typeof updateIdList[i] === "object") {
                            value = (updateIdList[i].value);
                            console.log('array: ', {value})
                        } else {
                            value = (queryInfo[updateIdList[i]].id);
                            console.log('string: ', {value})
                        }
                        
                        // console.log('queryInfo[propertyName]: ', queryInfo[propertyName])

                        // queryInfo[propertyName].id = lastId
                        
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
            console.log('insertAndWait was invoked')
            // console.log('starting initial inserts: ', propertyName);
            return new Promise (resolve => {
                //find if exists
                let tableName = propertyName.split('_');
                if (tableName.length > 1) tableName.pop();
                tableName = tableName.join('_');
                // console.log('insertAndWait: ', {tableName, propertyName})
                try {
                    console.log('insertQueryIfNotExists is about to be invoked')
                    insertQueryIfNotExists(tableName, queryInfo[propertyName].fields, queryInfo[propertyName].values, (id) => {
                        //if exists or if just added, save the id to the object
                        console.log('insertQueryIfNotExists ran successfully')
                        if (queryInfo[propertyName].id === null) {
                            if (id) {
                                console.log('findLastId will NOT be invoked')
                                if (id.insertId) {
                                    queryInfo[propertyName].id = id.insertId;
                                    console.log('*********')
                                    console.log({insertId: id.insertId})
                                    console.log('*********')
                                } else {
                                    queryInfo[propertyName].id = id;
                                    console.log('*********')
                                    console.log({id})
                                    console.log('*********')
                                }
                                resolve();
                            } else {
                                console.log('findLastId is about to be invoked')
                                findLastId ( (lastId) => {
                                    queryInfo[propertyName].id = lastId;
                                    resolve();
                                })
                            }
                        }
                    });
                } catch (error) {
                    resolve('no connection');
                }
            });
        }
        for (let propertyName in queryInfo) {
            console.log({propertyName})
            let insert = await insertAndWait(propertyName);
            if (insert === 'no connection') return;
        }
        for (let propertyName in queryInfo) {
            await insertForeignAndWait(propertyName);
        }
        await console.log('inserted user data');
        if (cb) await cb(queryInfo);
    } else {
        console.log('no company data provided')
        if (cb) cb();
    }







}

module.exports = addCompanyToDB;