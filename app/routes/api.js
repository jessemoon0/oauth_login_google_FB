var fs = require('fs');
module.exports = function(router, passport){

  //Token auth
  router.use(passport.authenticate('bearer', {session: false}));

  //Save the token in a file
  router.use(function(req, res, next){
    fs.appendFile('logs.txt', req.path + " token: " + req.query.access_token + "\n", function(err){
      next();
    });
  });

  //Protected by token route
  router.get('/testAPI', function(req, res){
    res.json({SecretData: 'ABC123'});
  });

}
