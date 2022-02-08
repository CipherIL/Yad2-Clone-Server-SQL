const sql = require('mssql');
const sqlConfig = {
    user: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    server: process.env.SQL_SERVER,
    requestTimeout: 15000,
    options: {
        keepAlive: true,
        trustedConnection: true,
        trustServerCertificate: true,
    }
}

module.exports = {sql, sqlConfig};