/**
 * Created by skraxberger on 25.03.2015.
 */
var fs = require('fs'),
    gm = require('gm'),
    Gridfs = require('gridfs-stream'),
    mongoose = require('mongoose'),
    bunyan = require('bunyan'),
    db = require('../library/database'),
    library = require('../config/library');

var logger = bunyan.createLogger({name: 'api'});

var Account = require('../model/account');
var Message = require('../model/message');
var NewsItem = require('../model/newsitem');


module.exports = function (app) {
// =============================================================================
//                                  API
// =============================================================================

    app.post('/upload', library.loggedIn, function (req, res) {

        var file = req.files.file;
        if (req.body.imageType == 'cover') {
            resizeImage(file);
        }

        db.storeFile(file, req.body, function (data, error) {
            if (error) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write("Failure");
                res.end();
            }
            else {
                res.json({filename: file.name});

                if (req.body.imageType === 'cover' || req.body.imageType === 'profile') {
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
                }
            }
        });
    });


    /*
     Update the cover image position with the information.
     */
    app.post('/api/image/cover', library.loggedIn, function (req, res) {

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

    app.get('/api/v1/profile/:username', library.loggedIn, function (request, response) {
        // Now we automatically get the story and element in the request object
        //{ story: request.story, element: request.element}
        getProfileInfo(request.username, response);
    });

    app.get('/api/v1/image/:imageId', library.loggedIn, function (request, response) {
        // Now we automatically get the story and element in the request object
        db.getFile(request.imageId, response);

    });

    app.get('/api/messages', library.loggedIn, function (req, res) {

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

    app.get('/api/news', library.loggedIn, function (req, res) {

        // use mongoose to get all news in the database
        NewsItem.find(function (err, news) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(news); // return all messages in JSON format
        });
    });

// create message and send back all messages after creation
    app.post('/api/messages', library.loggedIn, function (req, res) {

        // create a message information comes from AJAX request from Angular
        Message.create({
            text: req.body.text,
            user: req.user.username,
            displayName: req.user.displayName
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
    app.post('/api/messages/:message_id', library.loggedIn, function (req, res) {

        var query = {_id: req.params.message_id};

        /*
         TODO: We need to find a way to update the whole message except the id, although the id may not change since it
         is not editable.
         */

        Message.findOne(query, function (err, message) {
            if (err)
                logger.error({error: err}, {message: message_id}, "Couldn't update message in database");
            else {
                message = makeDeepCopy(message, req.body);
                message.save();
                logger.info({message: message._id}, "Updated message in database.");
            }
        });
    });

// delete a message
    app.delete('/api/messages/:message_id', library.loggedIn, function (req, res) {
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

    app.get('/api/messages/:username', library.loggedIn, function (req, res) {
        // get and return all the messages after you create another
        Message.find({}).where('deleted').equals('false').where('user').equals(req.username).sort('-date').exec(function (err, messages) {
            if (err)
                res.send(err)

            res.json(messages); // return all messages in JSON format
        });

    });

    app.get('/api/currentuser', library.loggedIn, function (req, res) {
        if (req.user.username) {
            res.json({user: req.user.username});
        }
        else {
            res.json({user: 'anonymous'});
        }
    });
};

//===========================================================================================================
//                               General functions which could be used more than once
//===========================================================================================================


/**
 * Obtains the profile information of the provided user and creates an JSON object for it. It is directly sent via
 * the provided response object.
 *
 * @param username
 * @param response
 */
function getProfileInfo(username, response) {

    var profileInfo = {};

    var query = {'username': username};

    Account.findOne(query, function (error, profile) {
        if (error)
            logger.error({error: error}, "Couldn't obtain account from database");
        if (profile) {
            logger.info({profile: profile}, query, "Found and returning profile info");
            if (library.endsWith(profile.coverImage, "cover-empty.png")) {
                profileInfo.coverImage = profile.coverImage;
            }
            else {
                profileInfo.coverImage = '/api/v1/image/' + profile.coverImage;
            }
            if (library.endsWith(profile.profileImage, "profile-empty.png")) {
                profileInfo.profileImage = profile.profileImage;
            }
            else {
                profileInfo.profileImage = '/api/v1/image/' + profile.profileImage;
            }
            profileInfo.coverImagePosition = profile.coverImagePosition;
        }
        response.send(JSON.stringify(profileInfo));
    });
};


/**
 * Resizes an image which is obtained via the provided file path.
 *
 * @param file
 */
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

/**
 * Makes a deep copy of the provided message object, this is currently necessary since the upsert doesn't work as
 * necessary.
 *
 * @param model
 * @param upsertData
 * @returns {*}
 */
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