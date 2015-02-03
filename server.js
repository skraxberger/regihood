/**
 * Module dependencies
 */

var express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    jade = require('jade'),
    csrf = require('csurf'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter'),
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook');

var app = module.exports = express();

/**
 * Configuration
 */

// Point to the directory which provides the html views and partials
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');

app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));

// Point to the directory which should be served for client side request
app.use(express.static(path.join(__dirname, 'client')));



// all environments
app.set('port', process.env.PORT || 3000);

var app_status = process.env.NODE_ENV || 'development';

app.use(passport.initialize());
app.use(passport.session());


//passport config
var Account = require('./server/model/account');
passport.use(new LocalStrategy(Account.authenticate()));
//passport.use(User.twitterStrategy());   Uncomment this line if you don't want to enable login via Twitter
//passport.use(User.facebookStrategy());  Uncomment this line if you don't want to enable login via Facebook
//passport.use(User.googleStrategy());    Uncomment this line if you don't want to enable login via Google
//passport.use(User.linkedInStrategy());  Uncomment this line if you don't want to enable login via LinkedIn

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost:27017/passport_local_mongoose');

require('./server/routes/routes')(app);
//===============PORT=================
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

