// local mysql

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'inventory',
    multipleStatements: true
});

 
console.warn('Connected');

module.exports = db;


// live server

// const mysql = require('mysql2/promise');

// const db = mysql.createPool({
//     host: 'nozomi.proxy.rlwy.net',        // ✅ Remote host from CLI
//     port: 48488,                           // ✅ Port from CLI
//     user: 'root',                          // ✅ Username
//     password: 'IgqaBOnvVntHIquaIjMjvATrnuEuRZSz',  // ✅ Password
//     database: 'railway',                  // ✅ Database name
//     multipleStatements: true              // Optional, allows running multiple queries
// });

// console.warn('✅ Connected to Railway MySQL');

// module.exports = db;


