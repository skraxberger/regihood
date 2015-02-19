/**
 * New node file
 */
var passport = require('passport'),
    fs = require('fs'),
    lwip = require('lwip'),
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
    /*
    router.param('id', function(request, response, next, id){
        returnImageFromStore(req.params.type, req.params.id, res);

        findUserByUsername(
            username,
            function(error, user){
                if (error)
                    return next(error);

                request.user = user;
                return next();
            }
        );
    })

    router.get('/cover/:id',
        function(request, response, next){
        }
    );
    router.get('/profile/:id',
        function(request, response, next){
        }
    );
    app.use('/api/image', router);
    */

    app.get('/', function (req, res) {
        res.render('index', {user: req.user});
    });

    app.get('/partial/:name', function (req, res) {
        var name = req.params.name;
        res.render('partials/' + name, {user: req.user});
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
        Message.find(function (err, messages) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
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
            Message.find(function (err, messages) {
                if (err)
                    res.send(err)
                res.json(messages);
            });
        });

    });

    // update a message
    app.post('/api/messages/:message_id', function (req, res) {
        var query = {_id: req.params.message_id};
        Message.findOneAndUpdate(query, {text: req.body.text}, function (err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Message.find(function (err, messages) {
                if (err)
                    res.send(err)
                res.json(messages);
            });
        });
    });

    // delete a message
    app.delete('/api/messages/:message_id', function (req, res) {
        Message.remove({
            _id: req.params.message_id
        }, function (err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Message.find(function (err, messages) {
                if (err)
                    res.send(err)
                res.json(messages);
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
                if(type == 'profile')
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

function returnImageFromStore(type, imagePath, res) {
    if (imagePath != "empty") {
        var query = {filename: imagePath};

        var readStream = gfs.createReadStream(query).on('error', function (err) {
            logger.error({error: err}, "Couldn't read profile image from database");
        });
        // and pipe it to Express' response
        if (typeof readStream != 'undefined')
            readStream.pipe(res);
    }
    else {
        var fileName = 'profile-empty.png';

        if(type == 'cover') {
            fileName = 'cover-empty.png';
        }

        fs.readFile(fileName, function (err, data) {
            if (err) {
                logger.error({error: err}, "Couldn't read empty profile image.");
                res.writeHead(200, "Couldn't find profile image");
                res.end(data); // Send the file data to the browser.
            }
            else {
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(data); // Send the file data to the browser.
            }
        });

    }
};

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect(301, '/login');
    }
}


