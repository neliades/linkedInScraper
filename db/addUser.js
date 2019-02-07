console.log('\n\n\n\n\n***new test***\n\n\n\n\n')

const testData = require('../sample.js');

const {checkIfExists} = require('./helpers.js');
const {insertQuery} = require('./helpers.js')
const {checkIfExistsInJunction} = require('./helpers.js')
const {insertQueryIfNotExists} = require('./helpers.js')
const {updateOneFieldDB} = require('./helpers.js')
const {findLastId} = require('./helpers.js')

const connection = require('./connectToDb.js');

const addUserToDb = (data) => {
    console.log(data);
}

module.exports.addUserToDb = addUserToDb;