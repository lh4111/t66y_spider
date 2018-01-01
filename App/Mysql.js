// get the client
const mysql = require('mysql2');

var mysql_pool = mysql.createPool({  
    host: 'localhost',  
    user: 'root',  
    password: '',  
    database: 't66y_spider',  
    port: 3306 
});  
module.exports = mysql_pool