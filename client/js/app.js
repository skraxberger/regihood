'use strict';


// Declare app level module which depends on filters, and services
var regihoodApp = angular.module('regihoodApp', ['ui.router', 'ui.bootstrap']);


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
            // $urlRouterProvider

                // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
                // Here we are just setting up some convenience urls.
                //.when('/c?id', '/contacts/:id')
                //.when('/user/:id', '/contacts/:id')

                // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
                //.otherwise('/');


            //////////////////////////
            // State Configurations //
            //////////////////////////

            // Use $stateProvider to configure your states.
            $stateProvider

                //////////
                // Home //
                //////////

                .state("home", {

                    // Use a url of "/" to set a states as the "index".
                    url: "/",

                    // Example of an inline template string. By default, templates
                    // will populate the ui-view within the parent state's template.
                    // For top level states, like this one, the parent template is
                    // the index.html file. So this template will be inserted into the
                    // ui-view within index.html.
                    templateUrl: 'index-test'

                })

                ///////////
                // About //
                ///////////

                .state('about', {
                    url: '/about',
                    templateUrl: 'partial/about'
                })

                .state('news', {
                    url: '/news',
                    templateUrl: 'partial/news'
                })

                .state('profile', {
                    url: '/profile',
                    templateUrl: 'partial/profile'
                })

                .state('stream', {
                    url: '/stream',
                    templateUrl: 'partial/stream'
                })

                .state('market', {
                    url: '/market',
                    templateUrl: 'partial/market'
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
