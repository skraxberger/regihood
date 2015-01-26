'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngRoute']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/profile', {templateUrl: 'partial/profile', controller: MyCtrl2});
    $routeProvider.when('/search', {templateUrl: 'partial/search', controller: MyCtrl2});
    $locationProvider.html5Mode(true);
  }]);