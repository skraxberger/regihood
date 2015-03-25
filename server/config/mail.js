var email = require("emailjs");


var server = email.server.connect({
    user: "stefan.kraxberger@secinto.com",
    password: "SnPaiel,jnA",
    host: "smtp.1und1.de",
    ssl: true
});

function sendMessage(text, from, to, subject) {
    var message = {
        text: text,
        from: from,
        to: to,
        subject: subject
    };
    // send the message and get a callback with an error or details of the message that was sent
    server.send(message, function (err, message) {
        console.log(err || message);
    });
};

exports.sendMessage = sendMessage;

