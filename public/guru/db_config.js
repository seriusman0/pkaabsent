var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "#dbabsensipka#",
    database: "pka_absent_db_guru"
});


module.exports = db;