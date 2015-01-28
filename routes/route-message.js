/**
 * Created by skraxberger on 28.01.2015.
 */
var mongoose = require('mongoose');
var Message = require('../model/message');

// JSON API for list of polls
exports.list = function(req, res) {
    Message.find({}, 'question', function(error, messages) {
        res.json(messages);
    });
};
// JSON API for getting a single poll
exports.message = function(req, res) {
    var messageId = req.params.id;
    Message.findById(messageId, '', { lean: true }, function(err, message) {
        if(message) {
            res.json(message);
        } else {
            res.json({error:true});
        }
    });
};
// JSON API for creating a new poll
exports.create = function(req, res) {
    var reqBody = req.body,
        choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
        pollObj = {question: reqBody.question, choices: choices};
    var message = new Message(pollObj);
    poll.save(function(err, doc) {
        if(err || !doc) {
            throw 'Error';
        } else {
            res.json(doc);
        }
    });
};