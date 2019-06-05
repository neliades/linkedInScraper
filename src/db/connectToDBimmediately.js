const mysql = require('mysql');
const mysqlConfig = require('./config.js');

const {exec} = require('child_process');

let connection;

let startDB = () => {
    if (connection) return connection;
    console.log('connect to db immediately is read')
    if (typeof mysqlConfig.host !== 'string' || typeof mysqlConfig.user !== 'string' || typeof mysqlConfig.password !== 'string' || typeof mysqlConfig.database !== 'string') {
        throw ('wrong configuration')
    }
    // console.log('buildSchema invoked')
    // exec(`mysql -u root < ~/../..${__dirname}/schema.sql`, (error) => {
    //     if (error) throw error;
    //     console.log('Successfully built mySQL schema.')
    // });

    // console.log('after exec')

    connection = mysql.createConnection(mysqlConfig);
    connection.connect( (err) => {
        if (err) throw err;
        console.log("Successfully connected to mySQL");
    })
    return connection;
}


module.exports = startDB;