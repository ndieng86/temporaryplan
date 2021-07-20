import conn from '../configs/connectDB.js';
import bcrypt from 'bcryptjs'

let handleLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        //check email is exist or not
        let user = await findUserByEmail(email);
        if (user) {
            //compare password
            await bcrypt.compare(password, user.password).then((isMatch) => {
                if (isMatch) {
                    resolve(true);
                } else {
                    reject(`The password that you've entered is incorrect`);
                }
            });
        } else {
            reject(`This user email "${email}" doesn't exist`);
        }
    });
};



let findUserByEmail =(email)=>{
    return new Promise(((resolve,reject)=>{
        try {
            conn.query("select * FROM sn_users where email=?", email,(error, rows)=>{
                if(err){
                    reject(error)
                }
                let user = rows[0];
                resolve(user);
            })
        } catch (e) {
            reject(e)
        }
    }))
};



let findUserById = (id)=>{
    return new Promise((resolve,reject)=>{
        try {
            conn.query("SELECT * from sn_users where id=?",id, (error, rows)=>{
                if(error) reject(error)
                let user = rows[0];
                resolve(user)
            })
        } catch (e) {
            reject(e)
        }
    })

}
let comparePasswordUser = (user, password)=>{
    return new Promise( async(resolve,reject)=>{
        try {
            let isMatch = await bcrypt.compare(password, user.password)
            if(isMatch) resolve (true)
            resolve("Le mot de passe  saisi est incorrect")
        } catch (e) {
            reject(e)
        }
    })
}

export{
    handleLogin,
    findUserByEmail,
    findUserById,
    comparePasswordUser
};