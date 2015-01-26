
/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  logger = require('morgan'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  passport = require('passport'),
  jade = require('jade'),
  mongoose = require('mongoose'),
  LocalStrategy = require('passport-local'),
  TwitterStrategy = require('passport-twitter'),
  GoogleStrategy = require('passport-google'),
  FacebookStrategy = require('passport-facebook');

var app = module.exports = express();

/**
* Configuration
*/

// all environments
app.set('port', process.env.PORT || 3000);

app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


//passport config
var Account = require('./model/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost:27017/passport_local_mongoose');

// logs user out of site, deleting them from the session, and returns to
// homepage
app.get('/logout', function(req, res) {
	var name = req.user.username;
	console.log("LOGGIN OUT " + req.user.username)
	req.logout();
	res.redirect('/');
	req.session.notice = "You have successfully been logged out " + name + "!";
});


require('./routes/routes')(app);
//===============PORT=================
app.listen(app.get('port'));
console.log("listening on " + app.get('port') + "!");

