// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bunyan = require('bunyan');
// load up the user model
var Account = require('../model/account');

var logger = bunyan.createLogger({name: 'routing'});

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (account, done) {
        return done(null, account.id);
    });

    passport.deserializeUser(function (id, done) {
        Account.findById(id, function (err, user) {
            if (err) {
                logger.error({error: error}, "Couldn't find user with id " + id + " for deserialization");
            }
            if (user) {
                return done(err, user);
            }
            else {
                return done(err, false);
            }
        });
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, username, password, done) {

            // asynchronous
            process.nextTick(function () {
                Account.findOne({'username': username}, function (err, account) {
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
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {

            // asynchronous
            process.nextTick(function () {

                //  Whether we're signing up or connecting an account, we'll need
                //  to know if the email address is in use.
                Account.findOne({'username': email}, function (err, existingAccount) {

                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if there's already a user with that email
                    if (existingAccount) {
                        if (existingAccount.local.email) {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        }
                        else {
                            existingAccount.local.email = email;
                            existingAccount.local.password = existingAccount.generateHash(password);
                            existingAccount.local.name.familyName = req.body.lastname;
                            existingAccount.local.name.givenName = req.body.firstname;

                            existingAccount.save(function (err) {
                                if (err)
                                    throw err;

                                return done(null, existingAccount);
                            });
                        }
                    }

                    //  If we're logged in, we're connecting a new local account.
                    if (req.account) {
                        var account = req.user;
                        account.local.email = email;
                        account.username = email;
                        account.local.password = account.generateHash(password);
                        account.local.name.familyName = req.body.lastname;
                        account.local.name.givenName = req.body.firstname;

                        account.displayName = req.body.firstname + " " + req.body.lastname;

                        account.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, account);
                        });
                    }
                    //  We're not logged in, so we're creating a brand new user.
                    else {
                        // create the user
                        var newAccount = new Account();

                        /* TODO: Provide a secure function for generating usernames */
                        newAccount.username = email;
                        newAccount.displayName = req.body.firstname + " " + req.body.lastname;

                        newAccount.local.email = email;
                        newAccount.local.password = newAccount.generateHash(password);
                        newAccount.local.name.familyName = req.body.lastname;
                        newAccount.local.name.givenName = req.body.firstname;

                        newAccount.save(function (err) {
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

            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    Account.findOne({'username': profile.emails[0].value}, function (err, account) {
                        if (err)
                            return done(err);

                        if (account) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!account.facebook.token || !account.facebook.id) {
                                account.facebook.token = token;
                                account.facebook.name.givenName = profile.name.givenName;
                                account.facebook.name.familyName = profile.name.familyName;
                                account.facebook.name.middleName = profile.name.middleName;
                                account.facebook.email = profile.emails[0].value;
                                account.facebook.id = profile.id;
                                account.facebook.raw = profile._raw;

                                account.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, account);
                                });
                            }

                            return done(null, account); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newAccount = new Account();

                            /* TODO: Provide a secure function for generating usernames */
                            newAccount.username = profile.emails[0].value;
                            newAccount.displayName = profile.name.givenName + " " + profile.name.familyName;
                            newAccount.facebook.id = profile.id;
                            newAccount.facebook.token = token;
                            newAccount.facebook.name.givenName = profile.name.givenName;
                            newAccount.facebook.name.familyName = profile.name.familyName;
                            newAccount.facebook.name.middleName = profile.name.middleName;
                            newAccount.facebook.email = profile.emails[0].value;
                            newAccount.facebook.raw = profile._raw;

                            newAccount.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newAccount);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var account = req.user; // pull the user out of the session

                    account.facebook.id = profile.id;
                    account.facebook.token = token;
                    account.facebook.name.givenName = profile.name.givenName;
                    account.facebook.name.familyName = profile.name.familyName;
                    account.facebook.name.middleName = profile.name.middleName;
                    account.facebook.email = profile.emails[0].value;
                    account.facebook.raw = profile._raw;

                    account.save(function (err) {
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
    /*
     passport.use(new TwitterStrategy({

     consumerKey: configAuth.twitterAuth.consumerKey,
     consumerSecret: configAuth.twitterAuth.consumerSecret,
     callbackURL: configAuth.twitterAuth.callbackURL,
     passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

     },
     function (req, token, tokenSecret, profile, done) {

     // asynchronous
     process.nextTick(function () {

     // check if the user is already logged in
     if (!req.user) {

     Account.findOne({'username': profile.emails[0].value}, function (err, account) {
     if (err)
     return done(err);

     if (account) {
     // if there is a user id already but no token (user was linked at one point and then removed)
     if (!account.twitter.token) {
     account.twitter.token = token;
     account.twitter.username = profile.username;
     account.twitter.displayName = profile.displayName;

     account.twitter.name.givenName = profile.name.givenName;
     account.twitter.name.familyName = profile.name.familyName;
     account.twitter.name.middleName = profile.name.middleName;

     account.twitter.email = profile.emails[0].value; // pull the first email

     account.save(function (err) {
     if (err)
     throw err;
     return done(null, account);
     });
     }

     return done(null, account); // user found, return that user
     } else {
     // if there is no user, create them
     var newAccount = new Account();

     // TODO: Provide a secure function for generating usernames
     newAccount.username = profile.username;

     newAccount.twitter.id = profile.id;
     newAccount.twitter.token = token;
     newAccount.twitter.username = profile.username;
     newAccount.twitter.displayName = profile.displayName;

     newAccount.twitter.name.givenName = profile.name.givenName;
     newAccount.twitter.name.familyName = profile.name.familyName;
     newAccount.twitter.name.middleName = profile.name.middleName;

     newAccount.twitter.email = profile.emails[0].value; // pull the first email


     newAccount.save(function (err) {
     if (err)
     throw err;
     return done(null, newAccount);
     });
     }
     });

     } else {
     // user already exists and is logged in, we have to link accounts
     var account = req.user; // pull the user out of the session

     account.twitter.id = profile.id;
     account.twitter.token = token;
     account.twitter.username = profile.username;
     account.twitter.displayName = profile.displayName;

     account.twitter.name.givenName = profile.name.givenName;
     account.twitter.name.familyName = profile.name.familyName;
     account.twitter.name.middleName = profile.name.middleName;

     account.twitter.email = profile.emails[0].value; // pull the first email

     account.save(function (err) {
     if (err)
     throw err;
     return done(null, account);
     });
     }

     });

     }));
     */
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    Account.findOne({'username': profile.emails[0].value}, function (err, account) {
                        if (err)
                            return done(err);

                        if (account) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!account.google.token || !account.google.id) {
                                account.google.id = profile.id;
                                account.google.token = token;
                                account.google.email = profile.emails[0].value; // pull the first email

                                account.google.name.givenName = profile.name.givenName;
                                account.google.name.familyName = profile.name.familyName;
                                account.google.name.middleName = profile.name.middleName;
                                account.google.raw = profile._raw;
                                account.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, account);
                                });
                            }

                            return done(null, account);
                        } else {
                            var newAccount = new Account();

                            /* TODO: Provide a secure function for generating usernames */
                            newAccount.username = profile.emails[0].value;
                            newAccount.displayName = profile.name.givenName + " " + profile.name.familyName;

                            newAccount.google.id = profile.id;
                            newAccount.google.token = token;
                            newAccount.google.email = profile.emails[0].value; // pull the first email

                            newAccount.google.name.givenName = profile.name.givenName;
                            newAccount.google.name.familyName = profile.name.familyName;
                            newAccount.google.name.middleName = profile.name.middleName;
                            newAccount.google.raw = profile._raw;

                            newAccount.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newAccount);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var account = req.user; // pull the user out of the session

                    account.google.id = profile.id;
                    account.google.token = token;
                    account.google.email = profile.emails[0].value; // pull the first email

                    account.google.name.givenName = profile.name.givenName;
                    account.google.name.familyName = profile.name.familyName;
                    account.google.name.middleName = profile.name.middleName;
                    account.google.raw = profile._raw;


                    account.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, account);
                    });

                }

            });

        }));

};