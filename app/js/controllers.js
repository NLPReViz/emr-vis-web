'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', '$http', '$window', '$document', '$timeout',  
    function($scope, $http, $window, $document, $timeout) {
        /*
         * App config
         */

        //TODO: Move them to configs - affects perf
        $scope.classificationName = {
            "positive": "True", 
            "negative": "False", 
            "unclassified": "?"
        };

        $scope.variables = ["any-adenoma", "appendiceal-orifice", "asa", "biopsy", "cecum",
                  "ileo-cecal-valve", "indication-type", "informed-consent", 
                  "nursing-report", "prep-adequateNo", "prep-adequateNot",
                  "prep-adequateYes", "proc-aborted", "withdraw-time"]

        $scope.variableMapping = 
        {   "any-adenoma": "any-adenoma",
            "appendiceal-orifice": "appendiceal-orifice",
            "asa": "asa",
            "biopsy": "biopsy",
            "cecum": "cecum",
            "ileo-cecal-valve": "ileo-cecal-valve",
            "indication-type": "indication-type",
            "informed-consent": "informed-consent",
            "nursing-report": "nursing-report",
            "prep-adequateNo": "no-prep-adequate",
            "prep-adequateNot": "not-prep-adequate",
            "prep-adequateYes": "yes-prep-adequate",
            "proc-aborted": "proc-aborted",
            "withdraw-time": "withdraw-time"
        }

        /*
         * Main grid
         */

        $scope.activeDocIndex = null;
        $scope.showGrid = true;

        $scope.appLoading = true;
        $scope.appDisabled = false;

        $http.get("/testBackEndConnection/rest/server/getVarGridObj/modelList.0..xml/devIDList.xml")
            .success(function(data, status) {
                $scope.gridData = data['gridData'];

                // console.log($scope.gridData);

                //Show first report in the set
                $scope.activeDocIndex = 0;
                $scope.loadReport(0);

                $scope.variableData = data['variableData'];

                // console.log($scope.variableData);

                $scope.variables.forEach(function(variable) {
                  // console.log(data[variable]["numPositive"]);
                  $scope.variableData[variable]["percPositive"] = 
                                          Math.round(100.0 *  data['variableData'][variable]["numPositive"] / 
                                          ( data['variableData'][variable]["numPositive"] +  data['variableData'][variable]["numNegative"]));
                  $scope.variableData[variable]['percNegative'] = 100.0 - $scope.variableData[variable]['percPositive'];

                  // console.log($scope.variableData[variable]["percPositive"] + " - " + $scope.variableData[variable]["percNegative"]);
                                          
                });

                $scope.activeVariable = "asa";
                $scope.loadDistribution("asa");
                $scope.appLoading = false;

                // $scope.updateHighlights();
                
            })
            .error(function() { alert("Could not load backend data!"); $scope.appLoading = false;});

        $scope.styleGridCell = function(classification, confidence) {
            if (classification == "positive") {
                if (confidence >= 0.75) 
                    return "cert1-pos";
                else
                    return "cert0-pos";
            }
            else if (classification == "negative") {
                if (confidence >= 0.75) 
                    return "cert1-neg";
                else
                    return "cert0-neg";
            }
            else {
                return "cert0-unclassified";
            }
        };

        $scope.updateGrid = function(variable, activeDocIndex) {
            // console.log(variable, activeDoc);
            if(variable != $scope.variable) {
              $scope.activeVariable = variable;
              $scope.loadDistribution(variable);
            }

            if(activeDocIndex != $scope.activeDocIndex) {
              $scope.activeDocIndex = activeDocIndex;
              $scope.loadReport(activeDocIndex);
            }

            $scope.tabs.docView = true;

            // $scope.updateHighlights();
        };


        $scope.updateHighlights = function() {
            var element = $(".report pre");

            console.log(element);

            $scope.gridData[$scope.activeDocIndex][$scope.activeVariable].topPositive.forEach(function(keyword){
                keyword.matchedList.forEach(function (string){
                    $(element).highlight(new RegExp(string,"gi"), "highlight positive");
                    console.log(string);
                });
            });

            $scope.gridData[$scope.activeDocIndex][$scope.activeVariable].topNegative.forEach(function(keyword){
                keyword.matchedList.forEach(function (string){
                    $(element).highlight(new RegExp(string,"gi"), "highlight negative");
                    console.log(string);
                });
            });
        }

        /*
         * Load reports
         */

        //TODO: Load reports not as variables but as docs
        $scope.loadReport = function(activeDocIndex) {

            var activeDoc = $scope.gridData[activeDocIndex].id;

            // $scope.reportPath = "docs/"+ activeDoc +"/report.txt";
            // $scope.pathologyPath = "docs/"+ activeDoc +"/pathology.txt";

            $scope.reportExists = false;
            $scope.pathologyExists = false;

            $scope.appLoading = true;

            //report
            $http.get("docs/"+activeDoc+"/report.txt")
                .success(function(data, status) {
                    $scope.reportText = data;
                    $scope.reportExists = true;

                    $scope.appLoading = false;
                    $scope.feedbackText = null;
                })
                .error(function(data, status, headers, config) {
                    $scope.reportText = "Status " + status
                    alert($scope.reportPath + " is not accessible. Make sure you have the docs/ folder in the app/ directory.");

                    $scope.appLoading = false;
                });

            // pathology
            $http.get("docs/"+activeDoc+"/pathology.txt")
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
        };

        /*
         * Feedback
         */

        $scope.feedbackText = false;
        $scope.feedbackList = []

        function Feedback(kind, property, classification, variable) { 
            this.kind = kind;  // Text or doc
            this.property = property;
            this.classification = classification;
            this.variable = variable
        }

        $scope.setFeedbackText = function(){
            var text = '';

            // Adapted from http://stackoverflow.com/questions/4652734/return-html-from-a-user-selected-text/4652824#4652824
            if (typeof $window.getSelection != "undefined") {
                var sel = $window.getSelection();
                if (sel.rangeCount) {
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        text = " " + sel.getRangeAt(i).toString();
                    }
                }
            } else if (typeof $document.selection != "undefined") {
                if ($document.selection.type == "Text") {
                    text = $document.selection.createRange().text;
                }
            }

            text = text.trim();
            // console.log("setFeedbackText: " + text);

            if (text) {
                $scope.feedbackText = text;
            }
            else{
                $scope.feedbackText = false;
            }
        };

        $scope.addFeedbackDoc = function(classification) {

            var docClass = $scope.gridData[$scope.activeDocIndex][$scope.activeVariable].classification;
            var fClass = null;

            // if(bAccept) {
            //     fClass = docClass;    
            // }
            // else {
            //     if (docClass == "positive")
            //         fClass = "negative";
            //     else
            //         fClass = "positive";
            // }
            
            $scope.feedbackList.push(new Feedback(0, $scope.gridData[$scope.activeDocIndex].id, 
                                        classification, $scope.activeVariable));

            showInfo("Feedback added to the list!");
        }

        $scope.addFeedbackText = function(text, classification) {
            $scope.feedbackList.push(new Feedback(1, text, classification, $scope.activeVariable));
            showInfo("Feedback added to the list!");
            $scope.feedbackText = false;
        }

        $scope.removeFeedback = function(index) {
            $scope.feedbackList.splice(index, 1);
        }

        $scope.alertMe = function() {
            while($scope.feedbackList.length > 0) {
                $scope.feedbackList.pop();
            }

            setTimeout(function() {
              alert('Re-training!');
            });
        };

        $window.onbeforeunload = function(event){
            if($scope.feedbackList.length > 0) {
                return "You have made unsaved changes. \
                    Would you still like to leave this page?";
            }
        }


        /*
         * Tabs
         */

        $scope.tabs = {docView: true};

        /*
         * AppInfo
         */

        function showInfo (notice){
            $scope.appInfo = notice;

            $timeout(function() {
                $scope.appInfo = false;
            }, 2000);
        }
    }])
        
