/**
 * New node file
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    bcrypt   = require('bcryptjs');


var Account = new Schema({
    local : {
       email        : String,
       name         : String,
       password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    loggedIn : { type: Boolean, default: false},
    coverImage: {type: String, default: 'img/cover-empty.jpg'},
    coverImagePosition: {type: Number, default: 0},
    profileImage: {type: String, default: 'img/profile-empty.png'}
});

Account.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
Account.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Account', Account);