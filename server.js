var express = require('express');
var app = express();
//Process.env.PORT is if the port is on my system.
//In many environments (e.g. Heroku), and as a convention, you can set the
//environment variable PORT to tell your web server what port to listen on.
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
//To keep the session alive if srver dies.
const MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');

var configDB = require('./config/database');
require('./config/passport')(passport);


mongoose.connect(configDB.url);

//We will use morgan to log to console the requests
app.use(morgan('dev'));
//Then we want to parse every cookie
app.use(cookieParser());
//Body-Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Then reqs must pass through the session auth middleware
app.use(session({
              secret: 'super-secret',
              saveUninitialized: true,
              resave: true,
              //Adding keepAlive Session
              store: new MongoStore({mongooseConnection: mongoose.connection,
                                    //Time to live of session: 2 days
                                     ttl: 2*24*60*60})}));

app.use(passport.initialize());
//Passport uses the previous express session so we put it here.
app.use(passport.session());
app.use(flash());

//Test Middleware to see session and user matches.
app.use(function(req, res, next){
  console.log(req.session);
  console.log('====================================');
  console.log(req.user);
  next();
});

//Set the view template to ejs.
app.set('view engine', 'ejs');

var api = express.Router();
require('./app/routes/api')(api, passport);
app.use('/api', api);

//Set auth router
var auth = express.Router();
require('./app/routes/auth')(auth, passport);
app.use('/auth', auth);
//Set secured pages (after login) router

var secure = express.Router();
require('./app/routes/secure')(secure, passport);
app.use('/', secure);

// app.use('/', function(req, res){
//   res.send('Our first Express Program!');
// });

//Require the document and pass the app variable so we dont redeclare express
//This has to go after the view engine and the body-parser
// require('./app/routes')(app, passport);

app.listen(port);
console.log('Server running on port: ' + port);
