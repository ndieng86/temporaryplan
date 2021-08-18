import express from 'express';

import conn from '../database.js'
import bodyParser from 'body-parser';
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

    router.get('/:token',(req,res) => {
        let token = req.params.token;
       
        conn.getConnection(function(err, connection) {
            try {
                let sql="select cont.token,cont.uid, contserv.uid_contractor, contserv.uid_service from sr_contractor_service contserv inner join sr_contractor cont on contserv.uid_contractor = cont.uid where cont.token='"+token+"';"
                  
                conn.query(sql,function(err,results) {
                    if (err) throw err;

                    if(results[0]?.uid_service==1 || results[0]?.uid_service==12)
                    {
                        res.render('courtier_immoblier')
                    }
                    else if(results[0]?.uid_service==2 || results[0]?.uid_service==26)
                    {
                     res.redirect('courtier_hypothecaire')
                    }
                    else if(results[0]?.uid_service==4)
                    {
                        res.render('inspecteur_batimat')
                    }
                    else if(results[0]?.uid_service==15 || results[0]?.uid_service==11 || results[0]?.uid_service==9)
                    {
                        res.render('coutier_assurance')
                    }  
                    else{
                        res.render('404')
                    }
               })
            } catch (error) {
              if(error) throw error
            }
            finally{
              connection.release()
            }
          })
    })
   

    


  export default router;