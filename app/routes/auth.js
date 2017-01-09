//Router points to localhost:8080/auth
module.exports = function(router, passport){
  // localhost:8080/auth/
  router.get('/', function(req, res){
    //res.send('Hello again!');
    res.render('index');
  });

  router.get('/signup', function(req, res){
    //Connect the message with flash module in passport config
    res.render('signup', {message: req.flash('signupMessage')});
  });

//Before passportjs Auth
  // app.post('/signup', function(req, res){
  //   var newUser = new User();
	// 	newUser.local.username = req.body.email;
	// 	newUser.local.password = req.body.password;
	// 	newUser.save(function(err){
	// 		if(err)
	// 			throw err;
	// 	});
	// 	res.redirect('/');
	// });


  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    //If there is an error or email already in DB
    failureRedirect: '/signup',
    //Activates the req.flash message
    failureFlash: true
  }));

  router.get('/login', function (req, res){
    res.render('login', {message: req.flash('loginMessage')});
  });

  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  //To be in the profile page, need to pass through Auth Middleware
  // router.get('/profile', isLoggedIn, function(req, res){
  //
  //   res.render('profile', {user: req.user });
  // });

// Route for testing the DB
//   app.get('/:username/:password', function(req, res){
//     var newUser = new User();
//     newUser.local.username = req.params.username;
//     newUser.local.password = req.params.password;
//     console.log(newUser.local.username + " " + newUser.local.password);
//     newUser.save(function(err){
//       if(err)
//         throw err;
//     });
//     res.send("Success!");
//   });

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
// /auth/facebook/callback. The user will click on this route
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed. This route is sent by back by facebook
router.get('/facebook/callback',
  //If success, we go to profile, if not, to root
  passport.authenticate('facebook', { successRedirect: '/profile',
                                      failureRedirect: '/' })
);

//Same route as facebook, we request from google the profile and email.
router.get('/google', passport.authenticate('google', {scope: ['profile','email']}));
router.get('/google/callback',
  passport.authenticate('google', { successRedirect: '/profile', failureRedirect: '/' })
);

//Routes to make the connect buttons on profile page to work, this happens after auth
router.get('/connect/facebook', passport.authorize('facebook', {scope: ['email']}));
router.get('/connect/google', passport.authorize('google', {scope: ['profile','email']}));
router.get('/connect/local', function(req, res){
  res.render('connect-local', {message: req.flash('signupMessage')});
});
router.post('/connect/local', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/connect/local',
  failureFlash: true
}));

//Routes for unlinking accounts from profile page.
router.get('/unlink/facebook', function(req,res){
  var user = req.user;
  //Remove the token that FB uses
  user.facebook.token = null;
  user.save(function(err){
    if(err){
      throw err;
    }
    res.redirect('/profile');
  });
});
router.get('/unlink/local', function(req,res){
  //Since there is no token, just delete the account
  var user = req.user;
  user.local.username = null;
  user.local.password = null;
  user.save(function(err){
    if(err){
      throw err;
    }
    res.redirect('/profile');
  });
});
router.get('/unlink/google', function(req,res){
  var user = req.user;
  //Remove the token that google uses
  user.google.token = null;
  user.save(function(err){
    if(err){
      throw err;
    }
    res.redirect('/profile');
  });
});


router.get('/logout', function(req, res){
  //passport function to log out
  req.logout();
  res.redirect('/');
});

};
