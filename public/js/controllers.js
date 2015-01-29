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


