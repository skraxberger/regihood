/**
 * New node file
 */
var passport = require('passport');
var Account = require('../model/account');
var Message = require('../model/message');
var NewsItem = require('../model/newsitem');

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
                successRedirect: '/profile',
                failureRedirect: '/'
            });
        });
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/profile',
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

    app.get('/api/messages', function(req, res) {

        // use mongoose to get all todos in the database
        Message.find(function(err, messages) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(messages); // return all messages in JSON format
        });
    });

    app.get('/api/news', function(req, res) {

        // use mongoose to get all todos in the database
        NewsItem.find(function(err, news) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(news); // return all messages in JSON format
        });
    });

    // create message and send back all messages after creation
    app.post('/api/messages', function(req, res) {

        // create a message information comes from AJAX request from Angular
        Message.create({
            text : req.body.text,
            user : req.session.passport.user
        }, function(err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Message.find(function(err, messages) {
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
    app.delete('/api/messages/:message_id', function(req, res) {
        Message.remove({
            _id : req.params.message_id
        }, function(err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Message.find(function(err, messages) {
                if (err)
                    res.send(err)
                res.json(messages);
            });
        });
    });

    app.get('*', function (req, res) {
        res.render('index', {user: req.user});
    });

}
