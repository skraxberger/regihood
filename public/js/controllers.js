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

function MyCtrl1() {
	
}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];
