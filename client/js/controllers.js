'use strict';

/* Controllers */

/*
 function AppController($scope, $http) {
 $http({method: 'GET', url: '/api/name'}).
 success(function(data, status, headers, config) {
 $scope.name = 'Test';
 }).
 error(function(data, status, headers, config) {
 $scope.name = 'Error!'
 });
 }
 */

function ProfileController() {
}

function SearchController() {
}

myApp.controller("MessageController", function ($scope, $http) {
    $scope.post = {};
    $scope.messages = [];
    $scope.news = [];

    // when landing on the page, get all todos and show them
    $http.get('/api/messages')
        .success(function (data) {
            $scope.messages = data;
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    // when landing on the page, get all todos and show them
    $http.get('/api/news')
        .success(function (data) {
            $scope.news = data;
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    $scope.optionMenuClick = function(type, message) {
        if(type === 1) {
            $http.delete('/api/messages/' + message._id)
                .success(function (data) {
                    $scope.messages = data;
                    console.log(data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        }
        else if(type === 2) {

        }
        else if(type === 3) {
            message.editEnabled = true;
        }
        else {
            console.log("Unrecognized type found in option menu click.");
        }

        console.log(message.text);
    };

    // when submitting the add form, send the text to the node API
    $scope.createMessage = function () {
        $scope.post.user = $scope.user_id;
        $http.post('/api/messages', $scope.post)
            .success(function (data) {
                $scope.post = {}; // clear the form so our user is ready to enter another
                $scope.messages = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // update message
    $scope.updateMessage = function(message) {
        $http.post('/api/messages/' + message._id, message)
            .success(function (data) {
                $scope.messages = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteMessage = function (id) {
        $http.delete('/api/messages/' + id)
            .success(function (data) {
                $scope.messages = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
});

