//Passport configuration
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport){

  passport.serializeUser(function(user, done){
  //The callback returns either error or the user ID
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });


  //To sign up a new user.
  passport.use('local-signup', new LocalStrategy({
    //Change the config field properties to our own
    usernameField: 'email', //Because in EJS signup the name="email"
    passwordField: 'password',
    //This allows to put the callback as next parameter
    passReqToCallback: true
  },
  //We pass the arguments to the function to find if user exists
  function(req, email, password, done){
    //Node method to do this task after data comes back (async)
    process.nextTick(function(){
      User.findOne({'local.username': email}, function(err, user){
        if(err){
          return done(err);
        }
        //If there is that email already in DB:
        if(user){
          //We connect the flash module in the routes
          return done(null, false, req.flash('signupMessage', 'That email already taken'));
        }
        //Then create a new user if none exist.
        if(!req.user) {
          var newUser = new User();
          newUser.local.username = email;
          //Make a new encrypted password
          newUser.local.password = newUser.generateHash(password);
          //Save to DB
          newUser.save(function(err){
            if(err){
              throw err;
            }
            return done(null, newUser);
          });
        }
        //If there is a req.user, means user is already logged in, so merged
        else{
          var user = req.user;
          user.local.username = email;
          user.local.password = user.generateHash(password);
          user.save(function(err){
            if(err){
              throw err;
            }
            return done(null, user);
          });
        }
      });
    });
  }
  ));

  //Login Users
  passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, email, password, done){
			process.nextTick(function(){
				User.findOne({ 'local.username': email}, function(err, user){
					if(err)
						return done(err);
					if(!user)
						return done(null, false, req.flash('loginMessage', 'No User found'));
					if(!user.validPassword(password)){
						return done(null, false, req.flash('loginMessage', 'inavalid password'));
					}
					return done(null, user);

				});
			});
		}
	));

  //Facebook login. Copied and adapted from Configuration in passport Guides
  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    profileFields: ['id', 'displayName', 'email'],
    callbackURL: configAuth.facebookAuth.callbackURL,
    passReqToCallback: true
  },
  //In the FB callback, we use the fields in our model
  //See FB API docs to see the information contained on these.
  function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
      //User is not logged in yer, needs authentication.
      if(!req.user){
        User.findOne({'facebook.id': profile.id}, function(err, user){
          if(err)
            return done(err);
          if(user){
            //console.log(profile);
            //Check if token havent been deleted, add it and update everything
            if(!user.facebook.token){
              user.facebook.token = accessToken;
              user.facebook.name = profile.displayName;
              user.facebook.email = profile.emails[0].value;
              user.save(function(err){
                if (err)
                  throw err;
                return done(null, user);
              });
            }
            return done(null, user);
          }
          //No user in DB so we need to create one.
          else{
            var newUser = new User();
            //See FB API docs to see the information contained on the properties.
            newUser.facebook.id = profile.id;
            newUser.facebook.token = accessToken;
            newUser.facebook.name = profile.displayName;
            newUser.facebook.email = profile.emails[0].value;

            newUser.save(function(err){
              if (err)
                throw err;
              return done(null, newUser);
            });
            //console.log(profile);
          }
        });
      }
      //User is already logged in and needs to be merged
      else{
        var user = req.user;
        user.facebook.id = profile.id;
        user.facebook.token = accessToken;
        user.facebook.name = profile.displayName;
        user.facebook.email = profile.emails[0].value;

        user.save(function(err){
          if (err)
            throw err;
          return done(null, user);
        });
      }
    });
  }
  ));



    //Google login. Copied and adapted from Facebook Strategy
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true
      },
      function(req, accessToken, refreshToken, profile, done) {
          process.nextTick(function(){
            if(!req.user){
              User.findOne({'google.id': profile.id}, function(err, user){
                if(err)
                  return done(err);
                if(user){
                  if(!user.google.token){
                    user.google.token = accessToken;
                    user.google.name = profile.displayName;
                    user.google.email = profile.emails[0].value;
                    user.save(function(err){
                      if(err)
                        throw err;
                      return done(null, user);
                    });
                  }
                  return done(null, user);
                }
                else {
                  var newUser = new User();
                  newUser.google.id = profile.id;
                  newUser.google.token = accessToken;
                  newUser.google.name = profile.displayName;
                  newUser.google.email = profile.emails[0].value;
                  newUser.save(function(err){
                    if(err)
                      throw err;
                    return done(null, newUser);
                  });
                }
              });
            }
            else {
              var user = req.user;
              user.google.id = profile.id;
              user.google.token = accessToken;
              user.google.name = profile.displayName;
              user.google.email = profile.emails[0].value;

              user.save(function(err){
                if(err)
                  throw err;
                return done(null, user);
              });
            }

          });
        }

    ));

//Token auth by user ID
passport.use(new BearerStrategy({},
  function(token, done){
    User.findOne({_id: token}, function(err, user){
      if(!user){
        return done(null, false);
      }
      return done(null, user);
    });

  }
));

};
