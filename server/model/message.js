/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose'),
    bunyan = require('bunyan');

var logger = bunyan.createLogger({name: 'database'});


var Schema = mongoose.Schema;

var Message = new Schema({
    user : String, /* Creator this message */
    displayName : String,
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

Message.post('save', function (doc) {
    logger.info({documentId: doc._id}, 'Message has been saved');
})

module.exports = mongoose.model('Message', Message);