/////Database Connexion
import mysql from 'mysql'

var conn = mysql.createPool(
    {
      connectionLimit : 100,
      host: 'jak.sednove.com',
      user: 'xpert',
      password: 'R@sc@le2020',
      database: 'xpertv1',
      multipleStatements: true
    }
  )

  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    console.log('Connexion a la Base de donnée réussie!')//connected
    connection.release()
  });

export default conn;