/**
 * Created by skraxberger on 25.03.2015.
 */
/**
 * Created by skraxberger on 25.03.2015.
 */
var fs = require('fs'),
    gm = require('gm'),
    Gridfs = require('gridfs-stream'),
    mongoose = require('mongoose'),
    bunyan = require('bunyan'),
    library = require('../config/library');

var logger = bunyan.createLogger({name: 'api'});

var Account = require('../model/account');
var Product = require('../model/product');


// The mongodb instance created when the mongoose.connection is opened
var db = mongoose.connection.db;
// The native mongo driver which is used by mongoose
var mongoDriver = mongoose.mongo;
// Create a gridfs-stream
var gfs = new Gridfs(db, mongoDriver);

module.exports = function (app) {

// =============================================================================
//                                  API
// =============================================================================

    app.post('/api/market', library.loggedIn, function (req, res) {
        Product.create(req.body, function (err, product) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Product.find({}).exec(function (err, products) {
                if (err)
                    res.send(err)

                res.json(products); // return all messages in JSON format
            });
        })
    });

    app.get('/api/market', library.loggedIn, function (req, res) {
        Product.find({}).exec(function (err, product) {
            if (err)
                res.send(err)

            res.json(product); // return all messages in JSON format
        });
    });

    app.get('/api/product/:product_id', library.loggedIn, function (req, res) {
        var query = {_id: req.params.product_id};

        /*
         TODO: We need to find a way to update the whole message except the id, although the id may not change since it
         is not editable.
         */

        Product.findOne(query, function (err, product) {
            if (err)
                logger.error({error: err}, {message: product_id}, "Couldn't update message in database");
            else {
                res.json(product); // return all messages in JSON format
            }
        });
    });
};

