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

regihoodApp.controller("AreaButtonController", function ($scope) {
    $scope.socialActive = true;

    $scope.toggleActive = function () {
        $scope.socialActive = !$scope.socialActive;
    }
});

regihoodApp.controller("ProfileController", function ($scope, $http, $upload) {


    retrieveCoverImage();
    retrieveProfileImage();

    function retrieveCoverImage() {
        $scope.coverImage = '';

        $http.get('/api/cover')
            .success(function (data) {
                if (data != '') {
                    $scope.coverImage = data;
                }
            })
            .error(function (data) {
                console.log("Couldn't obtain cover image");
            });
    };

    function retrieveProfileImage() {
        $scope.profileImage = '';

        $http.get('/api/profile')
            .success(function (data) {
                if (data != '') {
                    $scope.profileImage = data;
                }
            })
            .error(function (data) {
                console.log("Couldn't obtain profile image");
            });
    };

    $scope.$watch('cover', function () {
        $scope.upload($scope.cover, 'cover');
    });

    $scope.$watch('profile', function () {
        $scope.upload($scope.profile, 'profile');
    });

    $scope.upload = function (imageFile, imageType) {
        if (imageFile && imageFile.length) {
            var file = imageFile[0];
            $upload.upload({
                url: 'upload',
                fields: {'imageType': imageType},
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                console.log('file ' + config.file.name + 'uploaded.');
                if(imageType == 'cover')
                    retrieveCoverImage();
                if(imageType == 'profile')
                    retrieveProfileImage();
            });
        }
    };
});

regihoodApp.controller("MessageController", function ($scope, $http) {
    $scope.post = {};
    $scope.messages = [];
    $scope.news = [];

    // when landing on the page, get all todos and show them
    $http.get('/api/messages')
        .success(function (data) {
            $scope.messages = data;
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    // when landing on the page, get all todos and show them
    $http.get('/api/news')
        .success(function (data) {
            $scope.news = data;
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    $scope.optionMenuClick = function (type, message) {
        if (type === 1) {
            $http.delete('/api/messages/' + message._id)
                .success(function (data) {
                    $scope.messages = data;
                    console.log(data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        }
        else if (type === 2) {

        }
        else if (type === 3) {
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
    $scope.updateMessage = function (message) {
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

