'use strict';


// Declare app level module which depends on filters, and services
var regihoodApp = angular.module('regihoodApp', ['ui.router', 'ui.bootstrap', 'angularFileUpload', 'ngImgCrop']);


/*
 regihoodApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
 $routeProvider.when('/stream', {templateUrl: 'partial/stream', controller: ProfileController});
 $routeProvider.when('/profile', {templateUrl: 'partial/profile', controller: ProfileController});
 $routeProvider.when('/news', {templateUrl: 'partial/news', controller: ProfileController});
 $routeProvider.when('/about', {templateUrl: 'partial/about', controller: ProfileController});
 $routeProvider.when('/settings', {templateUrl: 'partial/settings', controller: SearchController});
 $routeProvider.otherwise({redirectTo: '/stream'});
 $locationProvider.html5Mode(true);
 }]);
 */

regihoodApp.config(
    ['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            /////////////////////////////
            // Redirects and Otherwise //
            /////////////////////////////

            // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
            $urlRouterProvider

                // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
                // Here we are just setting up some convenience urls.
                //.when('/c?id', '/contacts/:id')
                //.when('/user/:id', '/contacts/:id')

                // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
                .otherwise('/');


            //////////////////////////
            // State Configurations //
            //////////////////////////

            // Use $stateProvider to configure your states.
            $stateProvider

                //////////
                // Home //
                //////////
                .state('home', {
                    url: '/',
                    templateUrl: 'partial/stream'
                })

                .state('profile', {
                    url: '/profile',
                    templateUrl: 'partial/profile'
                })

                .state('market', {
                    url: '/market',
                    templateUrl: 'partial/market'
                })

                .state('settings', {
                    url: 'settings',
                    templateUrl: 'partial/settings'
                })

                .state('logout', {
                    url: 'logout',
                    templateUrl: 'logout'
                })
        }
    ]
);

regihoodApp.run(
    ['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {

            // It's very handy to add references to $state and $stateParams to the $rootScope
            // so that you can access them from any scope within your applications.For example,
            // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
            // to active whenever 'contacts.list' or one of its decendents is active.
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]
);
