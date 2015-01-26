/**
 * New node file
 */
var passport = require('passport');
var Account = require('../model/account');

module.exports = function (app) {

    app.get('/', function (req, res) {
            var bodyClasses = ["three-col", "logged-out", "ms-windows", "front-page-photo-set", "front-page"];
            if (req.user)
                bodyClasses = ["three-col", "logged-in", "ms-windows", "enhanced-mini-profile", "supports-drag-and-drop"];

            res.render('index', {user: req.user, bodyClassVariables: bodyClasses});
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
                var bodyClasses = ["three-col", "logged-out", "ms-windows", "front-page-photo-set", "front-page"];
                if (req.user)
                    bodyClasses = ["three-col", "logged-in", "ms-windows", "enhanced-mini-profile", "supports-drag-and-drop"];

                res.render('index', {account: account, bodyClassVariables: bodyClasses});
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

    app.get('*', function (req, res) {
        var bodyClasses = ["three-col", "logged-out", "ms-windows", "front-page-photo-set", "front-page"];
        if (req.user)
            bodyClasses = ["three-col", "logged-in", "ms-windows", "enhanced-mini-profile", "supports-drag-and-drop"];

        res.render('index', {user: req.user, bodyClassVariables: bodyClasses});
    });

}