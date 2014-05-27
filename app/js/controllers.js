'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  // .controller('MyCtrl1', ['$scope', function($scope) {

  // }])
  // .controller('MyCtrl2', ['$scope', function($scope) {

  // }])
  .controller('TabsDemoCtrl', ['$scope', function($scope) {
      $scope.tabs = [
        { title:'WordTree View', content:'Dynamic content 1' },
        { title:'Review Feedback', content:'Dynamic content 2', disabled: true }
      ];

      $scope.alertMe = function() {
        setTimeout(function() {
          alert('You\'ve selected the alert tab!');
        });
      };
   }]);
