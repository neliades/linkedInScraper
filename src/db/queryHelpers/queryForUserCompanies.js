let startDB = require('../connectToDBimmediately.js');

let connection;

let hasUpdated = false;

const updateConnection = () => {
    if (hasUpdated) return;
    connection = require('../connectToDb.js').connection;
    hasUpdated = true;
}


const getCompanies = (cb) => {
    // updateConnection();
    if (!connection) connection = startDB();
    if (connection === 'none') throw new Error ('No mysql connection');

    let sql = `SELECT id, name, companyUrl FROM companiesFROMusers WHERE id_companies IS NULL`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in getCompanies", err)
          } else {
            // console.log(results);
            if (cb) cb(results);
          }
    })
}

const findCompanyInDB = (companyName, cb) => {
    if (!connection) connection = startDB();
    if (connection === 'none') throw new Error ('No mysql connection');

    //prepend all single quotes
    companyName = companyName.replace("'", "''"); 

    let sql = `SELECT * FROM companies WHERE name='${companyName}'`;
    connection.query(sql, null, (err, results) => {
        if(err) {
            console.log(err)
            throw new Error("Error in findCompany", err)
          } else {
            // console.log(results);
            if (cb) cb(results);
          }
    }) 
}



module.exports.getCompanies = getCompanies;
module.exports.findCompanyInDB = findCompanyInDB;