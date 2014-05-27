'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  // .controller('MyCtrl1', ['$scope', function($scope) {

  // }])
  // .controller('MyCtrl2', ['$scope', function($scope) {

  // }])
  .controller('TabsDemoCtrl', ['$scope', function($scope) {
      // $scope.tabs = [
      //   { title:'WordTree View', content:'Dynamic content 1' },
      //   { title:'Review Feedback <span class="badge pull-right">42</span>', content:'Dynamic content 2', disabled: true }
      // ];

      $scope.numFeedback = 42;

      $scope.alertMe = function() {
        $scope.numFeedback = 0;
        setTimeout(function() {
          alert('Re-training!');
        });
      };
   }]);
