var http = require('http'),
  port = process.env.PORT || 8000,
  request = require('request'),
  qs = require('querystring'),
  util = require('util'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  cookieSession = require('cookie-session'),  //creating a cookie session to persist the oauth information
  express = require('express'),
  app = express(),
  QuickBooks = require('node-quickbooks-oauth2'),
  OAuthClient = require('intuit-oauth');
  config = require('../config'),
  miscFunctions = require("./miscFunctions.js"),
  plotly = require('plotly')(config.username, config.api_keys)

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



// Generic Express config
app.set('port', port)
app.set('views', './views')
app.set('routes', './routes')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser('brad'))
app.use(cookieSession({ name: 'session', keys: ['key1'] }))
app.use(express.static(__dirname + '/public'));

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

// INSERT YOUR CONSUMER_KEY AND CONSUMER_SECRET HERE

var consumerKey = config.consumerKey,
  consumerSecret = config.consumerSecret

// Global Vars
var sessionSet = false;

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


//Simple route which redirects / to /start
app.get('/', function (req, res) {
  res.redirect('/start');
})

//This route is the start of the application, it checks to see if there is a session, if no session set, it will render the login page
app.get('/start', function (req, res) {
  if (sessionSet) {
    //If a session has been set, this identifies that the user has logged in, will render the home.ejs view
    res.render('home.html');


  } else {
    //If no session has been set, will render the start page to initiate login
    res.render('intuit.html', { locals: { port: port, appCenter: QuickBooks.APP_CENTER_BASE } })
  }

})


/**
 * Get the AuthorizeUri
 */
app.get('/requestToken', urlencodedParser, function(req,res) {

    oauthClient = new OAuthClient({
        clientId: req.query.json.clientId,
        clientSecret: req.query.json.clientSecret,
        environment: req.query.json.environment,
        redirectUri: req.query.json.redirectUri
    });
    
    const authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
    
    var postBody = {
        url: authUri,
        oauth: {
          callback: req.query.json.redirectUri,
          consumer_key: req.query.json.clientId,
          consumer_secret: req.query.json.clientSecret
        }
    };
    
    
    request.post(postBody, function (e, r, data) {
        var requestToken = qs.parse(data)
        
        console.log(requestToken);
        
        req.session.oauth_token_secret = auth.oauth_token_secret
        res.redirect(QuickBooks.APP_CENTER_URL + oauth2_token_json)
    });
    
    
    // res.send(authUri);
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
    res.send(oauth2_token_json);
});


/**
 * Refresh the access-token
 */
app.get('/refreshAccessToken', function(req,res){

    oauthClient.refresh()
        .then(function(authResponse){
            console.log('The Refresh Token is  '+ JSON.stringify(authResponse.getJson()));
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
            res.send(oauth2_token_json);
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

//This route will take the Request Token and Initiate the User Authentication
app.get('/requestToken', function (req, res) {
  var postBody = {
    url: QuickBooks.REQUEST_TOKEN_URL,
    oauth: {
      callback: 'http://renoquotes.com:' + port + '/callback/',
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    }
  }
  request.post(postBody, function (e, r, data) {
    var requestToken = qs.parse(data)
    req.session.oauth_token_secret = requestToken.oauth_token_secret
    console.log(requestToken)
    res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token)
  })
})

//Access Token request followed by the Access Token response
app.get('/callback', function (req, res) {
    
  var postBody = {
    url: authUri,
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: req.query.oauth_token,
      token_secret: req.session.oauth_token_secret,
      verifier: req.query.oauth_verifier,
      realmId: req.query.realmId
    }
  }
  
  request.post(postBody, function (e, r, data) {
    var accessToken = qs.parse(data)
    console.log(accessToken)
    console.log(postBody.oauth.realmId)

    //The Access Token is stored in req.session.qbo
    req.session.qbo = {
      token: accessToken.oauth_token,
      secret: accessToken.oauth_token_secret,
      companyid: postBody.oauth.realmId,
      consumerkey: consumerKey,
      consumersecret: consumerSecret
    };

    //Call getQbo to create a QBO object in order to make QBO requests
    qbo = miscFunctions.getQbo(QuickBooks, req.session.qbo);

    //Include the routes.js file, the qbo object is passed into the this file
    var router = require('./routes/routes.js')(app, qbo, plotly);

  })

  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
  sessionSet = true;
})

// Error Handling
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
});

module.exports = app;