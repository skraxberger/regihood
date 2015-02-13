'use strict';

/* Controllers */

regihoodApp.controller("AreaButtonController", function ($scope) {
    $scope.socialActive = true;

    $scope.toggleActive = function () {
        $scope.socialActive = !$scope.socialActive;
    }
});

regihoodApp.controller("ProfileController", function ($scope, $http, $upload, $modal) {

    //$scope.showModal = false;
    $scope.repositionCover = false;

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


    // Watches for newly selected cover image and uploads it if one is present
    $scope.$watch('cover', function () {
        if ($scope.cover && $scope.cover.length)
            $scope.upload($scope.cover[0], 'cover');
    });


    //angular.element(document.querySelector('#fileInput')).on('change',openImageCrop);

    $scope.$watch('profile', function () {
        if ($scope.profile && $scope.profile.length)
            openImageCrop($scope.profile[0], $modal, $scope);
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
