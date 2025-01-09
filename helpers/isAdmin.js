const verifiAdmin = {
    isAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin == 1) {
            return next();
        } else {
            req.flash('error_msg', 'Você precisa ser um administrador')
            res.redirect('/')
        }
    }
}

export default verifiAdmin.isAdmin