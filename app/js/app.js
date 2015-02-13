'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
  'myApp.directives',
  'myApp.services',
  'myApp.controllers',
  'myApp.filters',
  'ui.bootstrap',
  'ngCookies',
  'ui.keypress'
]);

// // config(['$routeProvider', function($routeProvider) {
//   $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
//   $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
//   $routeProvider.otherwise({redirectTo: '/view1'});
// }])
