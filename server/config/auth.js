/**
 * Created by skraxberger on 09.03.2015.
 */
// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1654052861489264', // your App ID
        'clientSecret'  : '61980004d6bb0da3cac46f50c2906a4b', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'tPII1k556M6WapU6v6jwA8RM2',
        'consumerSecret'    : '1ezzCdTFGJNlGpyW9FTa9ikGwkIMF310gCEzGHvyKspj38jL3F',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '641747466409-h18sskhtoilnbg9dmsv3kko7aorkcmpe.apps.googleusercontent.com',
        'clientSecret'  : 'u1v6kMhwu_Zc1EV-6QEUG4Vb',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }

};