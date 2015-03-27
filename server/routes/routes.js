/**
 * New node file
 */
var fs = require('fs'),
    bunyan = require('bunyan'),
    library = require('../config/library');

var logger = bunyan.createLogger({name: 'routing'});


/**
 * Routing module which is exported an can be used by the express middleware.
 * The app parama is the express middleware which is used to obtain and control the routing.
 *
 * @param app
 */
module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index', {user: req.user, message: req.flash('loginMessage')});
    });

    app.get('/login', function (req, res) {
        res.render('index', {user: req.user, message: req.flash('loginMessage')});
    })

    app.get('/register', function (req, res) {
        res.render('index', {user: req.user, message: req.flash('signupMessage')});
    })


    app.get('/partial/:name', function (req, res) {
        var name = req.params.name;
        res.render('partials/' + name, {user: req.user});
    });

    /*
     Login is handled by passport which allows for a success and failure redirect.
     */
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
    // LOGIN ===============================

    // process the login form
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // process the signup form
    app.post('/register', passport.authenticate('register', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

};

//===========================================================================================================
//                               General functions which could be used more than once
//===========================================================================================================

