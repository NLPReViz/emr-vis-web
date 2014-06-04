'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    /*
     * App config
     */

    $scope.classificationName = {"positive": "True", "negative": "False"};

    $scope.variables = ["any-adenoma", "appendiceal-orifice", "asa", "biopsy", "cecum",
              "ileo-cecal-valve", "indication-type", "infomed-consent", 
              "nursing-report", "no-prep-adequate", "not-prep-adequate",
              "yes-prep-adequate", "proc-aborted", "widthdraw-time"]


    /*
     * Main grid
     */
    
    $http.get("dummy-data.json")
        .success(function(data, status, headers, config) {
            $scope.gridData = data;
        })
        .error(function() { alert("Could not load grid data!"); });

    $scope.styleGridCell = function(classification, confidence) {
        if (classification == "positive") {
            if (confidence > 0.5) 
                return "cert1-pos";
            else
                return "cert0-pos";
        }
        else {
            if (confidence > 0.5) 
                return "cert1-neg";
            else
                return "cert0-neg";
        }
    }

    $scope.updateGrid = function(variable, docName) {
        // console.log(variable, docName);
        $scope.activeVariable = variable;
        $scope.loadReport(docName);
    }

    /*
     * Load reports
     */

    $scope.loadReport = function(docName) {
        $scope.docName = docName;
        $scope.reportPath = "docs/"+ $scope.docName +"/report.txt";
        $scope.pathologyPath = "docs/"+ $scope.docName +"/pathology.txt";

        $scope.reportText = null;

        //report
        $http.get($scope.reportPath)
            .success(function(data, status) {
                $scope.reportText = data;
            })
            .error(function(data, status, headers, config) {
                $scope.reportText = "Status " + status
                alert($scope.reportPath + " is not accessible. Make sure you have the docs/ folder in the app/ directory.");
            });

        // pathology
        $http.get($scope.pathologyPath)
            .success(function(data, status) {
                $scope.pathologyText = data;
                $scope.pathologyExists = true;
            })
            .error(function(){ $scope.pathologyExists = false; });
    };

    $scope.activeVariable = "asa";
    $scope.loadReport("0001");
    
    /*
     * Pie chart
     */

    $scope.pieData = [
      {name: $scope.classificationName["positive"], count: 150, classification: "positive"},
      {name: $scope.classificationName["negative"], count: 150, classification: "negative"},
    ];

    //test pie chart
    var changeData = function() {

      $scope.pieData = [
          {name: $scope.classificationName["positive"], count: 350, classification: "positive"},
          {name: $scope.classificationName["negative"], count: 150, classification: "negative"},
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
