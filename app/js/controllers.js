'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {

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
        alert("docs/0001/report.txt not accessible. Put the docs/ folder in app/ directory.");
    });

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
