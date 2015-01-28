'use strict';

/* Controllers */

function AppController($scope, $http) {
  $http({method: 'GET', url: '/api/name'}).
  success(function(data, status, headers, config) {
    $scope.name = 'Test';
  }).
  error(function(data, status, headers, config) {
    $scope.name = 'Error!'
  });
}

function ProfileController() {
    $scope.messages = [];
}



function SearchController() {

}


// Voting / viewing poll results
function MessageItemController($scope, $routeParams) {
    $scope.message = {};
}