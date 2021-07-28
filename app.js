/*******Call Dependencies and others */

/*ES Modules Format*/import express from 'express';

///CommonJS format///*/const express = require('express');

const app = express();

/*ES Modules Format*/ import bodyParser from 'body-parser';

///Commonjs Format //var bodyParser = require('body-parser');

/*ES Modules Format */import mysql from 'mysql'

///CommonJS Format /// const mysql = require ('mysql')

/*ES Modules Format */import ejs from 'ejs'

import router from './routes/xpert.js'
import cors from 'cors';


app.use(cors());
//static path
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.renderFile);





////route client


///Post new Client

app.use('/', router);
app.use('/xpert', router);





///local running api port number
const PORT = 3022;

app.listen(PORT, ()=>{
    console.log(`ecoute sur le port ${PORT}`);
})