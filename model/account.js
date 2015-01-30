/**
 * New node file
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema, passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	username : String,
	password : String,
    loggedIn : { type: Boolean, default: false}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);