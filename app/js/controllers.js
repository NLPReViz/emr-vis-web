'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    /*
     * App config
     */

    //TODO: Move them to configs - affects perf
    $scope.classificationName = {"positive": "True", "negative": "False"};

    $scope.variables = ["any-adenoma", "appendiceal-orifice", "asa", "biopsy", "cecum",
              "ileo-cecal-valve", "indication-type", "infomed-consent", 
              "nursing-report", "no-prep-adequate", "not-prep-adequate",
              "yes-prep-adequate", "proc-aborted", "widthdraw-time"]

    /*
     * Main grid
     */
    
    $scope.activeVariable = "asa";
    $scope.activeDoc = null;
    $scope.showGrid = true;

    $http.get("dummy-grid.json")
        .success(function(data, status) {
            $scope.gridData = data;
            $scope.loadReport("0001");
        })
        .error(function() { alert("Could not load grid data!"); });

    $http.get("dummy-variable.json")
        .success(function(data, status) {
            $scope.variableData = data;
            $scope.loadDistribution($scope.activeVariable);
        })
        .error(function() { alert("Could not load variable data!"); });

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

    $scope.updateGrid = function(variable, activeDoc) {
        // console.log(variable, activeDoc);
        
        $("#cell-"+$scope.activeVariable+"-"+$scope.activeDoc)
                        .removeClass("selected")

        $scope.activeVariable = variable;
        $scope.loadDistribution(variable);
        $scope.loadReport(activeDoc);
        // $scope.setActiveDoc(activeDoc);
    }

    /*
     * Load reports
     */

    //TODO: Load reports not as variables but as docs
    $scope.loadReport = function(activeDoc) {
        $scope.activeDoc = activeDoc;

        $scope.reportPath = "docs/"+ $scope.activeDoc +"/report.txt";
        $scope.pathologyPath = "docs/"+ $scope.activeDoc +"/pathology.txt";

        $scope.reportText = null;

        $scope.reportExists = false;
        $scope.pathologyExists = false;

        //report
        $http.get($scope.reportPath)
            .success(function(data, status) {
                $scope.reportText = data;
                $scope.reportExists = true;

                //Find in gridData
                $("#cell-"+$scope.activeVariable+"-"+$scope.activeDoc)
                .addClass("selected")
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
    };

    /*
     * Pie chart
     */

    $scope.pieData = [
        {name: "!#def", count: 1, classification: "positive"},
     ]; 

    $scope.loadDistribution = function(variable) {
        $scope.pieData = [
          {name: $scope.classificationName["positive"], count: $scope.variableData[variable]["numPositive"], classification: "positive"},
          {name: $scope.classificationName["negative"], count: $scope.variableData[variable]["numNegative"], classification: "negative"},
        ];

        $scope.pieData.sort(function(first, second) {
          return second.count - first.count;
        });

    }

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
