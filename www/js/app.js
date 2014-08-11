// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['starter.controllers', 'starter.services'])

    .run(function ($ionicPlatform, $ionicLoading, $ionicPopup) {
        $ionicPlatform.ready(function () {
            console.log("ionic ready console log");
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        console.log("config init");

        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.login', {
                url: "/login",
                views: {
                    'menuContent': {
                        templateUrl: "templates/login.html"
                    }
                }
            })

            .state('app.map', {
                url: "/map",
                views: {
                    'menuContent': {
                        templateUrl: "templates/map.html",
                        controller: 'MapCtrl'
                    }
                }
            })

            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html"
                    }
                }
            })

            .state('app.logout', {
                url: "/logout",
                views: {
                    'menuContent': {
                        templateUrl: "templates/login.html",
                        controller: 'LogoutCtrl'
                    }
                }
            })

            .state('app.tips', {
                url: "/tips",
                views: {
                    'menuContent': {
                        templateUrl: "templates/areatips.html"
                    }
                }
            })

            .state('app.mytips', {
                url: "/mytips",
                views: {
                    'menuContent': {
                        templateUrl: "templates/mytips.html"
                    }
                }
            })

            .state('app.register', {
                url: "/register",
                views: {
                    'menuContent': {
                        templateUrl: "templates/register.html"
                    }
                }
            })

            .state('app.viewtip', {
                url: "/tips/{tipId}",
                views: {
                    'menuContent': {
                        templateUrl: "templates/tip.html"
                    }
                }
            })

            .state('app.newtip', {
                url: "/newtip",
                views: {
                    'menuContent': {
                        templateUrl: "templates/newtip.html"
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/login');
    });