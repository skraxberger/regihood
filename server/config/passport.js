// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var Account       = require('../model/account');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(account, done) {
        done(null, account.id);
    });

    passport.deserializeUser(function(id, done) {
        Account.findById(id, function(err, user) {
            done(err, user);
        });
    });



    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {

            // asynchronous
            process.nextTick(function() {
                User.findOne({ 'local.email' :  email }, function(err, account) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!account)
                        return done(null, false, req.flash('loginMessage', 'No account found.'));

                    if (!account.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else
                        return done(null, account);
                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('register', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {

            // asynchronous
            process.nextTick(function() {

                //  Whether we're signing up or connecting an account, we'll need
                //  to know if the email address is in use.
                Account.findOne({'local.email': email}, function(err, existingAccount) {

                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if there's already a user with that email
                    if (existingAccount)
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                    //  If we're logged in, we're connecting a new local account.
                    if(req.account) {
                        var account            = req.user;
                        account.local.email    = email;
                        account.local.password = account.generateHash(password);
                        account.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, account);
                        });
                    }
                    //  We're not logged in, so we're creating a brand new user.
                    else {
                        // create the user
                        var newAccount            = new Account();

                        newAccount.local.email    = email;
                        newAccount.local.password = newAccount.generateHash(password);

                        newAccount.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newAccount);
                        });
                    }

                });
            });

        }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    Account.findOne({ 'facebook.id' : profile.id }, function(err, account) {
                        if (err)
                            return done(err);

                        if (account) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!account.facebook.token) {
                                account.facebook.token = token;
                                account.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                                account.facebook.email = profile.emails[0].value;

                                account.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, account);
                                });
                            }

                            return done(null, account); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newAccount            = new Account();

                            newAccount.facebook.id    = profile.id;
                            newAccount.facebook.token = token;
                            newAccount.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            newAccount.facebook.email = profile.emails[0].value;

                            newAccount.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newAccount);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var account            = req.user; // pull the user out of the session

                    account.facebook.id    = profile.id;
                    account.facebook.token = token;
                    account.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    account.facebook.email = profile.emails[0].value;

                    account.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, account);
                    });

                }
            });

        }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, tokenSecret, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    Account.findOne({ 'twitter.id' : profile.id }, function(err, account) {
                        if (err)
                            return done(err);

                        if (account) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!account.twitter.token) {
                                account.twitter.token       = token;
                                account.twitter.username    = profile.username;
                                account.twitter.displayName = profile.displayName;

                                account.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, account);
                                });
                            }

                            return done(null, account); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newAccount                 = new Account();

                            newAccount.twitter.id          = profile.id;
                            newAccount.twitter.token       = token;
                            newAccount.twitter.username    = profile.username;
                            newAccount.twitter.displayName = profile.displayName;

                            newAccount.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newAccount);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var account                 = req.user; // pull the user out of the session

                    account.twitter.id          = profile.id;
                    account.twitter.token       = token;
                    account.twitter.username    = profile.username;
                    account.twitter.displayName = profile.displayName;

                    account.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, account);
                    });
                }

            });

        }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    Account.findOne({ 'google.id' : profile.id }, function(err, account) {
                        if (err)
                            return done(err);

                        if (account) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!account.google.token) {
                                account.google.token = token;
                                account.google.name  = profile.displayName;
                                account.google.email = profile.emails[0].value; // pull the first email

                                account.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, account);
                                });
                            }

                            return done(null, account);
                        } else {
                            var newAccount          = new Account();

                            newAccount.google.id    = profile.id;
                            newAccount.google.token = token;
                            newAccount.google.name  = profile.displayName;
                            newAccount.google.email = profile.emails[0].value; // pull the first email

                            newAccount.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newAccount);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var account               = req.user; // pull the user out of the session

                    account.google.id    = profile.id;
                    account.google.token = token;
                    account.google.name  = profile.displayName;
                    account.google.email = profile.emails[0].value; // pull the first email

                    account.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, account);
                    });

                }

            });

        }));

};