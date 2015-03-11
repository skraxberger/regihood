/**
 * New node file
 */
var fs = require('fs'),
    gm = require('gm'),
    Gridfs = require('gridfs-stream'),
    mongoose = require('mongoose'),
    inspect = require('util').inspect,
    bunyan = require('bunyan');

var logger = bunyan.createLogger({name: 'routing'});

var Account = require('../model/account');
var Message = require('../model/message');
var NewsItem = require('../model/newsitem');

// The mongodb instance created when the mongoose.connection is opened
var db = mongoose.connection.db;

// The native mongo driver which is used by mongoose
var mongoDriver = mongoose.mongo;

// Create a gridfs-stream
var gfs = new Gridfs(db, mongoDriver);

/**
 * Routing module which is exported an can be used by the express middleware.
 * The app parama is the express middleware which is used to obtain and control the routing.
 *
 * @param app
 */
module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index', {user: req.user});
    });

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

    app.post('/upload', function (req, res) {

        var file = req.files.file;
        if (req.body.imageType == 'cover') {
            resizeImage(file);
            storeInGridFS(file, req.body, req.session.passport.user, res);
        }
        else {
            storeInGridFS(file, req.body, req.session.passport.user, res);
        }
    });


    /*
     Update the cover image position with the information.
     */
    app.post('/api/image/cover', function (req, res) {

        if (req.session.passport) {
            var user = req.session.passport.user;
            var query = {username: user};
            var cover = req.body;
            var update = {coverImagePosition: cover.topPosition};

            Account.findOneAndUpdate(query, update, function (err, message) {
                if (err) {
                    logger.error(err);
                    res.send(200, 'Cover image position not updated');
                } else {
                    logger.info({user: user}, {yPosition: cover.topPosition}, "Cover image position updated");
                    res.send(200, 'Cover image position updated');
                }
            });
        }
        else {
            logger.error("No user information available. Post to cover not allowed for anonymous");
            res.send("No user information available. Post to cover not allowed for anonymous");
        }
    });

    app.param('username', function (request, response, next, username) {
        // Fetch the story by its ID (storyId) from a database
        // Save the found story object into request object
        request.username = username;
        next();

    });

    app.param('imageId', function (request, response, next, imageId) {
        // Fetch the element by its ID (elementId) from a database
        // Narrow down the search when request.story is provided
        // Save the found element object into request object
        request.imageId = imageId;
        next();

    });

    app.get('/api/v1/profile/:username', function (request, response) {
        // Now we automatically get the story and element in the request object
        //{ story: request.story, element: request.element}
        getProfileInfo(request.username, response);
    });

    app.get('/api/v1/image/:imageId', function (request, response) {
        // Now we automatically get the story and element in the request object
        getImageFromStore(request.imageId, response);

    });

    app.get('/api/messages', function (req, res) {

        /*
         Use mongoose to get all message in the database. Only the once are displayed which are not deleted, duuh and
         the user has not selected to be hidden. Then the messages are sorted in date descending order.

         TODO: Try to use a more configurable search function or to provide one from a configuration
         */
        Message.find({hidden: {"$nin": [req.user.username]}}).where('deleted').equals('false').sort('-date').exec(function (err, messages) {
            if (err)
                res.send(err)

            res.json(messages); // return all messages in JSON format
        });
    });

    app.get('/api/news', function (req, res) {

        // use mongoose to get all news in the database
        NewsItem.find(function (err, news) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(news); // return all messages in JSON format
        });
    });

    // create message and send back all messages after creation
    app.post('/api/messages', function (req, res) {

        // create a message information comes from AJAX request from Angular
        Message.create({
            text: req.body.text,
            user: req.session.passport.user
        }, function (err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Message.find({}).where('deleted').equals('false').sort('-date').exec(function (err, messages) {
                if (err)
                    res.send(err)

                res.json(messages); // return all messages in JSON format
            });
        });

    });

    // update a message
    app.post('/api/messages/:message_id', function (req, res) {

        var query = {_id: req.params.message_id};

        /*
         TODO: We need to find a way to update the whole message except the id, although the id may not change since it
         is not editable.
         */

        Message.findOne(query, function (err, message) {
            if (err)
                logger.error({error: err}, {message: message._id}, "Couldn't update message in database");
            else {
                message = makeDeepCopy(message, req.body);
                message.save();
                logger.info({message: message._id}, "Updated message in database.");
            }
        });
    });

    // delete a message
    app.delete('/api/messages/:message_id', function (req, res) {
        var query = {_id: req.params.message_id};

        Message.findOneAndUpdate(query, {deleted: true}, function (err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Message.find({}).where('deleted').equals('false').sort('-date').exec(function (err, messages) {
                if (err)
                    res.send(err)

                res.json(messages); // return all messages in JSON format
            });
        });
    });

    app.get('/api/messages/:username', function (req, res) {
        // get and return all the messages after you create another
        Message.find({}).where('deleted').equals('false').where('user').equals(req.username).sort('-date').exec(function (err, messages) {
            if (err)
                res.send(err)

            res.json(messages); // return all messages in JSON format
        });

    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
    // LOGIN ===============================

    // process the login form
    app.post('/login', passport.authenticate('local', {
        successRedirect : '/stream', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // SIGNUP =================================
    // process the signup form
    app.post('/register', passport.authenticate('register', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    app.post('/connect/local', passport.authenticate('register', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var account            = req.account;
        account.local.email    = undefined;
        account.local.password = undefined;
        account.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var account            = req.account;
        account.facebook.token = undefined;
        account.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var account           = req.account;
        account.twitter.token = undefined;
        account.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var account          = req.account;
        account.google.token = undefined;
        account.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('*', function (req, res) {
        logger.info({originalUrl: req.originalUrl}, "General router sending index");
        res.render('index', {user: req.user});
    });

};

//===========================================================================================================
//                               General functions which could be used more than once
//===========================================================================================================

/**
 * Store the provided file and its metadate in the MongoDB GridFS. It is mostly used for images but it can
 * store and file which is provided. This is the best way to store big amounts of data.
 *
 * @param file
 * @param metadata
 * @param user
 * @param res
 */
function storeInGridFS(file, metadata, user, res) {

    var writestream = gfs.createWriteStream({
        filename: file.name,
        mode: 'w',
        content_type: file.mimetype,
        metadata: metadata
    });
    fs.createReadStream(file.path).pipe(writestream);

    writestream.on('close', function (storedFile) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Success");
        res.end();

        fs.unlink(file.path, function (err) {
            if (err)
                logger.error({error: err}, "Couldn't delete temp file from filesystem");
            else
                logger.info({path: file.path}, "Successfully deleted temprary file");
        });

        var query = {username: user};
        if (metadata.imageType == 'profile')
            var update = {profileImage: file.name};
        else
            var update = {coverImage: file.name};

        Account.findOneAndUpdate(query, update, function (err, message) {
            if (err)
                logger.error({error: err}, "Couldn't update account with image file info");
            else
                logger.info({image: file.name, user: user}, "Updated image info in user account");
        });

    }).on('error', function (error, file) {
        logger.error({error: error}, "Couldn't store image in database");
    });

}

/**
 * The function obtains the image details stored in the account object of each user. The image details are retrieved
 * the provided user name.
 *
 * @param user The username of the account which should used to retrieve the image details
 * @param res The response object
 */
/*
 function getImageDetailsFromAccount(user, res) {

 var imageDetails = {};

 if (user) {
 Account.findOne({username: user}, function (err, profile) {
 if (err)
 logger.error({error: err}, "Couldn't obtain account from database");
 if (profile) {
 logger.info({profile: profile}, {user: user}, "Found and returning profile info");

 imageDetails.imagePosition = profile.coverImagePosition;

 if (type == 'profile')
 imageDetails.imageId = profile.profileImage;
 else
 imageDetails.imageId = profile.coverImage;
 }

 res.send(JSON.stringify(imageDetails));
 });
 }
 else {
 imageDetails.imageId = 'empty';

 logger.info(JSON.stringify(imageDetails));

 }
 };
 */

function getProfileInfo(username, response) {

    var profileInfo = {};

    var query = {'username': username};

    Account.findOne(query, function (error, profile) {
        if (error)
            logger.error({error: error}, "Couldn't obtain account from database");
        if (profile) {
            logger.info({profile: profile}, query, "Found and returning profile info");

            profileInfo.coverImage = '/api/v1/image/' + profile.coverImage;
            profileInfo.profileImage = '/api/v1/image/' + profile.profileImage;
            profileInfo.coverImagePosition = profile.coverImagePosition;
        }
        response.send(JSON.stringify(profileInfo));
    });
};

function returnImageFromStore(type, imagePath, response) {
    if (imagePath != "empty") {
        var query = {filename: imagePath};

        var readStream = gfs.createReadStream(query).on('error', function (err) {
            logger.error({error: err}, "Couldn't read profile image from database");
        });
        // and pipe it to Express' response
        if (typeof readStream != 'undefined')
            readStream.pipe(response);
    }
    else {
        var fileName = 'profile-empty.png';

        if (type == 'cover') {
            fileName = 'cover-empty.png';
        }

        fs.readFile(fileName, function (err, data) {
            if (err) {
                logger.error({error: err}, "Couldn't read empty profile image.");
                response.writeHead(200, "Couldn't find profile image");
                response.end(data); // Send the file data to the browser.
            }
            else {
                response.writeHead(200, {'Content-Type': 'image/png'});
                response.end(data); // Send the file data to the browser.
            }
        });

    }
};

function getImageFromStore(imageId, response) {
    var query = {filename: imageId};

    var readStream = gfs.createReadStream(query).on('error', function (err) {
        logger.error({error: err}, "Couldn't read profile image from database");
    });
    // and pipe it to Express' response
    if (typeof readStream != 'undefined')
        readStream.pipe(response);
};

function resizeImage(file) {

    var image = gm(file.path);

    var width = 0;
    var height = 0;

    image.size(function (err, size) {
        if (!err) {
            width = size.width;
            height = size.height;
        }
    });

    var scaledImage = image.resize(1170 / width).write(file.path, function (err) {
        if (err)
            logger.error({error: err, file: file}, "Couldn't resize image");
    });

}

function loggedIn(req, res, next) {
    if (req.user && req.isAuthenticated()) {
        next();
    } else {
        res.redirect(301, '/login');
    }
}

function makeDeepCopy(model, upsertData) {
    model.user = upsertData.user;
    model.text = upsertData.text;
    model.editEnabled = upsertData.editEnabled;
    model.likes = upsertData.likes;
    model.hidden = upsertData.hidden
    model.comments = upsertData.comments;
    model.containerName = upsertData.containerName;
    model.hash_tags = upsertData.hash_tags;
    model.deleted = upsertData.deleted;
    model.date = upsertData.date;

    return model;
};
