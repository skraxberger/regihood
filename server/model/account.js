/**
 * New node file
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');


var Account = new Schema({
	username : String,
	password : String,
    loggedIn : { type: Boolean, default: false},
    coverImage: {type: String, default: 'img/cover-empty.jpg'},
    coverImagePosition: {type: Number, default: 0},
    profileImage: {type: String, default: 'img/profile-empty.png'}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);