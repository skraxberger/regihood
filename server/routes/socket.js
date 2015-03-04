/**
 * Created by skraxberger on 02.03.2015.
 */
/*
 * Serve content over a socket
 */

module.exports = function (socket) {
    socket.emit('send:name', {
        name: 'Bob'
    });

    setInterval(function () {
        socket.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 1000);
};