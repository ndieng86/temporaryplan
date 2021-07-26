/////Database Connexion
import mysql from 'mysql';

let conn = mysql.createPool({
  connectionLimit : 10,
  host: 'xs.sednove.com',
  user: 'xpert',
  password: 'R@sc@le2020',
  database: 'xpertv1',
  port:3306,
  multipleStatements: true
})

  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    console.log('Connexion a la Base de donnée réussie!')//connected
    
  });

export default conn;


    