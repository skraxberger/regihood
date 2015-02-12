/**
 * New node file
 */
var passport = require('passport'),
    fs = require('fs'),
    lwip = require('lwip'),
    Gridfs = require('gridfs-stream'),
    mongoose = require('mongoose'),
    inspect = require('util').inspect;

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
        }
    )
    ;

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
                successRedirect: '/stream',
                failureRedirect: '/'
            });
        });
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/stream',
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

        console.log(req.body);
        console.log(req.files);

        var file = req.files.file;

        lwip.open(req.files.file.path, function (err, image) {
            // check 'err'. use 'image'.
            if (err)
                console.error("Couldn't open image " + req.files.file + " for resizing");
            else {
                if (req.body.imageType == 'profile') {
                    image.crop(300, 300, function (err, cropedImage) {
                        cropedImage.writeFile(req.files.file.path, function (err) {
                            if (err)
                                console.log(err);
                            else
                                storeInGridFS(req.files.file, req.body, req.session.passport.user, res);
                        });
                    });
                }
                else {
                    var scaleWidth = 1170 / image.width();
                    image.scale(scaleWidth, function (err, scaledImage) {
                        scaledImage.writeFile(req.files.file.path, function (err) {
                            if (err)
                                console.log(err);
                            else
                                storeInGridFS(req.files.file, req.body, req.session.passport.user, res);
                        });
                    });
                }
            }
        });


    });

    app.get('/api/cover', function (req, res) {

        if (req.session.passport) {
            Account.findOne({username: req.session.passport.user}, function (err, profile) {
                if (err)
                    res.send(err);
                if (profile) {
                    console.log(profile);
                    res.send('api/cover/' + profile.coverImage);
                }
            });
        }
        else {
            res.send("not available");
        }
    });

    app.get('/api/profile', function (req, res) {

        if (req.session.passport) {
            Account.findOne({username: req.session.passport.user}, function (err, profile) {
                if (err)
                    res.send(err);
                if (profile) {
                    console.log(profile);
                    res.send('api/profile/' + profile.profileImage);
                }
            });
        }
        else {
            res.send("not available");
        }
    });

    app.get('/api/cover/:filename', function (req, res) {

        var query = {filename: req.params.filename};

        var readStream = gfs.createReadStream(query).on('error', function (err) {
            console.log('Some error!', err);
        });
        // and pipe it to Express' response
        if (typeof readStream != 'undefined')
            readStream.pipe(res);

    });

    app.get('/api/profile/:filename', function (req, res) {

        var query = {filename: req.params.filename};

        var readStream = gfs.createReadStream(query).on('error', function (err) {
            console.log('Some error!', err);
        });
        // and pipe it to Express' response
        if (typeof readStream != 'undefined')
            readStream.pipe(res);

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
            if (err) console.error("Error: " + err);
            console.log('successfully deleted : ' + file.path);
        });

        var query = {username: user};
        if (metadata.imageType == 'profile')
            var update = {profileImage: file.name};
        else
            var update = {coverImage: file.name};

        console.log(storedFile);
        Account.findOneAndUpdate(query, update, function (err, message) {
            if (err)
                console.error(err);
            else
                console.log('Updated image for user: ' + user + ' with image: ' + file.name);
        });

    }).on('error', function (error, file) {
        console.error(error);
    });

}
