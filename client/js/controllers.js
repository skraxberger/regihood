'use strict';

/* Controllers */

regihoodApp.controller("AreaButtonController", function ($scope) {
    $scope.socialActive = true;

    $scope.toggleActive = function () {
        $scope.socialActive = !$scope.socialActive;
    }
});

/**
 *
 */
regihoodApp.controller("ProfileController", function ($scope, $http, $upload, $modal) {

    $scope.repositionCover = false;
    //$scope.coverImage = {path: 'img/cover-empty.jpg', topPosition: 0, id: undefined};
    //$scope.profileImage = {path: 'img/profile-empty.png', topPosition: 0, id: undefined};

    $scope.profileInfo = {coverImage: 'img/cover.jpg', profileImage: 'img/profile.jpg', coverImagePosition: 0};
    /*
     retrieveImageDetails($http, 'profile', function(imageDetails) {
     $scope.profileImage = imageDetails;
     })

     retrieveImageDetails($http, 'cover', function(imageDetails) {
     $scope.coverImage = imageDetails;
     })
     */

    $scope.initCurrentUser = function (currentUser) {
        $scope.currentUser = currentUser;

        retrieveProfileInfo($http, currentUser, function (profileInfo) {
            $scope.profileInfo = profileInfo
        });

    }


    // Watches for newly selected cover image and uploads it if one is present
    $scope.$watch('coverFiles', function () {
        if ($scope.coverFiles && $scope.coverFiles.length)
            upload($scope, $http, $upload, $scope.coverFiles[0], 'cover');
    });

    $scope.$watch('profileFiles', function () {
        if ($scope.profileFiles && $scope.profileFiles.length)
            cropImageAndUpload($upload, $http, $scope.profileFiles[0], $modal, $scope);
    });

    $scope.saveCoverImagePosition = function () {
        $http.post('/api/image/cover/', $scope.coverImage)
            .error(function (error) {
                console.log('Error: ' + error);
            });

        $scope.repositionCover = false;
    }
});

regihoodApp.controller("PublicProfileController", function ($scope, $http) {
    $scope.profileInfo = {coverImage: 'img/cover.jpg', profileImage: 'img/profile.jpg'};

    $scope.initCurrentUser = function (currentUser) {
        $scope.currentUser = currentUser;

        retrieveProfileInfo($http, currentUser, function (profileInfo) {
            $scope.profileInfo = profileInfo
        });

    }

});

regihoodApp.controller("MessageController", function ($scope, $http) {
    $scope.post = {};
    $scope.messages = [];
    $scope.news = [];

    $scope.label = {};
    $scope.label.comment = {edit: "Editieren", delete: "Löschen", update: "Ändern"};

    var commentsChanged = false;
    var messagesChanged = false;

    var retrievedMessages = [];

    var maxInitialMessages = 6;
    var lastIndex = 0;

    // Normal dropdown menu items. If the post is not from the user it must show different actions.
    //$scope.dropdownMenu = {items: [{id: "delete", name: "Löschen", usertype: 'user'}, {id: "hide" , name: "Verstecken", usertype: 'general'}, {id: "edit", name: "Editieren", usertype: 'user'},{id: "unfollow", name: "Abbestellen", usertype: 'general'}]};
    var dropdownUser = [{id: "delete", name: "Löschen"}, {id: "hide", name: "Verstecken"}, {
        id: "edit",
        name: "Editieren"
    }];
    var dropdownGeneral = [{id: "hide", name: "Verstecken"}, {id: "unfollow", name: "Abbestellen"}];


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


    $scope.getDropDownMenu = function (message) {
        var result = {};

        if ($scope.currentUser == message.user)
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
        else if (type === 'unfollow') {
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

        for (var index = 0; lastIndex < messageLength && index < maxInitialMessages; index++) {
            $scope.messages.push(retrievedMessages[lastIndex++]);
        }
    }

    // when submitting the add form, send the text to the node API
    $scope.createMessage = function () {
        $scope.post.user = $scope.user_id;
        /*
         TODO: We need to remove all the AJAX calls from the functions if possible because they slow down the user
         interaction and client rendering
         */
        $http.post('/api/messages', $scope.post)
            .success(function (data) {
                retrievedMessages = data;
                $scope.messages.unshift(data[0]);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
        $scope.post = {}; // clear the form so our user is ready to enter another
    };

    // update message
    $scope.updateMessage = function (message) {

        pushMessageToServer($http, message, function(data) {
            retrievedMessages = data;
        });
        /*
        $http.post('/api/messages/' + message._id, message)
            .success(function (data) {
                retrievedMessages = data;
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
        */
        message.editEnabled = false;
    };

    // delete a todo after checking it

    $scope.deleteMessage = function (message) {
        $http.delete('/api/messages/' + message._id)
            .success(function (data) {
                retrievedMessages = data;
                var index = $scope.messages.indexOf(message);
                $scope.messages.splice(index, 1);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    $scope.getProfileOfUser = function (user) {
        if (user == $scope.currentUser)
            $scope.$state.go('profile');
        else
            $scope.$state.go('public', {user_id: user});
    }

    $scope.like = function (message) {
        console.log(message.likes.indexOf($scope.currentUser));
        if (message.likes.indexOf($scope.currentUser) < 0) {
            message.likes.push($scope.currentUser);

            pushMessageToServer($http, message, function(data) {
                retrievedMessages = data;
            });
            /*
            $http.post('/api/messages/' + message._id, message)
                .success(function (data) {
                    retrievedMessages = data;
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
            */
        }
    }

    $scope.submitComment = function (event, message) {
        var comment = {};
        comment.author = $scope.currentUser;
        comment.date = new Date();
        comment.content = event.currentTarget.value;
        comment.hide = [];
        message.comments.push(comment);
        $http.post('/api/messages/' + message._id, message);
        event.currentTarget.value = "";
    }

    $scope.filterComments = function (message) {
        var comments = message.comments;
        var usedComments = [];
        for (var index = 0; index < comments.length; index++) {
            if (typeof comments[index].hide == 'undefined' || comments[index].hide.indexOf($scope.currentUser) < 0) {
                comments[index].dropdown = false;
                if(comments[index].author == $scope.currentUser) {
                    comments[index].dropdown = true;
                    comments[index].tooltipAction = "Edit or Delete";
                }
                else {
                    comments[index].tooltipAction = "Hide";
                }
                usedComments.push(comments[index]);
            }
        }
        return usedComments;
    }

    $scope.commentDelete = function(message, comment) {
        $scope.makeCommentUnavailable(message, comment);
    }

    $scope.commentHide = function (message, comment) {
        $scope.makeCommentUnavailable(message, comment);
    }

    $scope.commentMakeEditable = function(message, comment) {
        if(message.comments.length) {
            var index = message.comments.indexOf(comment);
            if(index > 0) {
                message.comments[index].editEnabled = true;
            }
            else {
                console.log("Couldn't find comment in message");
            }
        }
    }

    $scope.commentEdit = function(message, comment) {
        if(message.comments.length) {
            var index = message.comments.indexOf(comment);
            if(index > 0) {

                pushMessageToServer($http, message, function (data) {
                    retrievedMessages = data;
                    $scope.filterComments(message);
                });

                message.comments[index].editEnabled = false;
            }
            else {
                console.log("Couldn't find comment in message");
            }
        }
    }

    $scope.getCommentUserThumb = function (comment) {
        /*
         retrieveProfileInfo($http, currentUser, function (profileInfo) {

         });
         */
        console.log("Comment User Thumb");

        return "holder.js/28x28";
    }

    $scope.makeCommentUnavailable = function(message, comment) {
        if(message.comments.length) {
            var index = message.comments.indexOf(comment);
            if(index > 0) {
                if (typeof message.comments[index].hide == 'undefined') {
                    message.comments[index].hide = [];
                    message.comments[index].hide.push($scope.currentUser);

                    pushMessageToServer($http, message, function (data) {
                        retrievedMessages = data;
                        $scope.filterComments(message);
                    });

                }
                else if (message.comments[index].hide.indexOf($scope.currentUser) < 0) {
                    message.comments[index].hide.push($scope.currentUser);

                    pushMessageToServer($http, message, function (data) {
                        retrievedMessages = data;
                        $scope.filterComments(message);
                    });
                }
            }
            else {
                console.log("Couldn't find comment in message");
            }
        }

    }
});

regihoodApp.controller("PublicMessageController", function ($scope, $http) {
    $scope.messages = [];

    var retrievedMessages = [];
    var maxInitialMessages = 6;
    var lastIndex = 0;

    $scope.initCurrentUser = function () {
        console.log($scope.user_id);

        retrieveProfileInfo($http, $scope.user_id, function (profileInfo) {
            $scope.profileInfo = profileInfo
        });

        $http.get('/api/messages/' + $scope.user_id)
            .success(function (data) {
                retrievedMessages = data;
                $scope.filterMessages();
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    }

    $scope.filterMessages = function () {
        console.log("Inside filter messages");
        var messageLength = retrievedMessages.length;

        for (var index = 0; lastIndex < messageLength && index < maxInitialMessages; index++) {
            $scope.messages.push(retrievedMessages[lastIndex++]);
        }
    }

    $scope.like = function (message) {
        if (message.likes.indexOf($scope.currentUser) < 0) {
            message.likes.push($scope.currentUser);
            $http.post('/api/messages/' + message._id, message)
                .success(function (data) {
                    retrievedMessages = data;
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        }
    }

});

regihoodApp.controller("PrivateMessageController", function ($scope, $http) {
    $scope.messages = [];

    var retrievedMessages = [];

    var maxInitialMessages = 6;
    var lastIndex = 0;

    $scope.initCurrentUser = function (currentUser) {
        $scope.currentUser = currentUser;

        retrieveProfileInfo($http, currentUser, function (profileInfo) {
            $scope.profileInfo = profileInfo
        });

        $http.get('/api/messages/' + currentUser)
            .success(function (data) {
                retrievedMessages = data;
                $scope.filterMessages();
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });


    }

    $scope.filterMessages = function () {
        console.log("Inside filter messages");
        var messageLength = retrievedMessages.length;

        for (var index = 0; lastIndex < messageLength && index < maxInitialMessages; index++) {
            $scope.messages.push(retrievedMessages[lastIndex++]);
        }
    }

    $scope.like = function (message) {
        if (message.likes.indexOf($scope.currentUser) < 0) {
            message.likes.push($scope.currentUser);
            $http.post('/api/messages/' + message._id, message)
                .success(function (data) {
                    retrievedMessages = data;
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        }
    }
});


regihoodApp.controller('CropImageController', function ($scope, $modalInstance, imageFile) {
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


//===========================================================================================================
//                               General functions which could be used more than once
//===========================================================================================================

/**
 * Obtains and returns a File API image file from the compact data URI with a contained base64 encoded image inside.
 *
 * @param dataURI The data URI containing the image inside.
 * @param name The name of the resulting image file
 * @param type The type of the resulting image file
 * @returns {File}
 */
function getFileFromDataURI(dataURI, name, type) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
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

/**
 *
 * @param imageFile
 * @param $modal
 * @param $scope
 */
function cropImageAndUpload($upload, $http, imageFile, $modal, $scope) {

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
                upload($scope, $http, $upload, getFileFromDataURI(croppedImage, imageFile.name, imageFile.type), 'profile');
                console.log("Crop");
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        });
    };
    reader.readAsDataURL(imageFile);
};

/**
 *
 * @param $http
 * @param user
 * @param callback
 */
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

/**
 *
 * @param imageFile
 * @param imageType
 */
function upload($scope, $http, $upload, imageFile, imageType) {
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
        /*
         TODO: Chould be made more efficient probably
         */
        retrieveProfileInfo($http, currentUser, function (profileInfo) {
            $scope.profileInfo = profileInfo
        });
    });
};

function pushMessageToServer($http, message, callback) {
    $http.post('/api/messages/' + message._id, message)
        .success(function (data) {
            if(typeof callback != 'undefined')
                callback(data);
            else
                console.log("Success but no callback defined.");
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });
}