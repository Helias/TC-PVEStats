/*jslint browser: true, white: true, plusplus: true*/
/*global angular, console, alert*/

(function () {
  'use strict';

  var app = angular.module('pvestats');

  app.config(function ($stateProvider, $urlRouterProvider) {

    /* routing */

    // default route
    $urlRouterProvider.otherwise("/");

  });

}());
