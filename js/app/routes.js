/*jslint browser: true, white: true, plusplus: true*/
/*global angular, console, alert*/

(function () {
  'use strict';

  var app = angular.module('pvestats');

  app.config(function ($stateProvider, $urlRouterProvider) {

    /* routing */

    // default route
    $urlRouterProvider.otherwise("/");


    $stateProvider
      .state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'rankController'
    })
      .state('home/', {
      url: '/:from',
      templateUrl: 'partials/home.html',
      controller: 'rankController'
    })
    $stateProvider
      .state('player', {
      url: '/player/:id',
      templateUrl: 'partials/player.html',
      controller: 'playerController'
    })
      .state('player.ach', {
      url: '/ach/:catId',
      templateUrl: 'partials/achievements.html',
      controller: 'achController'
    })
      .state('player.stats', {
      url: '/stats/:statsId',
      templateUrl: 'partials/stats.html',
      controller: 'statsController'
    });

  });

}());
