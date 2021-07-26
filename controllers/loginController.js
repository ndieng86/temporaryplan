let getLoginPage = (req,res) => {
    return res.render('index');
};

/*
let checkLoggedOut = (req,res,next) => {
    if(req.isAuthenticated()){
        res.redirect('/')
    }
    next();
}

let checkLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        return res.redirect('/clients');
        next();
    };
   
}
let postlogOut = (req,res) => {
    req.session.destroy(function(err){
        return res.redirect('/')
    });
}*/

export {getLoginPage}