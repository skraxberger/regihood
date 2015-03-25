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
    owner : String, /* Creator this message */
    name : String,
    text : String, /* Content as pure string */
    likes : [String], /* List of users who liked this message */
    comments: [], /* Added comments */
    priceSelf : Number,
    priceDist : Number,
    priceMarket : Number,
    quantityMinimum : Number,
    quantityMaximum : Number,
    unit : String,
    availability : String,
    image: {type: String, default: 'img/item-empty.jpg'},
    deleted : {type: Boolean, default: false},
    date : { type: Date, default: Date.now } /* Message creation date */
});

ShopItem.post('save', function (doc) {
    logger.info({documentId: doc._id}, 'Product has been saved');
})

module.exports = mongoose.model('Product', Product);