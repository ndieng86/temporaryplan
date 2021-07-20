import conn from '../configs/connectDB.js';
let getHomePage = async (req, res) => {
    let sql = "select * from sr_client    order by uid DESC limit 70 ";
    conn.query(sql,(err, result, field) =>{
        if (err) throw err;
        return res.render('homepage', { clients:result, user:req.firstname})
    });
   
}
export {getHomePage};