/**
 * Created by skraxberger on 25.03.2015.
 */
var mc = require('mailchimp-api'),
    bunyan = require('bunyan'),
    library = require('../config/library');

var logger = bunyan.createLogger({name: 'mailchimp'});

var mcApi = new mc.Mailchimp('e91e62394487f9d8e2a74ae1782fe601-us10');

function subscribe(listId, email, firstName, lastName) {

    var mcReq = {
        id: listId,
        email: {email: email},
        merge_vars: {
            EMAIL: email,
            FNAME: firstName,
            LNAME: lastName
        }
    };

    // submit subscription request to mail chimp
    mcApi.lists.subscribe(mcReq, function(data) {
        logger.info({list: listId, email: email}, "Subscribed email to list");
    }, function(error) {
        logger.error(error, "Couldn't subscribe %s to list", email);
    });
}
