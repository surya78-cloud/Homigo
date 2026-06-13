const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'suryaPr@*78',
  database: 'airbnb'
});

module.exports = pool.promise();