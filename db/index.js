
const mysql = require('mysql');
const mysqlConfig = require('./config.js');

const connection = mysql.createConnection(mysqlConfig);

connection.connect( (err) => {
    if (err) throw err;
    console.log("mySQL connected successfully");
})

module.exports = connection;