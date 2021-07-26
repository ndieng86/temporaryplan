import express from 'express';

var router = express.Router()
import conn from '../database.js'
import bodyParser from 'body-parser';
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var token;
router.get('/:token', (req, res) => {
    token=req.params.token;
    let sql = "SELECT  DISTINCT c.uid as uid_city, t.uid as uid_territory, p.uid as uid_province, c.name_fr  as city_name, t.name_fr as territory_name, p.name_fr as province_name, t.area_code as area_code FROM sr_city c INNER JOIN sr_territory t ON t.uid = c.uid_territory INNER JOIN sr_province p ON p.uid = t.uid_province  WHERE c.active = 'yes'    group BY t.uid;SELECT name_fr, uid FROM sr_subscription_plan; select cont.uid as uid_contractor,cont.token, subcont.uid from sr_subscription_contractor subcont inner join sr_contractor cont on subcont.uid_contractor = cont.uid    where token='"+token+"';";
    conn.query(sql,[3,2,1],(err, result, field) =>{
        if (err) throw err;
        console.log(result[2][0].uid_contractor)
        res.render('index', { territoires:result[0],forfaits :result[1], subscription:result[2]})
    });

  })
  router.post('/handleCroissant/:uidcontractor', (req, res)=>{
    var uidcontractor=req.body.uidcontractor;
    console.log(uidcontractor)
   var sql = "UPDATE sr_subscription_contractor SET uid_contractor='"+uidcontractor+"', uid_subscription_plan ='"+3+"' where uid_contractor ='"+uidcontractor+"';"
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        console.log(result)
        res.json({ contractor:result})
    });
  })

  router.post('/plan', (req, res) => {

    let sql = "SELECT name_fr, uid FROM sr_subscription_plan;select * from sr_contractor "
    conn.query(sql,[2,1],(err, result, field) =>{
        if (err) throw err;
        res.render('plan', { forfaits :result[0]})
    });

  })
  router.get('/handleterritory', (req, res) => {
    var uid = req.query.territoire;
    console.log(uid)
    let sql = " select subcont.uid_subscription_plan,subcont.uid_contractor , subcont_terr.uid_territory, subcont_terr.uid_subscription_contractor,  subplan.uid, subplan.name_fr as forfait,subcont.active , contserv.uid_contractor, contserv.uid_service, serv.uid, serv.name_fr as service from sr_subscription_contractor subcont  inner join sr_subscription_plan subplan on  subcont.uid_subscription_plan = subplan.uid  inner join sr_subscription_contractor_territory subcont_terr on subcont_terr.uid_subscription_contractor = subcont.uid inner join sr_contractor_service contserv on subcont.uid_contractor = contserv.uid_contractor inner join sr_service serv on contserv.uid_service = serv.uid where  subcont.active='yes'   AND contserv.uid_service ='1' AND   subcont_terr.uid_territory ='"+uid+"';"
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        console.log(result)
        res.json({terr_avalaible:result})
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