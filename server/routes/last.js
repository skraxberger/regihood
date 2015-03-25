/**
 * Created by skraxberger on 25.03.2015.
 */

var bunyan = require('bunyan');

var logger = bunyan.createLogger({name: 'routing'});


// =============================================================================
// GENERAL route for everything else     =======================================
// =============================================================================

module.exports = function (app) {
    app.get('*', function (req, res) {
        logger.info({originalUrl: req.originalUrl}, "General router sending index");
        res.render('index', {user: req.user});
    });
};
