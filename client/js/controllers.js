'use strict';

/* Controllers */

regihoodApp.controller("AreaButtonController", function ($scope) {
    $scope.socialActive = true;

    $scope.toggleActive = function () {
        $scope.socialActive = !$scope.socialActive;
    }
});

regihoodApp.controller("ProfileController", function ($scope, $http, $upload, $modal) {

    $scope.repositionCover = false;
    $scope.coverImage = {path: 'img/cover-empty.jpg', topPosition: 0, id: undefined};
    $scope.profileImage = {path: 'img/profile-empty.png', topPosition: 0, id: undefined};

    retrieveImageDetails($http, 'profile', function(imageDetails) {
        $scope.profileImage = imageDetails;
    })

    retrieveImageDetails($http, 'cover', function(imageDetails) {
        $scope.coverImage = imageDetails;
    })

    // Watches for newly selected cover image and uploads it if one is present
    $scope.$watch('coverFiles', function () {
        if ($scope.coverFiles && $scope.coverFiles.length)
            $scope.upload($scope.coverFiles[0], 'cover');
    });

    $scope.$watch('profileFiles', function () {
        if ($scope.profileFiles && $scope.profileFiles.length)
            openImageCrop($scope.profileFiles[0], $modal, $scope);
    });

    $scope.upload = function (imageFile, imageType) {
        var file = imageFile;
        $upload.upload({
            url: 'upload',
            fields: {'imageType': imageType},
            file: file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded.');
            if (imageType == 'cover') {
                retrieveImageDetails($http, 'cover', function (imageDetails) {
                    $scope.coverImage = imageDetails;
                })
            }
            if (imageType == 'profile') {
                retrieveImageDetails($http, 'profile', function (imageDetails) {
                    $scope.profileImage = imageDetails;
                })
            }
        });
    };

    $scope.saveCoverImagePosition = function() {
        $http.post('/api/image/cover/', $scope.coverImage)
            .error(function (error) {
                console.log('Error: ' + error);
            });

        $scope.repositionCover = false;
    }
});

regihoodApp.controller("PublicProfileController", function($scope,$http) {
    $scope.profileInfo = {coverImage: 'img/cover.png', profileImage: 'img/profile.png'};

    retrieveImageDetails($http, $scope.user_id, function(profileInfo) {
        $scope.profileInfo = profileInfo;
    })


});

regihoodApp.controller("MessageController", function ($scope, $http) {
    $scope.post = {};
    $scope.messages = [];
    $scope.news = [];

    var retrievedMessages = [];

    var maxInitialMessages = 6;
    var lastIndex = 0;

    // Normal dropdown menu items. If the post is not from the user it must show different actions.
    //$scope.dropdownMenu = {items: [{id: "delete", name: "Löschen", usertype: 'user'}, {id: "hide" , name: "Verstecken", usertype: 'general'}, {id: "edit", name: "Editieren", usertype: 'user'},{id: "unfollow", name: "Abbestellen", usertype: 'general'}]};
    var dropdownUser = [{id: "delete", name: "Löschen"}, {id: "hide" , name: "Verstecken"}, {id: "edit", name: "Editieren"}];
    var dropdownGeneral = [{id: "hide" , name: "Verstecken"}, {id: "unfollow", name: "Abbestellen"}];


    /*
     When landing on the page, get all messages and show them.
     TODO: In future it should only show the first something and all others should be fetched only if necessary -> Pagination
     */
    $http.get('/api/messages')
        .success(function (data) {
            retrievedMessages = data;
            $scope.filterMessages();
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    /*
      When landing on the page, get all news and show them.
      TODO: In future it should only show the first something and all others should be fetched only if necessary -> Pagination
      */
    $http.get('/api/news')
        .success(function (data) {
            $scope.news = data;
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });


    $scope.getDropDownMenu = function(message) {
        var result = {};

        if($scope.currentUser == message.user)
            result = dropdownUser;
        else
           result = dropdownGeneral;


        return result;
    }

    $scope.optionMenuClick = function (type, message, index) {
        if (type === 'delete') {
            console.log("deleting message");
            /*
            Should delete really be delete -> probably not. It should only be removed from the stream.
             */
            $scope.deleteMessage(message);
            /*
            $http.delete('/api/messages/' + message._id)
                .success(function (data) {
                    retrievedMessages = data;
                    console.log(data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
              */
        }
        else if (type === 'hide') {
            console.log("hiding message");

            message.hidden.push($scope.currentUser);

            $scope.updateMessage(message);

            var index = $scope.messages.indexOf(message);
            $scope.messages.splice(index, 1);


        }
        else if (type === 'edit') {
            message.editEnabled = true;
            console.log("editing message");
        }
        else if(type === 'unfollow') {
            console.log("Unfollowing message");
        }
        else {
            console.log("Unrecognized type found in option menu click.");
        }

        console.log(message.text);
    };

    $scope.filterMessages = function () {
        console.log("Inside filter messages");
        var messageLength = retrievedMessages.length;

        for (var index = 0 ; lastIndex < messageLength && index < maxInitialMessages; index++) {
            $scope.messages.push(retrievedMessages[lastIndex++]);
        }
    }

    // when submitting the add form, send the text to the node API
    $scope.createMessage = function () {
        $scope.post.user = $scope.user_id;
        $http.post('/api/messages', $scope.post)
            .success(function (data) {
                $scope.post = {}; // clear the form so our user is ready to enter another
                retrievedMessages = data;
                $scope.messages.unshift(data[0]);
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
                retrievedMessages = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it

    $scope.deleteMessage = function (message) {
        $http.delete('/api/messages/' + message._id)
            .success(function (data) {
                retrievedMessages = data;
                var index = $scope.messages.indexOf(message);
                $scope.messages.splice(index, 1);
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    $scope.getProfileOfUser = function (user) {
        $scope.$state.go('public', {user_id: user});
    }
});

regihoodApp.controller("PublicMessageController", function($scope, $http) {

});

regihoodApp.controller('CropImageController', function($scope, $modalInstance, imageFile) {
    $scope.myImage = imageFile;
    $scope.myCroppedImage = '';

    $scope.ok = function () {

        //var blob = dataURItoBlob($scope.myCroppedImage);

        $modalInstance.close($scope.myCroppedImage);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.myHeader = "Test"

    $scope.getProfileOfUser = function (user) {

    }


});

function getFileFromDataURI(dataURI, name, type) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    var blobData = new Blob([new Uint8Array(array)], {type: type});

    var parts = [blobData, 'blob from cropped image', new ArrayBuffer()];

    var croppedFile = new File(parts, name, {
        lastModified: new Date(0), // optional - default = now
        type: type // optional - default = ''
    })

    return croppedFile;
}

function openImageCrop(imageFile, $modal, $scope) {

    var reader = new FileReader();
    reader.onload = function (evt) {
        $scope.$apply(function ($scope) {
            var modalInstance = $modal.open({
                templateUrl: 'imageCropDialog',
                controller: 'CropImageController',
                resolve: {
                    imageFile: function () {
                        return evt.target.result;
                    }
                }
            });

            modalInstance.result.then(function (croppedImage) {
                $scope.upload(getFileFromDataURI(croppedImage, imageFile.name, imageFile.type), 'profile');
                console.log("Crop");
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        });
    };
    reader.readAsDataURL(imageFile);
};

function retrieveImageDetails($http, type, callback) {

    var url = '/api/image/' + type;
    var imageDetails = {};

    $http.get(url)
        .success(function (data) {
            if (data != '') {
                if(data.imageId === 'img/cover-empty.jpg' || data.imageId === 'img/profile-empty.png')
                    imageDetails.path = data.imageId;
                else
                    imageDetails.path = 'api/image/' + type + '/' + data.imageId;
                imageDetails.id = data.imageId;
                imageDetails.topPosition = data.imagePosition;

                callback(imageDetails);
            }
        })
        .error(function (data) {
            console.log("Couldn't obtain cover image");
        });
};

function retrieveProfileInfo($http, user, callback) {

    var url = '/api/v1/profile/' + user;
    var profileInfo = {};

    $http.get(url)
        .success(function (data) {
            if (data != '') {
                profileInfo = data;
                callback(profileInfo);
            }
        })
        .error(function (error) {
            console.log("Couldn't obtain profile info. Error " + error);
        });
};

function unfollowAccount() {

};