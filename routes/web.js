
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });
import express from 'express';
import passport from 'passport'
import passportAuth from '../configs/passportAut.js';

import bodyParser from 'body-parser';
import  conn from '../configs/connectDB.js'
//import authValidation from '../validation/authValidation'



import flash from  'connect-flash';



passportAuth()


var router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(flash())





router.get('/clients',(req,res)=>{
  let sql = "select * from sr_client    order by uid DESC limit 70 ";
  conn.query(sql,(err, result, field) =>{
      if (err) throw err;
      return res.render('homepage', { clients:result, user:req.firstname})
  });
}) 

router.get('/',(req,res)=>{
   res.render('login');
})

router.post("/login",passport.authenticate("local",{
successRedirect:"/clients",
failureRedirect:"/",
successFlash:true,
failureFlash:true
}))

router.get('/refresh', (req, res) => {
  let sql = "select * from sr_client    order by uid DESC limit 70 ";
  conn.query(sql,(err, result, field) =>{
      if (err) throw err;
      res.render('index', { clients:result})
  });

})

router.get('/vue_client/:uid', (req, res) => {
     const uid=req.params.uid;
      var sql = "SELECT * FROM sr_client as client WHERE uid ='" + uid+ "';Select sr_address.uid, sr_address.street_no, sr_address.street, sr_address.city, sr_address.province, sr_address.zip ,sr_address.uid_client , cli.uid from sr_address inner join sr_client cli on sr_address.uid_client =cli.uid where sr_address.uid_client = '" + uid+ "';select DISTINCT sr_project.uid as uidproject,sr_project.uid_client, sr_project.uid_service, sr_project.uid_address,  sr_project.description,sr_project.lead_price, sr_project.active_date, sr_project.status, sr_project.max_quotes, sr_client.uid,sr_client.firstname,sr_client.lastname, sr_client.lang, sr_client.email, sr_address.uid, sr_address.street_no,sr_address.street,sr_address.city, sr_address.province,sr_address.zip,sr_address.phone1, sr_service.uid, name_fr as service from sr_project  inner join sr_client  on sr_project.uid_client = sr_client.uid  inner join sr_address on sr_project.uid_address =sr_address.uid inner join sr_service on sr_project.uid_service =sr_service.uid where sr_project.uid_client='"+uid+"';";
        conn.query(sql,[3,2,1], function(err, result, fields) {
            if (err) throw err;
            res.render('vue_client', { unikClient: result[0], Unikclient_Addres:result[1],projectByClient:result[2]})
        

        })   

})

let clientID_Inserted;
//////Poster un nouveau Client
router.post('/create', function(req, res, next) {
        // Get all the client input data
        var post = req.body;
        var firstname=post.firstname
        var lastname=post.lastname
        var gender =post.gender
        var email =post.email 
        var email2 = post.email2  
        var lang=post.lang
        var languages=post.languages
        var to_qualify=post.to_qualify
    // insert client data into sr_client table
    var sql = "INSERT INTO sr_client(firstname,lastname,gender,email,email2,lang,languages, to_qualify) VALUES ('" + firstname + "','" + lastname + "','" + gender + "','" + email + "','"+email2+"','" + lang + "','" + languages+"','" + to_qualify+"');";
        console.log(sql)

    conn.query(sql, function (err, result) {
        if (err) throw err;
        clientID_Inserted = result.insertId;
        let sql2="select * from sr_client where uid='"+clientID_Inserted+"';";
        conn.query(sql2, function (err, result2) {
          if (err) throw err;
          console.log(clientID_Inserted)
          console.log(result2)
          res.json({client: clientID_Inserted, infoClient:result2});
      });
    });




   // redirect to client form page after inserting the data

  });
//   router.get('/client/:id', function(req, res, next) {
//     var id= clientID_Inserted;
//     var sql = "SELECT * FROM sr_client as client where uid ='" + id+ "';";
//     conn.query(sql,function(err, result, fields) {
//       if (err) throw err;
//         res.render('client/'+id,{ client: result});

//   })
// });

    router.get('/ReadClient/', (req, res) => {
        var recherche=req.query.client


        var sql = "SELECT * FROM sr_client  WHERE uid = '" + recherche+ "';";
        conn.query(sql,function(err, result, fields) {
            if (err) throw err;
            console.log(result)
              res.send({ infoclient: result});

        })

    })
    router.get('/new_client', (req, res) => {

      let sql = "SELECT name_fr,uid  FROM sr_service ; SELECT uid, code_prov FROM sr_province; SELECT  DISTINCT c.uid as uid_city, t.uid as uid_territory, p.uid as uid_province, c.name_fr  as city_name, t.name_fr as territory_name, p.name_fr as province_name, t.area_code as area_code FROM sr_city c INNER JOIN sr_territory t ON t.uid = c.uid_territory INNER JOIN sr_province p ON p.uid = t.uid_province  WHERE c.active = 'yes'    ORDER BY city_name ASC;select * from sr_address where uid_client ='" + clientID_Inserted+ "';select DISTINCT status from sr_project status  group by status";
      conn.query(sql,[5,4,3, 2, 1],(err, result, field) =>{
          if (err) throw err;
          res.render('new_client', { services: result[0], provinces:result[1], territoires :result[2], infoAddress:result[3], projects:result[4]})
      });

    })



  //Insert Client Addres into sr_address
  router.post('/createAddress', function(req, res, next) {
    // Get all the client input data
    var post = req.body;
    var uidClient = req.body.uid_client
    var phone1=post.phone1
    var phone2=post.phone2
    var phone3=post.phone3
    var street_no =post.street_no
    var street =post.street
    var city=post.city
    var uid_city=post.uid_city
    var province=post.province
    var zipcode=post.zipcode
   var sql = "INSERT INTO sr_address(phone1,phone2,phone3,street_no,street,city, uid_city,province,zip, uid_client) VALUES ('" + phone1 + "','" + phone2 + "','" + phone3+ "','" + street_no + "','" + street + "','" + city + "','" + uid_city+"','" + province+"','" + zipcode+"','"+uidClient+"');"
// insert client data into sr_client table
conn.query( sql,function (err, result) {
    if (err) throw err;
    console.log(result)
    var uid=result.insertId;
    var sql2 = "select ad.uid as uid_address , ad.uid_client, ad.uid_city, ad.street_no, ad.street, ad.city, ad.phone1, ad.phone2, ad.phone3,ad.province, ad.zip, cli.uid , ct.uid, ct.name_fr as zone from sr_address ad inner join sr_client cli on ad.uid_client=cli.uid  inner join sr_city ct on ad.uid_city =ct.uid where ad.uid = '" + uid+ "';";
    conn.query( sql2,function (err, result) {
      if (err) throw err;
      res.json({Address:result});
  });
});


});


 
   var uid;
    router.get('/edit_Client/:uid',function(req,res){
       uid=req.params.uid;
      console.log(uid)
      let sql = "SELECT *  FROM sr_client where uid ='" + uid+ "'; select uid as uid_province,code_prov    from sr_province ;SELECT  DISTINCT c.uid as uid_city, t.uid as uid_territory, p.uid uid_province, c.name_fr  as city_name, t.name_fr as territory_name, p.name_fr as province_name, t.area_code as area_code FROM sr_city c INNER JOIN sr_territory t ON t.uid = c.uid_territory INNER JOIN sr_province p ON p.uid = t.uid_province  WHERE c.active = 'yes'    ORDER BY city_name ASC ; select * from sr_address where uid_client ='"+uid+"'"
      conn.query(sql,[4,3,2,1],(err, result, field) =>{
          if (err) throw err;
          res.render('edit_Client', {  infoClient:result[0], provinces:result[1], territoires:result[2],adresses :result[3] })
      });

    });
    router.post('/edit_Client/:uid',function(req,res){      
      console.log(uid)
      var firstname = req.body.firstname
      var lastname = req.body.lastname
      var gender = req.body.gender
      var email = req.body.email
      var email2 = req.body.email2
      var lang = req.body.lang
      var languages = req.body.languages
      var to_qualify=req.body.to_qualify
      
      let sql = "Update sr_client SET  firstname ='" + firstname+ "', lastname='" + lastname+ "', gender ='" + gender+ "', email ='" + email+ "', lang ='" + lang+ "', languages ='" + languages+ "',email2 ='" + email2+ "',to_qualify='"+to_qualify+"' where uid ='" + uid+ "'";
      conn.query(sql,(err, result, field) =>{
          if (err) throw err;
          res.json({client:result})
      });

    });
    router.get('/ReadAddress/', (req,res)=>{
      var uid=req.query.client
      console.log(uid)
      let sql = "SELECT sr_address.uid_client , sr_address.uid_city,sr_address.city, sr_address.zip, sr_address.street_no, sr_address.street, sr_address.province, sr_address.phone1, sr_address.phone2, sr_address.phone3, ct.uid from sr_address inner join sr_city ct on sr_address.uid_city = ct.uid  WHERE sr_address.uid_client = '" +uid+ "';"
          conn.query(sql,(err, result, field) =>{
            if (err) throw err;
            console.log(result)
            res.json({infoAddress:result} )
        });
    })
    router.post('/editAddress/:uid',function(req,res){      
      console.log(uid)
      var phone1=req.body.phone1
      var phone2=req.body.phone2
      var phone3=req.body.phone3
      var street_no =req.body.street_no
      var street =req.body.street
      var city=req.body.city
      var uid_city=req.body.uid_city
      var province=req.body.province
      var zip=req.body.zip
      
      let sql = "Update sr_address SET  phone1 ='" + phone1+ "', phone2='" + phone2+ "', phone3 ='" + phone3+ "', street_no ='" + street_no+ "', street ='" + street+ "', city ='" + city+ "',uid_city ='" + uid_city+ "',province='"+province+"',zip='"+zip+"' where uid_client ='" + uid+ "'";
      conn.query(sql,(err, result, field) =>{
          if (err) throw err;
          console.log(result)
          
          let sql2="select sr_project.uid_client,sr_project.max_quotes, sr_project.uid_service, sr_project.uid_address, sr_project.uid_address, sr_project.description,sr_project.lead_price, sr_project.active_date, sr_project.status, sr_client.uid, sr_address.uid, sr_service.uid, name_fr as service from sr_project  inner join sr_client  on sr_project.uid_client = sr_client.uid  inner join sr_address on sr_project.uid_address =sr_address.uid inner join sr_service on sr_project.uid_service =sr_service.uid where sr_project.uid_client='"+uid+"';"
          conn.query(sql2,(err, result2, field) =>{
            if (err) throw err;
            console.log(result2)
            res.json({projecInfos:result2} )
        });
         
      });

    });
   
   router.get('/projects', (req, res)=>{
      let sql="SELECT p.status, p.uid as uidproject,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client as uidclient,sr_address.uid_client , p.description,cli.uid as uidclient, cli.firstname, cli.lastname, cli.lang, cli.email, sr_address.street_no, sr_address.street, sr_address.city, sr_address.province, sr_address.zip, sr_address.uid  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client   where p.status ='new' order by p.uid_client DESC limit 150;"
      conn.query(sql,function(err,result) {
            if (err) throw err;
            res.render('projects' , ({projects:result}))
        })
    })
    router.get('/projects/:uid', (req, res)=>{
      var uid = req.params.uid_project
      let sql="SELECT p.status, p.uid as id_project,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client,sr_address.uid_client , p.description,cli.uid, cli.firstname, cli.lastname, cli.lang, cli.email, cli.uid, sr_address.street_no, sr_address.street, sr_address.city, sr_address.province, sr_address.zip, sr_address.uid  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client   where p.status ='new' order by p.uid_client DESC limit 10;"
      conn.query(sql,function(err,result) {
            if (err) throw err;
            res.render('projects' , ({projects:result}))
        })
    })
    //insert project Infos into sr_project
    router.post('/createProject', function(req, res, next) {
      // Get all the client input data
        var uid_client = req.body.uid_client
        var uid_service=req.body.uid_service
        var description=req.body.description
        var lead_price = req.body.lead_price
        var status=req.body.status
        var active_date=req.body.active_date
        var max_quotes=req.body.max_quotes
        var uid_address=req.body.uid_address
        var uidpipedrive = req.body.uidpipedrive

 // redirect to client form page after inserting the data
       let sql = "INSERT INTO sr_project (uid_client, uid_service, description, status, active_date, max_quotes, uid_address,lead_price,uid_deal_pipedrive)  values ('" + uid_client + "','" + uid_service + "','" + description+ "','" + status + "','" + active_date + "','" + max_quotes+"','" + uid_address +"','" + lead_price+"','"+uidpipedrive+"');"
         
      conn.query(sql,function(err,result) {
            if (err) throw err;
            console.log(result)
            let sql2="select DISTINCT sr_project.uid_client, sr_project.uid_service,sr_project.uid_deal_pipedrive as uidpipedrive, sr_project.uid_address,  sr_project.description,sr_project.lead_price, sr_project.active_date, sr_project.status, sr_project.max_quotes, sr_client.uid, sr_address.uid, sr_service.uid, name_fr as service, sr_service.active from sr_project  inner join sr_client  on sr_project.uid_client = sr_client.uid  inner join sr_address on sr_project.uid_address =sr_address.uid inner join sr_service on sr_project.uid_service =sr_service.uid where sr_project.uid_client='"+uid_client+"' AND  sr_service.active='yes';"
            conn.query(sql2,function(err,result2) {
              console.log(result2)
            res.json({projet:result2})
          })
        })
  });

  
  /////Editer un 

   router.get('/search',function(req,res){
    let sql = 'select ad.uid, ad.uid_client,ad.zip, ad.street_no, ad.street, ad.phone1,ad.phone2,ad.phone3, ad.city,ad.province, cli.uid, cli.firstname, cli.lastname ,cli.email from sr_address ad INNER JOIN sr_client cli ON ad.uid_client = cli.uid  where ad.zip  like "%'+req.query.key+'%"  OR  cli.email  like "%'+req.query.key+'%" OR cli.firstname like "%'+req.query.key+'%" OR cli.lastname like "%'+req.query.key+'%" OR cli.uid like "%'+req.query.key+'%" OR ad.zip like "%'+req.query.key+'%" OR ad.phone1 = "'+req.query.key+'%" OR ad.phone2 = "'+req.query.key+'" OR ad.phone3 = "'+req.query.key+'";'
    console.log(sql)
    conn.query(sql,function(err, rows, fields) {
          if (err) throw err;
          console.log(rows)
        var data=[];
        var uid=0;
        for(var i=0;i<rows.length;i++)
          {
            data.push(`${rows[i].firstname} ${rows[i].lastname}`);

          }
          res.end(JSON.stringify(data));
        });

    });
    router.get('/research',function(req,res){ 
      var searchVal=req.query.searchVal;
      console.log(searchVal)
      let sql = "select cli.uid,cli.firstname, cli.to_qualify, cli.lastname, cli.email,cli.lang, sr_address.uid_client, sr_address.zip, sr_address.phone1,sr_address.phone2, sr_address.phone3   from sr_client cli inner join sr_address  on cli.uid = sr_address.uid_client   where CONCAT(cli.firstname,' ', cli.lastname) ='"+searchVal+"' OR cli.uid ='"+searchVal+"' OR cli.email='"+searchVal+"' OR sr_address.zip='"+searchVal+"' OR sr_address.phone1='"+searchVal+"' OR sr_address.phone1='"+searchVal+"' OR sr_address.phone2='"+searchVal+"' OR sr_address.phone3='"+searchVal+"' AND cli.to_qualify='yes';"
      console.log(sql)
      conn.query(sql,function(err, result, fields) {
          console.log(result)
            res.json({Oneclient:result});
          });
  
      });
      router.get('/searchproject',function(req,res){ 
        var searchVal=req.query.searchVal;
        console.log(searchVal)
        let sql ="SELECT p.status, p.uid as uidproject,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client as uidclient,sr_address.uid_client , p.description,cli.uid, cli.firstname, cli.lastname, cli.lang, cli.email, cli.uid, sr_address.street_no, sr_address.street, sr_address.city, sr_address.province, sr_address.zip, sr_address.uid  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client   where p.status ='new' order by p.uid_client DESC limit 50;"
       //let sql="SELECT p.status, p.uid as uidproject,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client,sr_address.uid_client , p.description,cli.uid as uidclient, cli.firstname, cli.lastname, cli.lang, cli.email, cli.uid, sr_address.street_no, sr_address.street, sr_address.city, sr_address.province, sr_address.zip, sr_address.uid, sr_address.phone1, sr_address.phone2, sr_address.phone3  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client where CONCAT(cli.firstname,' ', cli.lastname) ='"+searchVal+"' OR cli.uid ='"+searchVal+"' OR p.uid ='"+searchVal+"' OR cli.email='"+searchVal+"' OR sr_address.zip='"+searchVal+"' OR sr_address.phone1='"+searchVal+"' OR sr_address.phone1='"+searchVal+"' OR sr_address.phone2='"+searchVal+"' OR sr_address.phone3='"+searchVal+"';"
        console.log(sql)
        conn.query(sql,function(err, result, fields) {
            console.log(result)
              res.json({unikproject:result});
            });
    
        });
        router.get('/resetProj',(req,res)=>{
          console.log("test")
          let sql="SELECT p.status, p.uid as uidproject,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client,sr_address.uid_client , p.description,cli.uid as uidclient, cli.firstname, cli.lastname, cli.lang, cli.email, cli.uid, sr_address.street_no, sr_address.street, sr_address.city, sr_address.province, sr_address.zip, sr_address.uid  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client   where p.status ='new' order by p.uid_client DESC limit 50;"
        console.log(sql)
        conn.query(sql,function(err, result, fields) {
            console.log(result)
              res.json({projects:result});
            });
        })
        router.get('/resetclients',(req,res)=>{
          console.log("test")
          let sql = "select * from sr_client    order by uid DESC limit 70 ";
        conn.query(sql,function(err, result, fields) {
            console.log(result)
              res.json({listclient:result});
            });
        })
    
    

   


   
   
    /******vue projet */

    router.get('/vue_project/:uid', (req,res)=>{
      var uid=req.params.uid;
      let sql="SELECT p.uid_deal_pipedrive,p.active_date,p.lead_price, p.max_quotes,p.uid_service,p.status, p.uid as uidproject,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client,sr_address.uid_client , p.description,cli.uid as uidclient, cli.firstname, cli.lastname, cli.lang, cli.email,cli.lang,  sr_address.street_no, sr_address.street, sr_address.city,sr_address.phone1, sr_address.province, sr_address.zip, sr_address.uid  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client   where p.uid='"+uid+"';" ;
      console.log(sql)
      conn.query(sql,function(err, result, fields) {
        if(err) throw err
        console.log(result)
        res.render('vue_project', {unickproject:result})
        });
    })
 
  
    router.get('/editProject/:uid', (req,res)=>{
      var uid=req.params.uid;
      console.log(uid)
      let sql="SELECT p.uid_address,p.uid_deal_pipedrive,p.active_date,p.lead_price, p.max_quotes,p.uid_service,p.status, p.uid as uidproject,cli.to_qualify as qualify,p.best_contact_way as contact, p.uid_address,p.uid_client,sr_address.uid_client , p.description,cli.uid as uidclient, cli.firstname, cli.lastname, cli.lang, cli.email,cli.lang,  sr_address.street_no, sr_address.street, sr_address.city,sr_address.phone1, sr_address.province, sr_address.zip, sr_address.uid  from sr_project p inner join sr_client cli on p.uid_client = cli.uid inner join sr_address  on sr_address.uid_client=p.uid_client   where p.uid='"+uid+"';" ;
      conn.query(sql,(err, result, field) =>{
          if (err) throw err;
          res.render('editProject', {unickproject:result})
      });
    })
    router.post('/EditProject/:uid',function(req,res){      
      var uid_service=req.body.uid_service
      var description=req.body.description
      var lead_price = req.body.lead_price
      var status=req.body.status
      var max_quotes=req.body.max_quotes
      var uid_address=req.body.uid_address
      var uidpipedrive = req.body.uidpipedrive
    
    let sql = "Update sr_project SET  uid_service ='" + uid_service+ "', description='" + description+ "', lead_price ='" + lead_price+ "', status ='" + status+ "', max_quotes ='" + max_quotes+ "',uid_address='"+uid_address+"',uid_deal_pipedrive='"+uidpipedrive+"' where uid_client ='" + uid+ "'";
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
      let sql2="select * from sr_project where uid_client ='"+uid+"';"
      conn.query(sql2,(err, result2, field) =>{
        if (err) throw err;
      console.log(result2)
    });
    });
  
  });
/*********************************************Authentification************************************ */
 

/********************************************Rapports******************************* */
router.get('/Rapports', (req, res) => {

  let sql = " SELECT  DISTINCT t.active, t.uid as uid_territory,t.name_fr as territory_name,  t.area_code as area_code FROM  sr_territory  t   where t.active='yes'  ORDER BY t.area_code ASC;SELECT uid, name_fr, active FROM sr_service where active='yes';SELECT name_fr, uid FROM sr_subscription_plan; "
  conn.query(sql,[3, 2, 1],(err, result, field) =>{
      if (err) throw err;
      res.render('Rapports', { territoires:result[0], services: result[1], forfaits :result[2]})
  });

})


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
    

})






export default router;


