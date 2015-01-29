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

myApp.controller("MessageController", function ($scope, $http, $modal) {
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

    $scope.items = ['item1', 'item2', 'item3'];

    $scope.openSomething = function(size) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.ddMenuOptions3 = [
        {
            text: 'Löschen',
            iconCls: 'someicon'
        }, {
            text: 'Ausblenden'
        }, {
            divider: true
        }, {
            text: 'Linked',
            href: 'http://www.google.com'
        }
    ];

    $scope.ddMenuSelected3 = {};
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

myApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
};
});

