/**
 * Created by skraxberger on 25.03.2015.
 */
/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose'),
    bunyan = require('bunyan');

var logger = bunyan.createLogger({name: 'database'});


var Schema = mongoose.Schema;

var Product = new Schema({
    producer : String, /* Producer of this product */
    owner : String, /* Creator this product */
    name : String,
    description : String, /* Content as pure string */
    likes : [String], /* List of users who liked this product */
    comments: [], /* Added comments */
    priceSelf : Number,
    priceDist : Number,
    priceMarket : Number,
    quantityMinimum : {type: Number, default: 1},
    quantityMaximum : {type: Number, default: -1},
    unit : {type: String, default: "single"},
    availability : {type: String, default : "alltime"},
    image: {type: String, default: 'img/item-empty.png'},
    deleted : {type: Boolean, default: false},
    date : { type: Date, default: Date.now } /* Product creation date */
});

Product.post('save', function (doc) {
    logger.info({documentId: doc._id}, 'Product has been saved');
})

module.exports = mongoose.model('Product', Product);