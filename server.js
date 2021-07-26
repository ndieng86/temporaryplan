
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs'
import router from './routes/web.js'
import cookieParser from 'cookie-parser';
import connectFlash from 'connect-flash'
import session from 'express-session'
import passport from 'passport';


const app = express();


//static path
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.renderFile);

app.use(cookieParser('secret'))
//configSeiossion
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:false,
    cookie:{
        maxAge:1000 * 60 * 60 * 24///86400000 1 day,
    }

}))
//Enable Flash Message
app.use(connectFlash())

////route client


///Post new Client

app.use('/', router);
app.use('/routes', router);


/**************************Handle login************************* */

//config passport middleware

app.use(passport.initialize())
app.use(passport.session())



///local running api port number
const PORT = 30006;

app.listen(PORT, ()=>{
    console.log(`ecoute sur le port ${PORT}`);
})