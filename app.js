/*******Call Dependencies and others */

/*ES Modules Format*/import express from 'express';

///CommonJS format///*/const express = require('express');

const app = express();

/*ES Modules Format*/ import bodyParser from 'body-parser';

///Commonjs Format //var bodyParser = require('body-parser');

/*ES Modules Format */import mysql from 'mysql'

///CommonJS Format /// const mysql = require ('mysql')

/*ES Modules Format */import ejs from 'ejs'

import router from './routes/route.js'
import cors from 'cors';

import fs from 'fs'
import https from 'https'
app.use(cors());
//static path
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.renderFile);





////route client


///Post new Client

app.use('/', router);
app.use('/route', router);





///local running api port number
https.createServer({
    key: fs.readFileSync('./SSL/key.pem'),
    cert: fs.readFileSync('./SSL/certificate.pem')
},
app
).listen(30006,(req,res) => {
    console.log('app listen on port 30006')
});
