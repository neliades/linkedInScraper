const {findCompanyInfo} = require('./glassDoor/companySearch.js');

const addToDb = async function () {
  console.log(await findCompanyInfo('Google'));
}

addToDb()