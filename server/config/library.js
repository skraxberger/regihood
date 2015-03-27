/**
 * Created by skraxberger on 24.03.2015.
 */


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Checks whether the client is logged in or not. If the client is logged in the request must contain
 * a user object as well as isAuthenticated must be true.
 *
 * @param req The request object
 * @param res The response object
 * @param next The next object
 * @returns {*}
 */
function loggedIn(req, res, next) {
    if (req.user && req.isAuthenticated()) {
        return next();
    }
    res.redirect(301, '/login');
}

exports.loggedIn = loggedIn;
exports.endsWith = endsWith;