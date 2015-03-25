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

    app.post('/api/market', loggedIn, function (req, res) {
        Product.create(req.product, function (err, message) {
            if (err)
                res.send(err);

            // get and return all the messages after you create another
            Product.find({}).where('deleted').equals('false').sort('-date').exec(function (err, messages) {
                if (err)
                    res.send(err)

                res.json(messages); // return all messages in JSON format
            });
        })
    });

};

