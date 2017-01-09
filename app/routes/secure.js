//Routers for showing pages to the user after logged in
module.exports = function(router, passport){

  //Middleware to check authentication
  router.use(function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/auth');
  });

  router.get('/profile', function(req, res){
    res.render('profile', {user: req.user });
  });

  //Catch all route.
  router.get('/*', function(req, res){
    res.redirect('/profile');
  });

};
