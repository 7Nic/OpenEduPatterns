const mysql = require('mysql');
module.exports = {
    execSQLQuery(sqlQry, res) {
        const connection = mysql.createConnection({
            host     : 'us-cdbr-iron-east-01.cleardb.net', 
            user     : 'beaf9588d57556',
            password : '0d2a0244',
            database : 'heroku_266f60915c6ecc1'
        });

        connection.query(sqlQry, (error, results, fields) => {
            if(error) {
                res.json(erorr);
            } else {
                res.json(results);
            }
            connection.end();
        });
    }
}