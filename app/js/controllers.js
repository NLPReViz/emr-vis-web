'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

    /*
     * Load reports
     */
    
    $scope.docName = "0001";
    $scope.reportPath = "docs/"+ $scope.docName +"/report.txt";
    $scope.pathologyPath = "docs/"+ $scope.docName +"/pathology.txt";

    $scope.reportText = null;

    //report
    $http.get($scope.reportPath)
    .success(function(data, status, headers, config) {
        $scope.reportText = data;
    })
    .error(function(data, status, headers, config) {
        $scope.reportText = "Status " + status
        alert($scope.reportPath + " is not accessible. Make sure you have the docs/ folder in the app/ directory.");
    });

    // pathology
    $http.get($scope.pathologyPath)
    .success(function(data, status, headers, config) {
        $scope.pathologyText = data;
        $scope.pathologyExists = true;
    })
    
    /*
     * Pie chart
     */

    $scope.pieData = [
      {name: 'True', count: 150, classification: "positive"},
      {name: 'False', count: 150, classification: "negative"},
    ];

    //test pie chart
    var changeData = function() {

      $scope.pieData = [
          {name: 'True', count: 350, classification: "positive"},
          {name: 'False', count: 150, classification: "negative"},
        ];   
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
