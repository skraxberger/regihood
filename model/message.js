/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Message = new Schema({
    user : String,
    text : String,
    editEnabled : { type: Boolean, default: false},
    likes : [],
    date : { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', Message);