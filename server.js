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
    multer = require('multer'),
    csrf = require('csurf'),
    mongoose = require('mongoose'),
    flash    = require('connect-flash'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter'),
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook');

var app = module.exports = express();

/**
 * Configuration
 */

// set up our express application
app.use(logger('combined'));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');

// required for passport
// Point to the directory which provides the html views and partials
app.use(methodOverride('X-HTTP-Method-Override'));
//app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));

// Point to the directory which should be served for client side request
app.use(express.static(path.join(__dirname, 'client')));

app.use(session({ secret: 'secintoisthebestgivemetherestwhatelse',saveUninitialized: true, resave: true })); // session secret
app.use(multer());
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// all environments
app.set('port', process.env.PORT || 3000);


var app_status = process.env.NODE_ENV || 'development';

require('./server/config/passport')(passport); // pass passport for configuration


//passport config
/*
var Account = require('./server/model/account');
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
*/
// mongoose
mongoose.connect('mongodb://localhost:27017/passport_local_mongoose');
require('./server/routes/routes')(app, passport);

//===============PORT=================
var server = http.createServer(app);
/*
var io = require('socket.io').listen(server);
io.sockets.on('connection', require('./server/routes/socket'));
*/

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});