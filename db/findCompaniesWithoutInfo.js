const connection = require('./connectToDb.js');



const findCompaniesWithoutInfo = (tableName) => {
    return new Promise ( (resolve) => {
        let sql = `SELECT name FROM ${tableName} WHERE ISNULL(id_companies)`;
        connection.query(sql, null, (err, results) => {
            if(err) {
                console.log(err)
                resolve();
                throw new Error("Error in findCompaniesWithoutInfo", err)
              } else {
                if (results.length < 1) {
                    console.log('no results')
                    resolve();
                } else {
                    let companyList = [];
                    for (let i in results) {
                        let company = results[i]
                        companyList.push(company.name)
                    }
                    resolve(companyList);
                }
            }
        })
    })
}


// findCompaniesWithoutInfo('companiesFROMusers')

module.exports.findCompaniesWithoutInfo = findCompaniesWithoutInfo;