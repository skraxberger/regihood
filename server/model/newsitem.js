/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NewsItem = new Schema({
    text : String,
    user : String,
    date : { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsItem', NewsItem);