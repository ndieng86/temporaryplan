/////Database Connexion
import mysql from 'mysql';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config()
let conn = mysql.createPool(
    {
      connectionLimit : 100,
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    }
  )

  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    console.log('Connexion a la Base de donnée réussie!')//connected
  });

export default conn;