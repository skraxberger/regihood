/**
 * New node file
 */
var passport = require('passport');
var Account = require('../model/account');

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
        Account.register(new Account({username: req.body.username}), req.body.password, function (err, account) {
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

    app.get('/test', function (req, res) {
        res.render('test');
    });


    app.get('*', function (req, res) {
        res.render('index', {user: req.user});
    });

}