'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngRoute']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/profile', {templateUrl: 'partial/profile', controller: ProfileController});
    $routeProvider.when('/messages/:messageId', {templateUrl: 'partial/message', controller: MessageItemController});
    $routeProvider.when('/search', {templateUrl: 'partial/search', controller: SearchController});
    $locationProvider.html5Mode(true);
  }]);

