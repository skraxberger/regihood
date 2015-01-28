/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema;

var Message = new Schema({
    id : String,
    username : String,
    message : String
});

module.exports = mongoose.model('Message', Message);