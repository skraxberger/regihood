'use strict';


// Declare app level module which depends on filters, and services
angular.module('regihoodApp', ['ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngImgCrop', 'infinite-scroll']);


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

angular.module('regihoodApp').config(
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
                    url: "/",
                    templateUrl: 'partial/stream'
                })

                .state('profile', {
                    url: "/profile",
                    templateUrl: 'partial/profile',
                    controller: function ($scope, $stateParams) {
                        console.log("Profile: ", $stateParams);
                    },
                    onEnter: function () {
                        console.log("Entering profile");
                    }

                })
                .state('public', {
                    url: "/:user_id",
                    templateUrl: 'partial/public-profile',
                    controller: function ($scope, $stateParams) {
                        $scope.user_id = $stateParams.user_id;
                    },
                    onEnter: function () {
                        console.log("Entering public profile");
                    }
                })

                .state('market', {
                    url: "/market",
                    templateUrl: 'partial/market'
                })

                .state('product', {
                    url: "/:product_id",
                    templateUrl: 'partial/product',
                    controller: function ($scope, $stateParams) {
                        $scope.product_id = $stateParams.product_id;
                    },
                    onEnter: function () {
                        console.log("Entering public profile");
                    }
                })

                .state('settings', {
                    url: "/settings",
                    templateUrl: 'partial/settings'
                })

                .state('logout', {
                    url: "/logout",
                    templateUrl: 'logout',
                    controller: function ($scope, $stateParams) {
                        console.log("Logout: ", $stateParams);
                    },
                    onEnter: function () {
                        console.log("Entering logout");
                    }

                });
        }
    ]
);

angular.module('regihoodApp').run(
    ['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {

            // It's very handy to add references to $state and $stateParams to the $rootScope
            // so that you can access them from any scope within your applications.For example,
            // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
            // to active whenever 'contacts.list' or one of its decendents is active.
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
                console.log('$stateChangeStart to '+toState.to+'- fired when the transition begins. toState,toParams : \n',toState, toParams);
            });
            $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
                console.log('$stateChangeError - fired when an error occurs during transition.');
                console.log(arguments);
            });
            $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
                console.log('$stateChangeSuccess to '+toState.name+'- fired once the state transition is complete.');
            });
            $rootScope.$on('$viewContentLoaded',function(event){
                console.log('$viewContentLoaded - fired after dom rendered',event);
            });
            $rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
                console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
                console.log(unfoundState, fromState, fromParams);
            });
        }
    ]
);

/*
var loggingModule = angular.module('talis.services.logging', []);

loggingModule.factory("traceService", function () {
    return ({print: printStackTrace});
});
*/
