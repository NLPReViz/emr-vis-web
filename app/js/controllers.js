'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

    var MainCtrl = this;
    
    $scope.docName = "0001";
    $scope.docPath = "docs/"+ $scope.docName +"/report.txt";

    $scope.reportText = null;
    // $scope.reportLoaded = false;

    // $scope.reportText = "colonoscopy ascending";
    // $scope.reportLoaded = true;


    $http.get($scope.docPath)
    .success(function(data, status, headers, config) {
        $scope.reportText = data;
        $scope.reportLoaded = true;
    })
    .error(function(data, status, headers, config) {
        $scope.reportText = "Status " + status
        alert($scope.docPath + " is not accessible. Make sure you have the docs/ folder in the app/ directory.");
    });

    $scope.pieData = [
      {name: 'True', count: 150, classification: "positive"},
      {name: 'False', count: 150, classification: "negative"},
    ];

    var changeData = function() {
      console.log($scope.pieData);

      console.log("I was called!");

      $scope.pieData = [
          {name: 'True', count: 350, classification: "positive"},
          {name: 'False', count: 150, classification: "negative"},
        ];   

      console.log($scope.pieData);
    }
    
    $timeout(changeData, 1000);

  }])

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
