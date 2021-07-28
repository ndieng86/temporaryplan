import express from 'express';

var router = express.Router()
import conn from '../database.js'
import bodyParser from 'body-parser';
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/*************************Home page*************************** */
var uidcontractor;
router.get('/:token', (req, res) => {
    var token=req.params.token;
      let sql= "SELECT  DISTINCT c.uid as uid_city, t.uid as uid_territory, p.uid as uid_province, c.name_fr  as city_name, t.name_fr as territory_name, p.name_fr as province_name, t.area_code as area_code FROM sr_city c INNER JOIN sr_territory t ON t.uid = c.uid_territory INNER JOIN sr_province p ON p.uid = t.uid_province  WHERE c.active = 'yes'    group BY t.uid; select uid as uidcontractor,token,contact_firstname,contact_lastname from  sr_contractor     where token='"+token+"';select cont.uid, cont.token, contserv.uid_contractor, contserv.uid_service, contserv.approved ,serv.uid, serv.name_fr as service from sr_contractor_service contserv inner join sr_service serv on contserv.uid_service = serv.uid inner join sr_contractor cont on contserv.uid_contractor = cont.uid  where cont.token ='"+token+"';select subplan.uid, subplan.name_fr as forfait, subcont.uid_contractor,subcont.uid_territory,sr_territory.uid, sr_territory.name_fr as territoire ,subcont.uid_subscription_plan,subcont.uid as uidsubscont, contserv.uid_contractor, contserv.uid_service, serv.uid, serv.name_fr, cont.uid, cont.token from sr_subscription_contractor subcont inner join sr_subscription_plan subplan on subcont.uid_subscription_plan=subplan.uid inner join sr_contractor_service contserv on subcont.uid_contractor = contserv.uid_contractor inner join sr_service serv on contserv.uid_Service= serv.uid inner join sr_contractor cont on subcont.uid_contractor = cont.uid inner join sr_territory  on subcont.uid_territory =sr_territory.uid where cont.token='"+token+"'";
      conn.query(sql,[4,3,2,1],(err, result, field) =>{
        if (err) throw err;
        res.render('index', { territoires:result[0], subscription:result[1], services:result[2],listContrat:result[3] })
    })

  })
  /*********************************************************** */
 /* router.get('/showContract/:uidcontractor',(req,res)=>{
    var uidcontractor=req.query.uidcontractor;
    let sql=""
    console.log(sql)
    conn.query(sql,(err, result, field) =>{
      if (err) throw err;
      console.log(result)
      res.json({ listContrat:result})
  })
  })*/
  /*********************** listing plan************************ */
  router.get('/handleterritory/:territoire', (req, res) => {
    var service = req.query.service;
    console.log(service)
    var territoire = req.query.territoire;
    let sql = " select subcont.uid_subscription_plan,subcont.uid_contractor , subcont_terr.uid_territory, subcont_terr.uid_subscription_contractor,  subplan.uid, subplan.name_fr as forfait,subcont.active , contserv.uid_contractor, contserv.uid_service, serv.uid, serv.name_fr as service from sr_subscription_contractor subcont  inner join sr_subscription_plan subplan on  subcont.uid_subscription_plan = subplan.uid  inner join sr_subscription_contractor_territory subcont_terr on subcont_terr.uid_subscription_contractor = subcont.uid inner join sr_contractor_service contserv on subcont.uid_contractor = contserv.uid_contractor inner join sr_service serv on contserv.uid_service = serv.uid where  subcont.active='yes'   AND contserv.uid_service ='"+service+"' AND   subcont_terr.uid_territory ='"+territoire+"';"
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        res.send({terr_avalaible:result})
    });

  })
/***************************croissant plan choose*************************** */
  router.post('/handleCroissant/:uidcontractor', (req, res)=>{
    var uidcontractor=req.body.uidcontractor;
    var territoire = req.body.territoire;
    console.log(uidcontractor)
    let sql = "INSERT INTO sr_subscription_contractor (uid_contractor,active, uid_subscription_plan, uid_territory,renew, price)  values ('" + uidcontractor + "','yes','" + 3+ "','" + territoire + "', 'yes','"+100+"');"
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        console.log(result)
        res.redirect('index')
    });
  })
  router.post('/handleOr/:uidcontractor', (req, res)=>{
    var uidcontractor=req.body.uidcontractor;
    var territoire = req.body.territoire;
    console.log(uidcontractor)
    let sql = "INSERT INTO sr_subscription_contractor (uid_contractor,active, uid_subscription_plan, uid_territory,renew, price)  values ('" + uidcontractor + "','yes','" + 4+ "','" + territoire + "', 'yes','"+250+"');"
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        console.log(result)
        res.json({ contractor:result})
    });
  })
  router.post('/handlePlatine/:uidcontractor', (req, res)=>{
    var uidcontractor=req.body.uidcontractor;
    var territoire = req.body.territoire;
    console.log(uidcontractor)
    let sql = "INSERT INTO sr_subscription_contractor (uid_contractor,active, uid_subscription_plan, uid_territory,renew, price)  values ('" + uidcontractor + "','yes','" +9+ "','" + territoire + "', 'yes','"+500+"');"
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        console.log(result)
        res.json({ contractor:result})
    });
  })

  


 /* 
router.get('/readexpert', (req, res) => {
    
  var uidTerritory = req.query.uid_territory
  console.log(uidTerritory)
  var service = req.query.service;
  console.log(service)
  var forfait = req.query.forfait
let sql ="select DISTINCT terr.uid , terr.area_code, terr.name_fr as territory_name, cont.uid as uidExpert, subcont_terr.uid_territory, subcont_terr.uid_subscription_contractor , subcont.uid, subcont.uid_subscription_plan, subcont.paid, subcont.active, subcont.uid_contractor ,subcont.start_date as start , subcont.end_date as end, subplan.uid, subplan.name_fr as forfait,subplan.month_price ,contserv.uid_contractor, contserv.uid_service, serv.uid, serv.name_fr as service from sr_territory terr inner join sr_contractor cont ON cont.uid_territory =cont.uid_territory inner join sr_subscription_contractor_territory subcont_terr ON terr.uid = subcont_terr.uid_territory inner join sr_subscription_contractor subcont ON subcont_terr.uid_subscription_contractor = subcont.uid inner join sr_subscription_plan subplan ON subcont.uid_subscription_plan = subplan.uid inner join sr_contractor_service contserv on subcont.uid_contractor = contserv.uid_contractor INNER join sr_service serv on contserv.uid_service = serv.uid inner join sr_city ct on terr.uid=ct.uid_territory where (terr.uid ='"+uidTerritory+"' OR  '"+uidTerritory+"' = '' ) AND (serv.uid = '"+service+"' OR '"+service+"' = '') AND (subplan.uid = '"+forfait+"' OR '"+forfait+"' = '') GROUP BY  subcont.uid_contractor "
console.log(sql)
conn.query(sql,(err, result, field) =>{
    if (err) throw err;
    console.log(result)
    res.json({datafilter:result})
});
  

})*/


  export default router;