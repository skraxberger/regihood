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
    $scope.coverImage = {path: '', topPosition: 0, id: undefined};
    $scope.profileImage = {path: '', topPosition: 0, id: undefined};

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
            if (imageType == 'cover')
                retrieveCoverImage();
            if (imageType == 'profile')
                retrieveProfileImage();
        });
    };

    $scope.saveCoverImagePosition = function() {
        $http.post('/api/cover/', $scope.coverImage)
            .error(function (error) {
                console.log('Error: ' + error);
            });

        $scope.repositionCover = false;
    }
});

regihoodApp.controller("PublicProfileController", function($scope,$http) {
    $scope.repositionCover = false;
    $scope.coverImage = {path: '', topPosition: 0, id: undefined};
    $scope.profileImage = {path: '', topPosition: 0, id: undefined};

    retrieveImageDetails($http, 'profile', function(imageDetails) {
        $scope.profileImage = imageDetails;
    })

    retrieveImageDetails($http, 'cover', function(imageDetails) {
        $scope.coverImage = imageDetails;
    })

});

regihoodApp.controller("MessageController", function ($scope, $http) {
    $scope.post = {};
    $scope.messages = [];
    $scope.news = [];

    /*
     When landing on the page, get all messages and show them.
     TODO: In future it should only show the first something and all others should be fetched only if necessary -> Pagination
     */
    $http.get('/api/messages')
        .success(function (data) {
            $scope.messages = data;
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


function retrieveImageDetails($http, type, callback, parameters) {

    var url = '/api/image/' + type;
    var imageDetails = {};

    $http.get(url, {params: parameters})
        .success(function (data) {
            if (data != '') {
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