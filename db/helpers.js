const connection = require('./connectToDb.js');

const checkIfExists = (companyInfo, tableName, field, value, cbExists, cbNotExists) => {
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
    let sql = `UPDATE ${tableName}
    SET ${field} = ?
    WHERE ${fieldLookup} = ?`;

    connection.query(sql, [value, valueLookup], (err, results) => {
        if(err) {
            // console.log(err)
            throw new Error("Error in updateOneFieldDB", err)
          } else {
            // console.log(results);
            if (cb) cb();
        }
    })
}

const findLastId = (cb) => {
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