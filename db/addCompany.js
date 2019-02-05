console.log('\n\n\n\n\n***new test***\n\n\n\n\n')

const mysql = require('mysql');
const mysqlConfig = require('./config.js');
const testData = require('./testData.js')
const connection = mysql.createConnection(mysqlConfig);
connection.connect( (err) => {
    if (err) throw err;
    console.log("mySQL connected successfully");
})



const checkIfExists = (companyInfo, tableName, field, value, cbExists, cbNotExists) => {

    let sql = `SELECT * FROM ${tableName} WHERE ${field} = '${value}'`
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in checkIfExists", err)
          } else {
            if (results.length < 1) {
                //add
                console.log('!!!!!!!!!!!!!!!!!!!!!')
                console.log('does not exist')
                console.log(sql)
                console.log()
                if (cbNotExists) {
                    cbNotExists(companyInfo, results);
                }
            } else {
                console.log('!!!!!!!!!!!!!!!!!!!!!')
                console.log('already exists')
                console.log(sql)
                console.log()
                console.log(results[0])
                if (cbExists) {
                    cbExists(companyInfo, results);
                }
            }
        }
    })
    
}


const selectFromDB = (companyInfo, cb) => {
    let sql = `SELECT * FROM ${tableName} WHERE name = '${companyInfo.overview.name}'`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in selectFromDB", err)
          } else {
            console.log(results);
          }
    })
}

const selectLastTable = (tableName, fieldLookup, valueLookup, field, isJunction, cb) => {
    let sql = `SELECT LAST_INSERT_ID()`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in selectLastTable", err)
        } else {
            let lastID = results[0]['LAST_INSERT_ID()'];
            //table, company name, foreign field, last id
            if (isJunction) {
                junctionUpdateAdd();
            } else {
                updateOneFieldDB(tableName, fieldLookup, valueLookup, field, lastID, cb);
            }
            // return (results[0]['LAST_INSERT_ID()']);
          }
    })
}
const insertQuery = (tableName, fields, values, cb) => {
    let sql = `INSERT INTO ${tableName} (${fields})
    VALUES (?)`;
    console.log(sql);
    console.log()
    connection.query(sql, [values], (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in insertQuery", err)
          } else {
            console.log(results);
            console.log('completed: ', tableName)
            if (cb) cb();
          }
    })
}

const checkIfExistsInJunction = (tableName, fields, values, cbExists, cbNotExists) => {
    console.log('checking junction for first two fields')
    let sql = `SELECT * FROM ${tableName} WHERE ${fields[0]} = '${values[0]}' AND ${fields[1]} = '${values[1]}'`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in checkIfExistsInJunction", err)
          } else {
            if (results.length < 1) {
                //add
                console.log('this combination of foreign ids DOES NOT exist, adding now...')
                if (cbNotExists) {
                    console.log('invoking the callback for does not exist')
                    cbNotExists(results);
                }
            } else {
                console.log('this combination of foreign ids ALREADY exists')
                console.log(results[0])
                if (cbExists) {
                    console.log('invoking the callback for exists')
                    cbExists(results);
                }
            }
        }
    })
}

const insertQueryIfNotExists = (tableName, fields, values, cb) => {
    let field = fields.split(',')[0]; //name
    let value;
    typeof values === "object" ? value = values[0] : value = values; //internet
    console.log('XXXXXXXXXXXXXXXXXXXXXXX')
    console.log(tableName, ': ', value)
    checkIfExists(null, tableName, field, value, (companyInfo, results) => {
        let id = results[0].id;
        //if exists
        //if companyName or industryName or other unique fields, don't update
        //if a junction, check if the second Id matches the one you're going to add
            //if exists, don't add
            //if does not exist, add
        if (tableName.split('_').length > 1) {
            fieldsArr = fields.split(',');
            console.log('already exists but it is a junction, so checking if both ids exist')
            checkIfExistsInJunction(tableName, fieldsArr, values, cb, () => {
              insertQuery (tableName, fields, values, cb) 
            });
        } else {
            cb(id);
        }
    }, (companyInfo, results) => {
        //if doesn't exist, add
        console.log('doesnt exist, performing insertQuery')
        insertQuery (tableName, fields, values, cb) 
    })
}

const updateOneFieldDB = (tableName, fieldLookup, valueLookup, field, value, cb) => {
    // UPDATE table_name
    // SET column1 = value1, column2 = value2, ...
    let sql = `UPDATE ${tableName}
    SET ${field} = ${value}
    WHERE ${fieldLookup} = '${valueLookup}'`;

    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in updateOneFieldDB", err)
          } else {
            console.log(results);
            if (cb) cb();
        }
    })
}

const findLastId = (cb) => {
    let sql = `SELECT LAST_INSERT_ID()`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in selectLastTable", err)
        } else {
            let lastID = results[0]['LAST_INSERT_ID()'];
            cb(lastID);
          }
    })
}
const insertToDB = async function (companyInfo, results, specialQuery, cb) {
    console.log('insertToDB invoked')
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
            console.log('starting foreign and junctions: ', propertyName);
            return new Promise (resolve => {
                let values = [];
                let foreignIdList = queryInfo[propertyName].foreignIdList;
                console.log('foreignIdList for , ', propertyName, ': ', foreignIdList)
                if (foreignIdList !== undefined) {
                    console.log('foreignIdList found at table: ', propertyName)
                    for (let i =0; i < foreignIdList.length; i++) {
                        if (foreignIdList[i] === 'self') {
                            values.push(queryInfo[propertyName].id);
                        } else if (typeof foreignIdList[i] === "object") {
                            values.push(foreignIdList[i].value);
                        } else {
                            values.push(queryInfo[foreignIdList[i]].id);
                        }
                    }
                    console.log('idList for ', queryInfo[propertyName].targetTable, ': ', values);
                    let targetTable = queryInfo[propertyName].targetTable;
                    if (targetTable === 'companies') {
                        //const updateOneFieldDB = (propertyName, fieldLookup, valueLookup, field, value, cb) => {
                        updateOneFieldDB(targetTable, 'id', queryInfo[targetTable].id, queryInfo[propertyName].foreignFields, values[0], () => {
                            console.log('inserted id_industries into companies');
                            resolve();
                        })
                    } else {
                        //find if exists
                        insertQueryIfNotExists(targetTable, queryInfo[propertyName].foreignFields, values, () => {
                            //if exists or if just added, save the id to the object
                            console.log('successful entry for ', queryInfo[propertyName].targetTable, ': ', values);
                            resolve();
                        });
                    }
                } else {
                    resolve();
                }
            });
    }
    let insertAndWait = (propertyName) => {
        console.log('starting initial inserts: ', propertyName);
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
    console.log('queryInfo: ', queryInfo)
}



const selectAllAboutCompany = () => {
    let sql = `SELECT companies.name, companies.website, companies.size, industries.name, companies.description, companies.rating, companies.recommended, companies.ceoApproval, companies.locatedInNyc, companies.positive, companies.neutral, companies.negative, companies.difficulty
    FROM companies
    INNER JOIN industries
    ON companies.id_industries=industries.id
    WHERE companies.name = 'Google'
    ;`;

    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in selectAllAboutCompany", err)
          } else {
            console.log(results);
          }
    })
}


const addToDBIfNotExists = (companyInfo, cb) => {
    checkIfExists(companyInfo, 'companies', 'name', companyInfo.overview.name, null, insertToDB);
}

addToDBIfNotExists(testData);




module.exports.addToDBIfNotExists = addToDBIfNotExists;

