const sql = require('mssql');
const sqlConfig = {
    user: 'Yad2Server',
    password: 'Yad2Password',
    database: 'Yad2',
    server: 'DESKTOP-QQL7HJB',
    requestTimeout: 15000,
    options: {
        keepAlive: true,
        trustedConnection: true,
        trustServerCertificate: true,
    }
}

module.exports = {sql, sqlConfig};