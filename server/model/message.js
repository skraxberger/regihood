/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Message = new Schema({
    user : String, /* Creator this message */
    text : String, /* Content as pure string */
    editEnabled : { type: Boolean, default: false}, /* Can this message be modified */
    likes : [String], /* List of users who liked this message */
    hidden: [String], /* List of users who have hidden this message */
    comments: [], /* Added comments */
    containerName: {type: String, default: 'public'}, /* Name of the group in which this message has been posted if any */
    hash_tags: [String], /* Processed version of the content, all possible hashtags are resolved */
    deleted : {type: Boolean, default: false},
    date : { type: Date, default: Date.now } /* Message creation date */
});

module.exports = mongoose.model('Message', Message);