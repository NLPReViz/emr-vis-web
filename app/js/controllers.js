'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('appCtrl', ['$scope', '$window', '$document', '$rootScope', 'backend',  
    function($scope, $window, $document, $rootScope, backend) {
        /*
         * App config
         */

        //TODO: Fix WordTree hack!
        $window.appCtrl = $scope;

        $rootScope.config = Object();
        $rootScope.config.classificationName = {
            "positive": "True", 
            "negative": "False", 
            "unclassified": "?"
        };

        $rootScope.config.variables = ["any-adenoma", "appendiceal-orifice", "asa", "biopsy", "cecum",
                  "ileo-cecal-valve", "indication-type", "informed-consent", 
                  "nursing-report", "prep-adequateNo", "prep-adequateNot",
                  "prep-adequateYes", "proc-aborted", "withdraw-time"]

        $rootScope.config.variableMapping = 
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

        $scope.active = {
            docIndex: null,
            variable: null
        }

        $scope.showGrid = true;

        startLoading();

        // Start page load
        backend.getVarDatasetList().then(function(data) {
            $scope.modelList = data['model'];
            $scope.datasetList = data['dataset'];

            stopLoading();
            setModelAndDataset($scope.modelList[0].name, $scope.datasetList[0].name);
        }, function() { alert("Could not retrieve model list!"); stopLoading(); });
        

        function setModelAndDataset (model, dataset) {
            if(model === undefined || dataset === undefined ){
                return
            }

            if ( !($scope.active.model == model && $scope.active.dataset == dataset) ) {
                loadData(model, dataset);
            }

            if ($scope.active.dataset != dataset && $scope.active.wordTreeQuery) {
                $scope.loadWordTree($scope.active.wordTreeQuery);
            }

            $scope.active.model = model;
            $scope.active.dataset = dataset;
        };

        function loadData(model, dataset) {

            startLoading();

            backend.getGridData(model, dataset).then(function(data) {
                $scope.gridData = data['gridData'];

                // console.log($scope.gridData);

                //Show first report in the set
                $scope.active.docIndex = 0;
                $scope.loadReport(0);

                $scope.variableData = data['variableData'];

                // console.log($scope.variableData);

                $rootScope.config.variables.forEach(function(variable) {
                  // console.log(data[variable]["docPositive"].length);
                  $scope.variableData[variable]["percPositive"] = 
                                          Math.round(100.0 *  data['variableData'][variable]["docPositive"].length / 
                                          ( data['variableData'][variable]["docPositive"].length +  data['variableData'][variable]["docNegative"].length));
                  
                  if(isNaN($scope.variableData[variable]["percPositive"]))
                    $scope.variableData[variable]["percPositive"] = 0;

                  $scope.variableData[variable]['percNegative'] = 
                                          Math.round(100.0 *  data['variableData'][variable]["docNegative"].length / 
                                          ( data['variableData'][variable]["docPositive"].length +  data['variableData'][variable]["docNegative"].length));

                  if(isNaN($scope.variableData[variable]["percNegative"]))
                    $scope.variableData[variable]["percNegative"] = 0;
                                          
                });

                $scope.active.variable = $rootScope.config.variables[0];
                $scope.loadDistribution($scope.active.variable);
                stopLoading();

            }, function() { alert("Could not load backend data!"); stopLoading(); });

        }

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
                return "unclassified";
            }
        };

        $scope.updateGrid = function(variable, activeDocIndex) {
            // console.log(variable, activeDoc);
            if(variable != $scope.variable) {
              $scope.active.variable = variable;
              $scope.loadDistribution(variable);
            }

            if(activeDocIndex != $scope.active.docIndex) {
              $scope.active.docIndex = activeDocIndex;
              $scope.loadReport(activeDocIndex);
            }

            //Change view to docView
            $scope.tabs.docView = true;
        };


        /*
         * Load reports
         */

        $scope.records = {
            "report": {
                exists: false,
                text: null
            },
            "pathology": {
                exists: false,
                text: null
            }
        }

        //TODO: Load reports not as variables but as docs
        $scope.loadReport = function(activeDocIndex) {

            var activeDoc = $scope.gridData[activeDocIndex].id;

            $scope.records.report.exists = false;
            $scope.records.pathology.exists = false;

            startLoading();

            //report
            backend.getReport(activeDoc).then(function(data) {
                $scope.records.report.text = data.reportText;
                    $scope.records.report.exists = true;

                    //pathology
                    if (data.pathologyText) {
                        $scope.records.pathology.text = data.pathologyText;
                        $scope.records.pathology.exists = true;
                    }
                    
                    stopLoading();
                    $scope.feedbackText = null;
            }, function() { 
                $scope.records.report.text = "Status " + status;
                alert("Unable to fetch information for report "+activeDoc+".");
                stopLoading();
            });
        };

        /*
         * Distribution chart
         */

        $scope.distData = null;

        $scope.loadDistribution = function(variable) {
            $scope.distData = [
              {name: $rootScope.config.classificationName["positive"], count: $scope.variableData[variable]["docPositive"].length, classification: "positive"},
              {name: $rootScope.config.classificationName["negative"], count: $scope.variableData[variable]["docNegative"].length, classification: "negative"},
              {name: $rootScope.config.classificationName["unclassified"], count: $scope.variableData[variable]["docUnclassified"].length, classification: "unclassified"},
            ];
            
            // $scope.distData.sort(function(first, second) {
            //     return second.count - first.count;
            // });
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

            var docClass = $scope.gridData[$scope.active.docIndex][$scope.active.variable].classification;
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
            
            $scope.feedbackList.push(new Feedback(0, $scope.gridData[$scope.active.docIndex].id, 
                                        classification, $scope.active.variable));

            showInfo("Feedback added to the list!");
        }

        $scope.addFeedbackText = function(classification) {
            $scope.feedbackList.push(new Feedback(1, $scope.feedbackText, classification, $scope.active.variable));
            showInfo("Feedback added to the list!");
            $scope.feedbackText = false;
        }

        $scope.addWordTreeFeedback = function(classification) {
            if ($scope.wordTreeData.feedbackVar) {
                $scope.feedbackList.push(new Feedback(1, $scope.wordTreeData.feedbackText, classification, $scope.wordTreeData.feedbackVar));
                showInfo("Feedback added to the list!");
                $scope.feedbackText = false;
            }
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

        $scope.tabs = {docView: true, wordtreeView: false};

        $scope.setWordTreeHeight = function(minusHeight) {
            if($scope.wordTreeFullscreenButton)
                minusHeight = 50;
            else
                minusHeight = 200;

            // console.log( wordtree.offset().top);
            $("#wordtree-view").height($(window).height() - minusHeight);
        };

        $($window).resize($scope.setWordTreeHeight(200));


        /*
         * AppInfo
         */

        function showInfo (notice){
            $scope.appInfo = notice;

            setTimeout(function() {
              $scope.appInfo = false;
              $scope.$digest();
            }, 1500);
        }

        /*
         * Print report
         */

        $scope.PrintReport = function(doc) {
            //http://stackoverflow.com/questions/2255291/print-the-contents-of-a-div
            var mywindow = $window.open('', 'Print Window', "toolbar=no, scrollbars=yes, width=800");
            mywindow.document.write('<html><head><title>Record #'+ $scope.gridData[$scope.active.docIndex].id +' — '+ doc +'</title>');
            mywindow.document.write('</head><body><pre>');
            mywindow.document.write($("#" + doc + " pre").html());
            mywindow.document.write('</pre></body></html>');
            mywindow.print();
            mywindow.close();
        }

        /*
         * Loading
         */

        var loaderCount = 0;
        $scope.appDisabled = false;

        function startLoading() {
            loaderCount += 1;
            $scope.appLoading = true;
        }

        function stopLoading() {
            if (loaderCount > 1)
                loaderCount -= 1;
            else
                loaderCount = 0;
                $scope.appLoading = false;
        }


        /*
         * WordTree
         */

        $scope.wordTreeData = new Object();

        $scope.loadWordTree = function(query){

            if ($scope.active.dataset === undefined)
                return
            
            startLoading();
            
            backend.getWordTree($scope.active.dataset, query).then(function(data) {
                $("#wordtree-container").empty();
                makeWordTree(data);
                stopLoading();

                $scope.setWordTreePercentage(data.matchedList.length, data.total);
                $scope.wordTreeData.feedbackText = data.query;
                $scope.active.wordTreeQuery = data.query;
                $scope.searchQuery = data.matchedList;

            }, function() { alert("Unable to fetch wordtree."); stopLoading(); });
        
        }

        $scope.setWordTreePercentage = function (matches, total) {
            $scope.wordTreeData.percentage = (100*matches/total).toFixed(2);
            $scope.wordTreeData.matches = matches;
            $scope.wordTreeData.total = total;
        }

        $scope.setWordTreeFeedback = function(selected, root) {
            $scope.wordTreeData.feedbackText = selected;
        }

        $scope.wordTreeFullscreenButton = false;
        $scope.toggleWordTreeFullscreen = function() {
            $scope.wordTreeFullscreenButton = !$scope.wordTreeFullscreenButton;

            setTimeout(function() {
                $scope.setWordTreeHeight();
                $("#wordtree-view").scrollTo('51%', {duration:1, axis:'x'});
            });
        }

        $scope.updateWordTreeVariable = function() {
            $scope.active.variable = $scope.wordTreeData.feedbackVar;
        }

        /*
         * Modal
         */

        $scope.modal = Object();
        $scope.modal.isCollapsed = true;
        $scope.modal.toggle = function() {
            $scope.modal.isCollapsed = !$scope.modal.isCollapsed;

            if(!$scope.modal.isCollapsed){
                $scope.modal.selectedModel = $scope.active.model;
                $scope.modal.selectedDataset = $scope.active.dataset;
            }
        };

        $scope.modal.confirm = function() {
            $scope.modal.isCollapsed = true;
            setModelAndDataset($scope.modal.selectedModel, $scope.modal.selectedDataset);
        }

        return true;
    }])
        
