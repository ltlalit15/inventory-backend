// live server

const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'ballast.proxy.rlwy.net',
  port: 19598,
  user: 'root',
  password: 'wmnatvbnKaNnCTXDJZoyfrsErUboJPpk',
  database: 'railway', // Replace with actual DB name if different
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.warn('✅ Connected to Railway MySQL');
module.exports = db;

