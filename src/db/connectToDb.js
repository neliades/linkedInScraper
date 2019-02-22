const mysql = require('mysql');
const mysqlConfig = require('./config.js');

const {exec} = require('child_process');

let connection = {};

console.log('connect to db is read')
const buildSchemaAndConnect = async () => {
    if (connection.connection) return;
    console.log('buildSchema invoked')
    await new Promise ((resolve) => {
        exec(`mysql -u root < ~/../..${__dirname}/schema.sql`, (error) => {
            if (error) throw error;
            resolve();
            console.log('Successfully built mySQL schema.')
        });
    })
    console.log('after exec')
    await new Promise ((resolve) => {
        connection.connection = mysql.createConnection(mysqlConfig);
        connection.connection.connect( (err) => {
            if (err) throw err;
            resolve();
            console.log("Successfully connected to mySQL");
        })
    })
    return;
}

buildSchemaAndConnect();

// module.exports.connection = connection;
// module.exports.buildSchemaAndConnect = buildSchemaAndConnect;
module.exports = connection;