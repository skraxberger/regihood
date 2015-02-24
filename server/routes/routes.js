/**
 * New node file
 */
var passport = require('passport'),
    fs = require('fs'),
    gm = require('gm'),
    Gridfs = require('gridfs-stream'),
    mongoose = require('mongoose'),
    inspect = require('util').inspect,
//express = require('express'),
    bunyan = require('bunyan');

var logger = bunyan.createLogger({name: 'routing'});

//var router  = express.Router();

var Account = require('../model/account');
var Message = require('../model/message');
var NewsItem = require('../model/newsitem');

// The mongodb instance created when the mongoose.connection is opened
var db = mongoose.connection.db;

// The native mongo driver which is used by mongoose
var mongoDriver = mongoose.mongo;

// Create a gridfs-stream
var gfs = new Gridfs(db, mongoDriver);

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render('index', {user: req.user});
    });

    app.get('/partial/:name', function (req, res) {
        if (req.isAuthenticated()) {
            var name = req.params.name;
            res.render('partials/' + name, {user: req.user});
        }
        else {
            res.redirect('/');
        }
    });

    app.post('/register', function (req, res) {
        Account.register(new Account({username: req.body.firstname + " " + req.body.lastname}), req.body.password, function (err, account) {
            if (err) {
                res.render('index', {account: account});
            }

            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/'
            });
        });
    });

    /*
     Login is handled by passport which allows for a success and failure redirect.
     */
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

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
                logger.error({error: err, file: file}, "Couldn't resize image");
            });


            storeInGridFS(file, req.body, req.session.passport.user, res);
            /*
            lwip.open(file.path, function (err, image) {
                // check 'err'. use 'image'.
                if (err)
                    logger.error({error: err, file: req.files.file}, "Couldn't open image for resizing");
                else {
                    var scaleWidth = 1170 / image.width();
                    image.scale(scaleWidth, function (err, scaledImage) {
                        scaledImage.writeFile(file.path, function (err) {
                            if (err)
                                logger.error({error: err, file: file.path}, "Couldn't save scaled image");
                            else
                                storeInGridFS(file, req.body, req.session.passport.user, res);
                        });
                    });
                }

            });
            */
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
                    logger.info({user: req.session.passport.user}, {yPosition: cover.topPosition}, "Cover image position updated");
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
        getProfileInfo(request.session.passport, request.username, response);
    });

    app.get('/api/v1/image/:imageId', function (request, response) {
        // Now we automatically get the story and element in the request object
        getImageFromStore(request.imageId, response);

    });


    app.get('/api/image/cover', function (req, res) {
        getImageDetailsFromAccount('cover', req.session.passport, res);
    });

    app.get('/api/image/cover/:filename', function (req, res) {
        returnImageFromStore('cover', req.params.filename, res);
    });

    app.get('/api/image/profile', function (req, res) {
        getImageDetailsFromAccount('profile', req.session.passport, res);
    });

    app.get('/api/image/profile/:filename', function (req, res) {
        returnImageFromStore('profíle', req.params.filename, res);
    });

    app.get('/api/messages', function (req, res) {

        // use mongoose to get all todos in the database
        /*
         Message.find(function (err, messages) {

         // if there is an error retrieving, send the error. nothing after res.send(err) will execute
         if (err)
         res.send(err)

         res.json(messages); // return all messages in JSON format
         });
         */
        Message.find({hidden: { "$nin" : [req.user.username]}}).where('deleted').equals('false').sort('-date').exec(function (err, messages) {
            if (err)
                res.send(err)

            res.json(messages); // return all messages in JSON format
        });
    });

    app.get('/api/news', function (req, res) {

        // use mongoose to get all todos in the database
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
        Message.findOneAndUpdate(query, {text: req.body.text, hidden: req.body.hidden}, function (err, message) {
            if (err)
                res.send(err);


            res.json(message);

            // get and return all the messages after you create another
            /*
             Message.find({}).where('deleted').equals('false').sort('-date').exec(function (err, messages) {
             if (err)
             res.send(err)

             res.json(messages); // return all messages in JSON format
             });
             */
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

    app.get('*', function (req, res) {
        res.render('index', {user: req.user});
    });

};

var storeInGridFS = function (file, metadata, user, res) {

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

function getImageDetailsFromAccount(type, passport, res) {

    var imageDetails = {};

    if (passport) {
        Account.findOne({username: passport.user}, function (err, profile) {
            if (err)
                logger.error({error: err}, "Couldn't obtain account from database");
            if (profile) {
                logger.info({profile: profile}, {user: passport.user}, "Found and returning profile info");

                imageDetails.imagePosition = profile.coverImagePosition;
                if (type == 'profile')
                    imageDetails.imageId = profile.profileImage;
                else
                    imageDetails.imageId = profile.coverImage;
            }

            //callback(imageDetails);


            res.send(JSON.stringify(imageDetails));
        });
    }
    else {
        /*
         TODO: Need to send an empty profile image back to client otherwise the profile image would be a mess.
         */
        imageDetails.imageId = 'empty';

        logger.info(JSON.stringify(imageDetails));

        //callback(imageDetails);

        //res.send(JSON.stringify(imageDetails));

    }
};

function getProfileInfo(passport, username, response) {

    var profileInfo = {};

    var query = {'username': username};
    var privateProfile = false;

    if (passport) {
        privateProfile = false;
        query = {'username': passport.user};
    }


    Account.findOne({username: passport.user}, function (error, profile) {
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

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect(301, '/login');
    }
}


