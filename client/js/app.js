'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['ngRoute','ui.bootstrap']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/profile', {templateUrl: 'partial/profile', controller: ProfileController});
    $routeProvider.when('/search', {templateUrl: 'partial/search', controller: SearchController});
    $routeProvider.otherwise({redirectTo: '/profile'});
    $locationProvider.html5Mode(true);
  }]);

