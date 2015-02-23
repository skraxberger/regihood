/**
 * Created by skraxberger on 23.02.2015.
 */

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');


var ContainerSchema = new Schema({
    commonName: String,
    description: String,
    keywords: ['container', 'empty'],
    coverImage: {type: String, default: 'img/cover-empty.jpg'},
    coverImagePosition: {type: Number, default: 0},
    profileImage: {type: String, default: 'img/profile-empty.png'},
    subscribers : [],
    likes : []
}, {collection: 'container' , discriminatorKey : '_type' });


var AccountSchema = ContainerSchema.extend({
    username : String,
    password : String,
    loggedIn : { type: Boolean, default: false}
});

AccountSchema.plugin(passportLocalMongoose);

var GroupSchema = ContainerSchema.extend({
    groupTypes : ['public', 'open'],
    admins : [], /* Collection of accounts */
    participants: [], /* Collection of containers */
    requiresInvite : {type: Boolean, default: false}
});

var LocationSchema = ContainerSchema.extend({
    location : String,
    country : String,
    types : [],
    owners : [],
    management: [],
    openTime : [],
    capacity : String
});

module.exports = mongoose.model('AccountNew', AccountSchema);
module.exports = mongoose.model('Location', LocationSchema);
module.exports = mongoose.model('Container', ContainerSchema);
module.exports = mongoose.model('Group', GroupSchema);

