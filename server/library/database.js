/**
 * Created by skraxberger on 25.03.2015.
 */

var fs = require('fs'),
    Gridfs = require('gridfs-stream'),
    mongoose = require('mongoose'),
    bunyan = require('bunyan'),
    library = require('../config/library');

var logger = bunyan.createLogger({name: 'api'});

// The mongodb instance created when the mongoose.connection is opened
var db = mongoose.connection.db;
// The native mongo driver which is used by mongoose
var mongoDriver = mongoose.mongo;
// Create a gridfs-stream
var gfs = new Gridfs(db, mongoDriver);




function getFileFromStore(fileId, response) {
    var query = {filename: fileId};

    var readStream = gfs.createReadStream(query).on('error', function (err) {
        logger.error({error: err}, "Couldn't read profile image from database");
    });
    // and pipe it to Express' response
    if (typeof readStream != 'undefined')
        readStream.pipe(response);
};

/**
 * Store the provided file and its metadate in the MongoDB GridFS. It is mostly used for images but it can
 * store and file which is provided. This is the best way to store big amounts of data.
 *
 * @param file
 * @param metadata
 * @param user
 * @param res
 */
function storeInGridFS(file, metadata, callback) {

    var writestream = gfs.createWriteStream({
        filename: file.name,
        mode: 'w',
        content_type: file.mimetype,
        metadata: metadata
    });
    fs.createReadStream(file.path).pipe(writestream);

    writestream.on('close', function (storedFile) {

        fs.unlink(file.path, function (err) {
            if (err)
                logger.error({error: err}, "Couldn't delete temp file from filesystem");
            else
                logger.info({path: file.path}, "Successfully deleted temporary file");
        });

        if (callback && typeof callback === "function") {
            callback(file.name, null);
        }

    }).on('error', function (error, file) {
        logger.error({error: error}, "Couldn't store image in database");

        if (callback && typeof callback === "function") {
            callback(null, error);
        }

    });
};


exports.getFile = getFileFromStore;
exports.storeFile = storeInGridFS;