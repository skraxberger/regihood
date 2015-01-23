'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives','ngRoute']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/messages', {templateUrl: 'partial/messages', controller: MyCtrl1});
    $routeProvider.when('/profile', {templateUrl: 'partial/profile', controller: MyCtrl2});
    $routeProvider.when('/search', {templateUrl: 'partial/search', controller: MyCtrl2});
    $routeProvider.when('/welcome', {templateUrl: 'partial/welcome', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: 'welcome'});
    $locationProvider.html5Mode(true);
  }]);