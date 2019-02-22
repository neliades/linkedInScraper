let {connection} = require('./connectToDb.js');

let hasUpdated = false;

const updateConnection = () => {
    if (hasUpdated) return;
    connection = require('./connectToDb.js').connection;
    hasUpdated = true;
}


// const queryUserProfileInDb = () => {
//     //select users.*, accomplishments.name from users 
//     //inner join users_accomplishments on users.id=users_accomplishments.id_accomplishments 
//     //inner join accomplishments on accomplishments.id=users_accomplishments.id_accomplishments;
//     //desiredFields
//     //starting tables
//     //next table (1)
//     //matching ids or values from starting table and table 1
//     //next table (2)
//     //matching ids or values from table 1 and table 2

// let str = `
// select users.*, companiesFROMusers.name, positionsFROMcompanies.* from users
// inner join users_companiesFROMusers on users.id=users_companiesFROMusers.id_users
// inner join companiesFROMusers on users_companiesFROMusers.id_companiesFROMusers=companiesFROMusers.id
// inner join positionsFROMcompanies on companiesFROMusers.id=positionsFROMcompanies.id_companiesFROMusers;
//     `

//junction between user and skills

// let str = `
// select users.*, skills.name, skills.endorsements from users
// inner join users_skills on users.id=users_skills.id_users
// inner join skills on skills.id=users_skills.id_skills;

// `

// let combo = `
// select users.*, companiesFROMusers.name, positionsFROMcompanies.*, skills.name, skills.endorsements from users
// inner join users_companiesFROMusers on users.id=users_companiesFROMusers.id_users
// inner join companiesFROMusers on users_companiesFROMusers.id_companiesFROMusers=companiesFROMusers.id
// inner join positionsFROMcompanies on companiesFROMusers.id=positionsFROMcompanies.id_companiesFROMusers
// inner join users_skills on users.id=users_skills.id_users
// inner join skills on skills.id=users_skills.id_skills;
// `

// let str = `
// select companiesFROMusers.name, positionsFROMcompanies.* from positionsFROMcompanies
// inner join companiesFROMusers on positionsFROMcompanies.id_companiesFROMusers=companiesFROMusers.id;
// inner join users_companiesFROMusers on positionsFROMcompanies.id=users_companiesFROMusers.id_positionsFROMcompanies

// inner join positionsFROMcompanies on users_companiesFROMusers.id_positionsFROMcompanies=positionsFROMcompanies.id
// `

//     let test = {
//         desiredFields : {
//             users : ['*'],
//             positionsFROMcompanies : ['position', 'range', 'duration', 'description'],
//             degrees : ['degree', 'start', 'end'],
//             positionsFROMorganizations : ['position', 'experience', 'description', 'range', 'duration'],
//             companiesFROMusers : ['name'],
//             schools : ['name'],
//             organizations : ['name'],
//             skills : ['name', 'endorsements'],
//             accomplishments : ['name']
//         },

//     }


//     let selectStatement = `SELECT ${desiredFields} FROM ${mainTable}`
//     let innerJoinStatement = `INNER JOIN ${nextTable} ON ${fieldNextTable}=${fieldComparisonTable}`
// }

const queryWithInnerJoin = (desiredTablesAndFieldsObj, innerJoinsArr, whereObj, cbExists, cbNotExists) => {
    // let desiredTablesAndFieldsObj = {
    //     companiesFROMusers : ['name'],
    //     positionsFROMcompanies : ['position', 'startToEnd', 'duration', 'description']
    // }
    // let innerJoinsArr = [
    //     {
    //         table : 'users',
    //     },
    //     {
    //         table: 'users_companiesFROMusers',
    //         field: 'id_users',
    //         previousField: 'id'
    //     },
    //     {
    //         table: 'companiesFROMusers',
    //         field: 'id',
    //         previousField: 'id_companiesFROMusers'
    //     },
    //     {
    //         table : 'positionsFROMcompanies',
    //         field: 'id_companiesFROMusers',
    //         previousField: 'id'
    //     }
    // ]
    // let whereObj = {
    //     table: 'users',
    //     field: 'id',
    //     value: '1'
    // }
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    
    let select = '';
    for (let key in desiredTablesAndFieldsObj) {
        for (let fieldIndex in desiredTablesAndFieldsObj[key]) {
            let field = desiredTablesAndFieldsObj[key][fieldIndex]
            select = select + `${key}.${field}, `
        }
    }
    let mainTable = innerJoinsArr[0].table || innerJoinsArr[0][0];

    select = 'SELECT ' + select.slice(0,select.length-2) + ' FROM ' + mainTable;
    let innerJoins = '';
    for (let i = 0; i < innerJoinsArr.length; i++) {
        if (innerJoinsArr[i].length) {
            innerJoinsArr[i] = {
                table: innerJoinsArr[i][0],
                field: innerJoinsArr[i][1],
                previousField: innerJoinsArr[i][2]
            }
        }
        let statementInfo = innerJoinsArr[i]
        if (statementInfo.field && statementInfo.previousField) {
            let {table, field, previousField} = statementInfo;
            let previousTable = innerJoinsArr[i-1].table;
            let template = '\n' + `INNER JOIN ${table} ON ${table}.${field}=${previousTable}.${previousField}`;
            innerJoins = innerJoins + template;
        }
    }
    if (whereObj.length) {
        whereObj = {
            table: whereObj[0],
            field: whereObj[1],
            value: whereObj[2]
        }
    }
    let where = '\n' + `WHERE ${whereObj.table}.${whereObj.field}=${whereObj.value}`;
    let sql = '' + select + innerJoins + where + ';';

    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in queryWithInnerJoin", err)
          } else {
            if (results.length < 1) {
                if (cbNotExists) cbNotExists(results);
            } else {
                if (cbExists) cbExists(results);
            }
        }
    })


}

const checkIfExists = (companyInfo, tableName, field, value, cbExists, cbNotExists) => {
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    let sql = `SELECT * FROM ${tableName} WHERE ${field} = (?)`
    connection.query(sql, [[value]], (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in checkIfExists", err)
          } else {
            if (results.length < 1) {
                //add
                // console.log('!!!!!!!!!!!!!!!!!!!!!')
                // console.log('does not exist')
                // console.log(sql)
                // console.log()
                if (cbNotExists) {
                    cbNotExists(companyInfo, results);
                }
            } else {
                // console.log('!!!!!!!!!!!!!!!!!!!!!')
                // console.log('already exists')
                // console.log(sql)
                // console.log()
                // console.log(results[0])
                if (cbExists) {
                    cbExists(companyInfo, results);
                }
            }
        }
    })
    
}

const insertQuery = (tableName, fields, values, cb) => {
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    let sql = `INSERT INTO ${tableName} (${fields})
    VALUES (?)`;
    // console.log()
    // console.log(sql);
    // console.log()
    connection.query(sql, [values], (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in insertQuery", err)
          } else {
            // console.log(results);
            // console.log('completed: ', tableName)
            if (cb) cb();
          }
    })
}

const checkIfExistsInJunction = (tableName, fields, values, cbExists, cbNotExists) => {
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    // console.log('checking junction for first two fields')
    let sql = `SELECT * FROM ${tableName} WHERE ${fields[0]} = ? AND ${fields[1]} = ?`;
    connection.query(sql, [values[0], values[1]], (err, results) => {
        if(err) {
            // console.log(err)
            throw new Error("Error in checkIfExistsInJunction", err)
          } else {
            if (results.length < 1) {
                //add
                // console.log('this combination of foreign ids DOES NOT exist, adding now...')
                if (cbNotExists) {
                    // console.log('invoking the callback for does not exist')
                    cbNotExists(results);
                }
            } else {
                // console.log('this combination of foreign ids ALREADY exists')
                // console.log(results[0])
                if (cbExists) {
                    // console.log('invoking the callback for exists')
                    cbExists(results);
                }
            }
        }
    })
}

const insertQueryIfNotExists = (tableName, fields, values, cb) => {
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    let field = fields.split(',')[0];
    let value;
    typeof values === "object" ? value = values[0] : value = values; 
    // console.log('XXXXXXXXXXXXXXXXXXXXXXX')
    // console.log(tableName, ': ', value)
    checkIfExists(null, tableName, field, value, (companyInfo, results) => {
        let id = results[0].id;
        if (tableName.split('_').length > 1) {
            fieldsArr = fields.split(',');
            // console.log('already exists but it is a junction, so checking if both ids exist')
            checkIfExistsInJunction(tableName, fieldsArr, values, cb, () => {
              insertQuery (tableName, fields, values, cb) 
            });
        } else {
            cb(id);
        }
    }, (companyInfo, results) => {
        //if doesn't exist, add
        // console.log('doesnt exist, performing insertQuery')
        insertQuery (tableName, fields, values, cb) 
    })
}

const updateOneFieldDB = (tableName, fieldLookup, valueLookup, field, value, cb) => {
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    let sql = `UPDATE ${tableName}
    SET ${field} = ?
    WHERE ${fieldLookup} = ?`;

    connection.query(sql, [value, valueLookup], (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in updateOneFieldDB", err)
          } else {
            // console.log(results);
            if (cb) cb();
        }
    })
}

const findLastId = (cb) => {
    updateConnection();
    if (connection === 'none') throw new Error ('No mysql connection');

    let sql = `SELECT LAST_INSERT_ID()`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            // console.log(err)
            throw new Error("Error in selectLastTable", err)
        } else {
            let lastID = results[0]['LAST_INSERT_ID()'];
            cb(lastID);
          }
    })
}

module.exports.checkIfExists = checkIfExists;
module.exports.insertQuery = insertQuery;
module.exports.checkIfExistsInJunction = checkIfExistsInJunction;
module.exports.insertQueryIfNotExists = insertQueryIfNotExists;
module.exports.updateOneFieldDB = updateOneFieldDB;
module.exports.findLastId = findLastId;
module.exports.queryWithInnerJoin = queryWithInnerJoin;