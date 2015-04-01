/**
 * New node file
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs');


var Account = new Schema({
    username: String,
    displayName : String,
    local: {
        email: String,
        password: String,
        name: {
            familyName: String,
            givenName: String,
            middleName: String
        }
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        raw : Object,
        name: {
            familyName: String,
            givenName: String,
            middleName: String
        }
    },
    google: {
        id: String,
        token: String,
        email: String,
        raw : Object,
        name: {
            familyName: String,
            givenName: String,
            middleName: String
        }
    },
    loggedIn: {type: Boolean, default: false},
    coverImage: {type: String, default: 'img/cover-empty.png'},
    coverImagePosition: {type: Number, default: 0},
    profileImage: {type: String, default: 'img/profile-empty.png'}
});

Account.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
Account.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Account', Account);