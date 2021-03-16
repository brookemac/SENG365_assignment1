const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;

exports.createPool = async function () {
    pool = await mysql.createPool({
        multipleStatements: true,
        host: process.env.SENG365_MYSQL_HOST,
        user: process.env.SENG365_MYSQL_USER,
        password: process.env.SENG365_MYSQL_PASSWORD,
        database: process.env.SENG365_MYSQL_DATABASE,
        port: process.env.SENG365_MYSQL_PORT || 3306
    });
    await pool.getConnection(); //Check connection
    console.log('Successfully connected to the database');
};

exports.getPool = function () {
    return pool;
};
