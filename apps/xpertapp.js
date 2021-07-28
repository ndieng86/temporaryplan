'use strict';

require('dotenv').config();

const http = require('http');
const fs = require('fs');


/**
 * Require the dependencies
 * @type {*|createApplication}
 * 
 **/
const express = require('express');
const app = express();
const path = require('path');
const OAuthClient = require('intuit-oauth');
const bodyParser = require('body-parser');
const ngrok =  (process.env.NGROK_ENABLED==="true") ? require('ngrok'):null;
var schedule = require('node-schedule');
var url = require('url');

/**
 * Configure View and Handlebars
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json())

const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * App Variables
 * @type {null}
 */
let oauth2_token_json = null,
    redirectUri = '';


/**
 * Instantiate new Client
 * @type {OAuthClient}
 */

let oauthClient = null;


/**
 * Home Route
 */
app.get('/', function(req, res) {

    res.render('index');
});


/**
 * Get the AuthorizeUri
 */
app.get('/authUri', urlencodedParser, function(req,res) {

    oauthClient = new OAuthClient({
        clientId: req.query.json.clientId,
        clientSecret: req.query.json.clientSecret,
        environment: req.query.json.environment,
        redirectUri: req.query.json.redirectUri
    });

    const authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
    res.send(authUri);
});


/**
 * Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */
app.get('/callback', function(req, res) {

    oauthClient.createToken(req.url)
       .then(function(authResponse) {
             oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
         })
        .catch(function(e) {
             console.error(e);
         });

    res.send('');

});


/**
 * Display the token : CAUTION : JUST for sample purposes
 */
app.get('/retrieveToken', function(req, res) {
    
    res.send("Your intial token has been successfully generated!");
    
    let date_ob = new Date();
    
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
    // current year
    let year = date_ob.getFullYear();
    
    // current hours
    let hours = date_ob.getHours();
    
    // current minutes
    let minutes = date_ob.getMinutes();
    
    // current seconds
    let seconds = date_ob.getSeconds();
    
    let fulldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    
    //display log information
    console.log(fulldate + ' | Initial token : '+ JSON.stringify(oauth2_token_json));
    var jsonContent = JSON.stringify(oauth2_token_json);
    
    fs.writeFile("jsondata/access.json", jsonContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
    
    console.log("************************************************************************************");
    console.log("");    
});


var j = schedule.scheduleJob('*/50 * * * *', function(){
    
    let date_ob = new Date();
    
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
    // current year
    let year = date_ob.getFullYear();
    
    // current hours
    let hours = date_ob.getHours();
    
    // current minutes
    let minutes = date_ob.getMinutes();
    
    // current seconds
    let seconds = date_ob.getSeconds();
    
    let fulldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    
	oauthClient.refresh()
    .then(function(authResponse){
        console.log(fulldate + ' | The Refresh Token is : '+ JSON.stringify(authResponse.getJson()));
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
        var jsonContent = JSON.stringify(oauth2_token_json);

        fs.writeFile("jsondata/access.json", jsonContent, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        });
        
        console.log("************************************************************************************");
        console.log("");
    })
    .catch(function(e) {
        console.error(e);
    });
	
});


/**
 * disconnect ()
 */
app.get('/disconnect', function(req,res){

  console.log('The disconnect called ');
  const authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.OpenId,OAuthClient.scopes.Email],state:'intuit-test'});
  res.redirect(authUri);

});



http.createServer(app).listen(8001, function(){
    console.log("Listening securely on port 8002");
});
