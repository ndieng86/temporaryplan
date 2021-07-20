

import passport from 'passport'
import  '../services/loginService.js'
import flash from  'connect-flash';
import    passportLocal from 'passport-local'
import session from 'express-session'
let LocalStrategy = passportLocal.Strategy

let initPassportLocal = ()=>{
    passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },

    async (req, email, password,done)=>{
        try {
            let user = await loginService.findUserByEmail(email);
            if(!user){
                return done(null, false, req.flash("errors", `Aucun compte n'est associé a ce courriel - "${email}"`))
            }
            if(user){
                //compare password
                let match = await loginService.comparePasswordUser(user, password)
                if(match===true){
                    return done(null, user, null);
                }else{
                    return done(null, false, req.flash("errors", match))
                }
            }
            
        } catch (e) {
            return done(null,false, e)
        }
    }))
}

passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser((id, done)=>{
    loginService.findUserById(id).then((user)=>{
        return done(null, user);
    }).catch(error=>{
        return done(error, null)
    })
})



export {initPassportLocal} 