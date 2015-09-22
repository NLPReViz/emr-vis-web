'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('appCtrl', ['$scope', '$window', '$document', '$rootScope', 'backend', 'truncateFilter',
    function($scope, $window, $document, $rootScope, backend, truncateFilter) {
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
            "ileo-cecal-valve": "ileocecal-valve",
            "indication-type": "indication-type",
            "informed-consent": "informed-consent",
            "nursing-report": "nursing-report",
            "prep-adequateNo": "no-prep-adequate",
            "prep-adequateNot": "not-prep-adequate",
            "prep-adequateYes": "yes-prep-adequate",
            "proc-aborted": "proc-aborted",
            "withdraw-time": "withdraw-time"
        }

        $scope.active = {
            docIndex: null,
            variable: null,
            gridCount: 0,
            sort: {
                variable: null,
                reverse: false
            }
        }

        checkLogin();

        function checkLogin(manual) {
            backend.checkLogin()
                .then(function () {
                    $scope.active.username = backend.getUserName();
                    startSession();
                }, function() {
                    if(manual) {
                        $("#login-box").addClass('has-error animated shake');
                    }
                    $scope.active.username = null;
                });
        }

        $scope.doLogin = function() {
            $("#login-box").removeClass('has-error animated shake');
            backend.login($("#input-username").val(), $("#input-password").val());
            checkLogin(true);
        }

        $scope.doLogout = function() {
            var confirm = true;

            if($scope.feedbackList.length > 0){
                confirm = $window.confirm("You have made unsaved changes. Would you still like to leave this page?");
            }

            if(confirm) {
                backend.putLogEvent("trackVisited", JSON.stringify($scope.trackVisited));
                backend.putLogEvent("trackFeedback", JSON.stringify($scope.trackFeedback));
                backend.putLogEvent("gridData", JSON.stringify($scope.gridData));

                $scope.clearFeedback();
                backend.logout();
                $scope.active.username = null;
            }
        }

        function startSession(){
            $scope.gridData = null;
            $scope.trackVisited = null;
            $scope.variableData = null;
            $scope.active.dataset = null;
            $scope.active.model = null;

            $scope.feedbackStats = new Object();
            $scope.trackFeedback = null;

            backend.getVarDatasetList().then(function(data) {
                $scope.modelList = data['model'];
                $scope.datasetList = data['dataset'];

                stopLoading();

                setModelAndDataset($scope.modelList[$scope.modelList.length - 1].name,
                                   "feedbackIDList");
            }, function() { 
                backend.putLogEvent("Error", "Could not retrieve model list!");
                alert("Could not retrieve model list!"); 
                stopLoading(); 
            });

            backend.putLogEvent("startSession", "OK");
        }

        /*
         * Main grid
         */

        $scope.varStats = Object();

        $scope.clearTrackFeedback = function() {
            $rootScope.config.variables.forEach(function(variable) {
                    $scope.feedbackStats[variable] = [];
            });

            $scope.trackFeedback = new Array();
            for(var i=0; i<$scope.gridData.length; i++){
                $scope.trackFeedback[$scope.gridData[i].id] = new Object();
                $rootScope.config.variables.forEach(function(variable) {
                        $scope.trackFeedback[$scope.gridData[i].id][variable] = 0;
                });
            }
        }

        function setModelAndDataset (model, dataset) {
            if(model === undefined || dataset === undefined )
                return

            if ( !($scope.active.model == model && $scope.active.dataset == dataset) ){
                $scope.trackVisited = null;
                $scope.trackFeedback = null;
                loadData(model, dataset);
            }


            $scope.active.model = model;
            $scope.active.dataset = dataset;
        };

        function loadData(model, dataset) {

            startLoading();

            $scope.clearModified();

            backend.getGridData(model, dataset).then(function(data) {

                assignDataToVars(data);

                stopLoading();

            }, function() { 
                backend.putLogEvent("Error", "Could not load backend data!");
                alert("Could not load backend data!"); 
                stopLoading(); 
            });

        }

        function assignDataToVars(data) {
            $scope.gridData = data['gridData'];

            if($scope.trackVisited == null)
                $scope.clearVisited();

            if($scope.trackFeedback == null)
                $scope.clearTrackFeedback();

            //TODO: Hack for fat scrollbars on Windows
            setTimeout(function() {
                fixGridScrollBar();
            });

            // console.log($scope.gridData);

            //Show first report in the set
            if(typeof $scope.gridData[$scope.active.docIndex] == 'undefined') {
                $scope.active.docIndex = 0;
            }

            $scope.loadReport($scope.active.docIndex);

            $scope.variableData = data['variableData'];

            // console.log($scope.variableData);

            // $rootScope.config.variables.forEach(function(variable) {
            //   // console.log(data[variable]["docPositive"].length);
            //   // $scope.variableData[variable]["percPositive"] =
            //   //                         Math.round(100.0 *  data['variableData'][variable]["docPositive"].length /
            //   //                         ( data['variableData'][variable]["docPositive"].length +  data['variableData'][variable]["docNegative"].length));

            //   // if(isNaN($scope.variableData[variable]["percPositive"]))
            //   //   $scope.variableData[variable]["percPositive"] = 0;

            //   // $scope.variableData[variable]['percNegative'] =
            //   //                         Math.round(100.0 *  data['variableData'][variable]["docNegative"].length /
            //   //                         ( data['variableData'][variable]["docPositive"].length +  data['variableData'][variable]["docNegative"].length));

            //   // if(isNaN($scope.variableData[variable]["percNegative"]))
            //   //   $scope.variableData[variable]["percNegative"] = 0;

            // });

            if(!$scope.active.variable){
              $scope.active.variable = $rootScope.config.variables[0];
            };
            
            backend.putLogEvent("setActiveVariable", $scope.active.variable);

            $scope.loadVarStats($scope.active.variable);
            $scope.updateWordTreeClass();
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

        var deferedScroll;

        $scope.updateGridId = function(variable, id) {
            var index = getGridIndexFromDocId(id);
            if(index !== null) {
                $scope.updateGrid(variable, index, true);
            }
        }

        $scope.updateGrid = function(variable, activeDocIndex, bScroll) {
            // console.log(variable, activeDoc);

            trackVisited($scope.gridData[$scope.active.docIndex].id, 
                            $scope.active.variable, true); //Update previously open

            if(variable != $scope.active.variable) {
              $scope.active.variable = variable;
              backend.putLogEvent("setActiveVariable", $scope.active.variable);

              $scope.loadVarStats(variable);
              $scope.updateWordTreeClass()
            }

            if(bScroll || activeDocIndex != $scope.active.docIndex) {
                $scope.active.docIndex = activeDocIndex;
                $scope.loadReport(activeDocIndex);
            }

            if(bScroll){
                clearTimeout(deferedScroll);
                deferedScroll = setTimeout(function(){
                    $("#grid-table").scrollTo($("#grid-table .selected"))
                });
            }

            //Change view to docView
            $scope.tabs.docView = true;
            // backend.putLogEvent("docView", "Active");
        };

        $scope.checkFilter = function(index, id) {
            if(!$scope.searchQuery) {
                return true;
            }

            if(index==0) {
                $scope.active.gridCount = 0;
            }

            if($scope.searchQuery.indexOf(id) !== -1){
                $scope.active.gridCount++;
                return true;
            }
            else {
                return false;
            }
        }

        function trackVisited(docId, variable, value) {
            $scope.trackVisited[docId][variable] = value; //Update previously open
        }

        $scope.clearVisited = function(){
            if(!$scope.gridData)
                return;

            $scope.trackVisited = new Array();
            for(var i=0; i<$scope.gridData.length; i++){
                $scope.trackVisited[$scope.gridData[i].id] = new Object();
            }
        }

        $scope.clearModified = function(){
            $("#grid-table .cell-modified").removeClass("cell-modified");
        }

        $scope.gotoNextDoc = function(reverse){
            if(!$scope.gridData)
                return false;

            var shift = 1;
            if(reverse)
                shift = -1;

            var invalid = true;
            var newIndex = $scope.active.docIndex;

            while(invalid) {
                newIndex = newIndex + shift;

                if(newIndex < 0 || newIndex > $scope.gridData.length - 1)
                    return false;

                if(!$scope.searchQuery)
                    invalid = false;
                else {
                    //TODO: Make this efficient
                    if($scope.searchQuery.indexOf($scope.gridData[newIndex].id) !== -1)
                        invalid = false;
                }
            }

            $scope.updateGrid($scope.active.variable, newIndex, true);

            return true;
        }

        /*
         * Feedback Context Menu
         */

        $scope.gridContextMenu = function(index, variable) {
            var options = [
                    ["Mark cell as unread " + index + " " + variable, function(){ }],
                    null,
                    ["Mark all cells as unread", function(){ }],
                    null,
                    ["Clear all modified markers", function(){ }],
                ];

            return options;
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

                backend.putLogEvent("getReport", activeDoc);
                stopLoading();
                $scope.feedbackText = null;

                //Highlight WordTree
                if($scope.wordTreeData.spanText && $scope.tabs.docView) {
                    var search = $scope.wordTreeData.spanText.replace(/\s*\.$/, "");

                    search = search.replace(/[^\w\s]|_/g, function ($1) { return ' ' + $1 + ' ';})
                                    .split(' ').join("[\\W]*"); //Insert flexible spaces

                    setTimeout(function() {
                        var range = rangy.createRange();

                        range.selectNodeContents($("#emr-report pre").get()[0]);

                        var regex = new RegExp(search, "gi");

                        searchResultApplier.undoToRange(range);

                        if(range.findText(regex)){
                            searchResultApplier.applyToRange(range);
                            $("body").scrollTo($(".highlight-flash").offset().top-300, 500);
                        }
                    });
                }
            }, function() {
                $scope.records.report.text = "Unable to fetch report";
                stopLoading();
            });
        };

        /*
         * Calculate var stats
         */

        $scope.setSearchFilter = function(docs) {
            $scope.searchQuery = docs;
            $scope.loadVarStats($scope.active.variable);
        };

        $scope.distData = null;

        $scope.loadVarStats = function(variable) {

            if(angular.isUndefined($scope.variableData) || !variable)
                return;

            var positive = 0, negative = 0, unclassified = 0;

            if(!$scope.searchQuery) {
                $scope.varStats.topPositive = $scope.variableData[variable].topPositive;
                $scope.varStats.topNegative = $scope.variableData[variable].topNegative;

                positive = $scope.variableData[variable]["docPositive"].length;
                negative = $scope.variableData[variable]["docNegative"].length;
                unclassified = $scope.variableData[variable]["docUnclassified"].length;;
            }
            else{
                if(!$scope.gridData)
                    return;

                $scope.varStats.topPositive = [];
                $scope.varStats.topNegative = [];
                $scope.gridData.forEach(function(doc) {
                    if($scope.searchQuery.indexOf(doc.id) !== -1) {
                        jQuery.extend($scope.varStats.topPositive, doc[variable].topPositive);
                        jQuery.extend($scope.varStats.topNegative, doc[variable].topNegative);

                        switch (doc[variable].classification) {
                            case "positive": positive++; break;
                            case "negative": negative++; break;
                            case "unclassified": unclassified++; break;
                        }
                    }
                });

                $scope.varStats.topPositive.sort(function(first, second) {
                    return second.weight - first.weight;
                });

                $scope.varStats.topNegative.sort(function(first, second) {
                    return second.weight - first.weight;
                });
            }

            $scope.distData = [
                {name: $rootScope.config.classificationName["positive"], count: positive, classification: "positive"},
                {name: $rootScope.config.classificationName["negative"], count: negative, classification: "negative"},
                {name: $rootScope.config.classificationName["unclassified"], count: unclassified, classification: "unclassified"},
            ];
        };


        /*
         * Feedback
         */

        $scope.feedbackText = false;
        $scope.feedbackList = []

        function Feedback(kind, selected, span, classification, variable, docList) {
            this.kind = kind;  // Text / doc / word tree
            this.selected = selected; // valid for text spans and wordtree
            this.span = span; // full text span in case of word tree ; only valid for word tree
            this.classification = classification;
            this.variable = variable;
            this.docList = docList;
            this.status = null;
            this.conflictList = [];

            this.$hidden_id = null;
        }

        $scope.setFeedbackText = function(){
            var selection = rangy.getSelection();

            if(!selection.isCollapsed) {
                    selection.expand("word");

                    var text = selection.toString().trim();

                    if (text) {
                        $scope.feedbackText = text;
                        return;
                    }
            }

            $scope.feedbackText = false;
        };

        function addFeedbackToList(feedback) {
            var properties = ["kind", "selected", "span", "classification", "variable", "docList"];

            var newJSON = JSON.stringify(feedback, properties);

            var bDuplicate = false;

            $scope.feedbackList.forEach(function(old){
                if (JSON.stringify(old, properties) == newJSON)
                    bDuplicate = true;
            });

            if(!bDuplicate) {
                $scope.feedbackList.push(feedback);
                backend.putLogEvent("addFeedbackToList", JSON.stringify(feedback));
                showInfo("Feedback added to the list.");

                if(Array.isArray(feedback.docList)){
                    feedback.docList.forEach(function(doc){
                        if ($scope.feedbackStats[feedback.variable].indexOf(doc) == -1)
                            $scope.feedbackStats[feedback.variable].push(doc)
                        $scope.trackFeedback[doc][feedback.variable] += 1;
                    });
                }
                else{
                    if ($scope.feedbackStats[feedback.variable].indexOf(feedback.docList) == -1)
                        $scope.feedbackStats[feedback.variable].push(feedback.docList);
                    $scope.trackFeedback[$scope.gridData[$scope.active.docIndex].id][feedback.variable] += 1;
                }
            }
            else {
                showInfo("Feedback already present in the list!");
            }
        }

        $scope.addFeedbackDoc = function(classification) {

            var docClass = $scope.gridData[$scope.active.docIndex][$scope.active.variable].classification;
            var fClass = null;

            addFeedbackToList(new Feedback("TYPE_DOC", null, null,
                                        classification, $scope.active.variable,
                                        $scope.gridData[$scope.active.docIndex].id));
        }

        $scope.addFeedbackText = function(classification) {
            addFeedbackToList(new Feedback("TYPE_TEXT", $scope.feedbackText, null,
                                        classification, $scope.active.variable,
                                        $scope.gridData[$scope.active.docIndex].id));
            $scope.feedbackText = false;
        }

        $scope.addWordTreeFeedback = function(classification) {
            if ($scope.active.variable) {
                addFeedbackToList(new Feedback("TYPE_WORDTREE", $scope.wordTreeData.feedbackText,
                                        $scope.wordTreeData.spanText, classification,
                                        $scope.active.variable, $scope.wordTreeData.docList));
                $scope.feedbackText = false;
            }
        }

        $scope.removeFeedback = function(index) {

            var hidden_id = $scope.feedbackList[index].$hidden_id;

            backend.putLogEvent("removeFeedback", JSON.stringify($scope.feedbackList[index]));

            var feedback = $scope.feedbackList.splice(index, 1)[0];
            clearFeedbackTrack(feedback);

            $scope.feedbackList.forEach(function(feedback) {
                var i = feedback.conflictList.indexOf(hidden_id);
                if (i > -1) {
                    feedback.conflictList.splice(i, 1);
                }
            });
        }

        $scope.clearFeedback = function() {

            backend.putLogEvent("clearFeedback", "");

            while($scope.feedbackList.length > 0) {
                var feedback = $scope.feedbackList.pop();
                clearFeedbackTrack(feedback);
            }
        };

        function clearFeedbackTrack(feedback){
            if(Array.isArray(feedback.docList)){
                    feedback.docList.forEach(function(doc){
                        $scope.trackFeedback[doc][feedback.variable] -= 1;
                        if ($scope.trackFeedback[doc][feedback.variable] == 0)
                            $scope.feedbackStats[feedback.variable].pop(doc);
                    });
            }
            else{
                $scope.trackFeedback[feedback.docList][feedback.variable] -= 1;
                if ($scope.trackFeedback[feedback.docList][feedback.variable] == 0)
                    $scope.feedbackStats[feedback.variable].pop(feedback.docList);
            }
        }

        $scope.confirmFeedback = function(override) {

            if($scope.retrainData.loading == true){
                backend.putLogEvent("Error", "Re-training already in process!");    
                alert("Re-training already in process!");
            }
            else {
                setTimeout(function() {
                    $scope.sendFeedback(override);
                });
            }
        }

        $window.onbeforeunload = function(event) {
            if($scope.feedbackList.length > 0) {
                return "You have made unsaved changes. \
                    Would you still like to leave this page?";
            }
        }

        /*
         * WordTree
         */

        $scope.wordTreeData = new Object();
        $("#wordtree-input").val('');

        $scope.clearWordTree = function() {
            $("#wordtree-container").html('');
            $("#wordtree-input").val('');
            $("body").removeClass('highlight-flash');

            $scope.setSearchFilter(null);
            $scope.wordTreeData.matches = null;
            $scope.tabs.wordTreeView = false;
            backend.putLogEvent("WordTree", "InActive");
            $scope.clearWordTreeFeedback()
        }

        $scope.clearWordTreeFeedback = function() {
            $scope.wordTreeData.feedbackText = null;
            $scope.wordTreeData.spanText = null;
        }

        $scope.searchWordTree = function(query) {
            setTimeout(function() {
                $("#wordtree-input").val(query);
                $scope.loadWordTree();
            });
        }

        $scope.loadWordTree = function(){
            $scope.feedbackText = null;
            $scope.tabs.wordTreeView = true;

            var query = $("#wordtree-input").val().trim();

            if ($scope.active.dataset === undefined || query == "")
                return

            backend.putLogEvent("getWordTree", query);
            startLoading();

            backend.getWordTree($scope.active.dataset, query.toLowerCase()).then(function(data) {
                stopLoading();

                if(data.matchedList.length == 0) {
                    $("#wordtree-container").html('<p id="wordtree-empty"> \
                        No matches found! \
                    </p>');
                    $scope.setSearchFilter(null);
                    $scope.wordTreeData.feedbackText = null;
                    $scope.wordTreeData.matches = null;

                    backend.putLogEvent("getWordTree", "No matches found");

                    return;
                }

                $("#wordtree-container").empty();

                data.classificationName = $rootScope.config.classificationName;
                data.container = "#wordtree-container";
                data.popup = "#wordtree-popup";

                makeWordTree(data);

                $scope.setWordTreePercentage(data.matchedList.length, data.total);
                // $scope.wordTreeData.feedbackText = data.query;
                // $scope.wordTreeData.spanText = data.query
                $scope.active.wordTreeQuery = data.query;
                $scope.searchQuery = data.matchedList;
                // $scope.wordTreeData.docList = data.matchedList;

                $scope.setWordTreeFeedback(data.query, data.query, data.matchedList)
                $scope.updateWordTreeClass();

            }, function() { 
                backend.putLogEvent("Error", "Unable to fetch wordtree.");
                alert("Unable to fetch wordtree."); 
                stopLoading(); 
            });

        }

        $scope.setWordTreePercentage = function (matches, total) {
            $scope.wordTreeData.percentage = (100*matches/total).toFixed(2);
            $scope.wordTreeData.matches = matches;
            $scope.wordTreeData.total = total;
        }

        $scope.setWordTreeFeedback = function(selected, span, docs) {
            $scope.wordTreeData.feedbackText = selected.replace(/\s*\.$/, ""); //Remove trailing dot
            $scope.wordTreeData.spanText = span.replace(/\s*\.$/, "");
            $scope.wordTreeData.docList = docs;

            backend.putLogEvent("setWordTreeFeedback", {"text":selected, "span":span});

            $scope.setSearchFilter(docs);
            findWordTreeUsage();
        }

        $scope.wordTreeFullscreenButton = false;
        $scope.toggleWordTreeFullscreen = function() {
            $scope.wordTreeFullscreenButton = !$scope.wordTreeFullscreenButton;

            setTimeout(function() {
                // $scope.setWordTreeHeight();
                $("#wordtree-view").scrollTo('50%', {duration:1, axis:'x'});
            });

            // var w = window.open();
            // w.document.write( $("#wordtree-view").html() );
            // w.document.close(); //finish "loading" the page

        }

        $scope.updateWordTreeClass = function() {
            var variable = $scope.active.variable;

            if (!$scope.variableData || !variable)
                return;

            $scope.loadVarStats(variable);

            updateClassWordTree(variable,
                        $scope.variableData[variable]["docPositive"],
                        $scope.variableData[variable]["docNegative"]);

        }

        var searchResultApplier = null;

        function findWordTreeUsage(){
            if(!$scope.wordTreeData.docList || !$scope.gridData ||
                $scope.wordTreeFullscreenButton )
                return;

            if(!searchResultApplier)
                searchResultApplier = rangy.createClassApplier("highlight-flash");

            var id = $scope.wordTreeData.docList.sort()[0];
            var first = getGridIndexFromDocId(id);

            backend.putLogEvent("wordTreeLoadDoc", $scope.gridData[first].id);
            $scope.updateGrid($scope.active.variable, first, true);
        }

        function getGridIndexFromDocId(id) {
            if(!$scope.gridData || !id)
                return null;

            //TODO: Switch to binary search here
            for (var i=0; i < $scope.gridData.length; i++) {
                if ($scope.gridData[i].id === id) {
                    return i;
                }
            }

            return null;
        }

        /*
         * Re-train Results
         */

        $scope.retrainData = new Object();
        $scope.retrainData.message = null;
        $scope.retrainData.loading = false;
        $scope.retrainData.status = null;

        $scope.sendFeedback = function(override) {
            // alert('Re-training!');
            if($scope.retrainData.loading == true)
                return;

            $scope.retrainData.loading = true;

            $scope.feedbackList.sort(function(a, b) {
                var textA = a.kind;
                var textB = b.kind;
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            //assign ids to feedback list
            for (var i=0; i < $scope.feedbackList.length; i++) {
                $scope.feedbackList[i].$hidden_id = i.toString();
            }

            var activeVariable = $scope.active.variable;
            var activeDocIndex = $scope.active.docIndex;

            backend.putFeedback($scope.feedbackList, $scope.active.model,
                $scope.active.dataset, override)
                .then(function(data) {

                    if(data.status == "OK"){

                        backend.putLogEvent("putFeedback", "OK");

                        $scope.retrainData.message = data.latestModel;

                        assignDataToVars(data.gridVarData);

                        $scope.modelList = data.modelList;
                        $scope.active.model = data.latestModel;

                        $scope.retrainData.feedbackList = $.extend(true,[],$scope.feedbackList);

                        $scope.retrainData.status = "OK";

                        $scope.clearFeedback();
                    }
                    else if(data.status == "Error") {

                        backend.putLogEvent("putFeedback", "Error: " + JSON.stringify(data.errorList));

                        $scope.retrainData.message = data.errorList;
                        $scope.retrainData.status = "Error";

                        setConflictList(data.feedbackList);
                    }
                    else if(data.status == "Warning") {

                        backend.putLogEvent("putFeedback", "Warning: " + JSON.stringify(data.warningList));

                        $scope.retrainData.message = data.warningList;
                        $scope.retrainData.status = "Warning";

                        setConflictList(data.feedbackList);
                    }
                    else{
                        backend.putLogEvent("Error", "Invalid response for putfeedback");
                        alert("Sorry, something went wrong. Please report this.");
                    }

                    $scope.retrainData.loading = false;

                }, function() { 
                    backend.putLogEvent("Error", "Unable to send feedback.");
                    alert("Unable to send feedback."); 
                    $scope.retrainData.loading = false;
                    $scope.retrainData.status = "Fail";
                    $scope.retrainData.message ="Unable to send feedback!" 
                });
        };

        function setConflictList(list) {
            for (var i=0; i < list.length; i++) {
                $scope.feedbackList[i].status = list[i].status;

                if(list[i].conflictList)
                    $scope.feedbackList[i].conflictList = list[i].conflictList;
                else
                    $scope.feedbackList[i].conflictList = [];
            }
        }

        /*
         * Tabs
         */

        $scope.tabs = {docView: true, wordtreeView: false};

        // $scope.setWordTreeHeight = function(minusHeight) {
            // if($scope.wordTreeFullscreenButton)
            //     minusHeight = 50;
            // else
            //     minusHeight = 200;

            // // console.log( wordtree.offset().top);
            // $("#wordtree-view").height($(window).height() - minusHeight);
        // };

        // $($window).resize($scope.setWordTreeHeight(200));


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

                setTimeout(function() {
                    $('#modal ul').each(function () {
                        var pos = $(this).find(".selected").position();
                        // console.log(pos);
                        if(typeof pos != 'undefined')
                            $(this).scrollTop($(this).scrollTop() + pos.top - 60);
                    });
                });
            }
        };

        $scope.modal.confirm = function() {
            $scope.modal.isCollapsed = true;
            $scope.setSearchFilter(null);
            setModelAndDataset($scope.modal.selectedModel, $scope.modal.selectedDataset);
            $scope.tabs.wordTreeView = false;
        }

        $scope.resetDB = function(empty) {
            startLoading();
            $scope.modal.isCollapsed = true;
            backend.resetDB(empty)
                .then(function(data) {
                    stopLoading();

                    $scope.clearFeedback();
                    startSession();

                }, function() { 
                    alert("Oops. Something went wrong!"); 
                    stopLoading(); 
                });
        }

        /*
         * Feedback Context Menu
         */

        $scope.documentContextMenu = function() {
            var options = [];

            if (!($scope.active.variable && $scope.gridData))
                return options;

            var feedbackHeader = null;
            var feedbackFunction = null;
            var optionsExtra = [];

            if($scope.feedbackText) {
                feedbackHeader = '"' + truncateFilter($scope.feedbackText, 20) + '" indicates "' + $rootScope.config.variableMapping[$scope.active.variable] + '" to be:'
                feedbackFunction = $scope.addFeedbackText;
                optionsExtra = [
                    null,
                    ["Search using wordtree", function() { $scope.searchWordTree($scope.feedbackText) }]
                ];
            }
            else {
                feedbackHeader = 'Label "' + $rootScope.config.variableMapping[$scope.active.variable] + '" in #'+ $scope.gridData[$scope.active.docIndex].id + ":";
                feedbackFunction = $scope.addFeedbackDoc;
                optionsExtra = [];
            }

            if (feedbackHeader && feedbackFunction) {
                options = options.concat([
                    [feedbackHeader, null],
                    null,
                    [$rootScope.config.classificationName["positive"], function () {
                        feedbackFunction('positive');
                    }],
                    null,
                    [$rootScope.config.classificationName["negative"], function () {
                        feedbackFunction('negative');
                    }]
                ], optionsExtra);
            }

            return options;
        };

        // $scope.wordTreeContextMenu = function() {
        //     var options = [];

        //     if (!($scope.active.variable && $scope.gridData))
        //         return options;

        //     var feedbackHeader = null;
        //     var feedbackFunction = null;
        //     var optionsExtra = [];

        //     if($scope.wordTreeData.feedbackText) {
        //         feedbackHeader = '"' + truncateFilter($scope.wordTreeData.feedbackText, 20) + '" indicates "' + $rootScope.config.variableMapping[$scope.active.variable] + '" to be:'
        //         feedbackFunction = $scope.addWordTreeFeedback;
        //         optionsExtra = [
        //             null,
        //             ["Find usage", function() {
        //                 // console.log($scope.wordTreeData.spanText);

        //                 if(!$scope.wordTreeData.docList)
        //                     return;

        //                 var id = $scope.wordTreeData.docList.sort()[0];
        //                 var first = null;

        //                 for (var i=0; i < $scope.gridData.length; i++) {
        //                     if ($scope.gridData[i].id === id) {
        //                         first = i;
        //                         break;
        //                     }
        //                 }

        //                 //TODO: Use rangy here!
        //                 $scope.updateGrid($scope.active.variable, first, function(){
        //                     $("#grid-table").scrollTo($("#grid-table .selected"), 500)

        //                     var search = $scope.wordTreeData.spanText.replace(/\s*\.$/, "");
        //                     //object.find ([textToFind [, matchCase[, searchUpward[, wrapAround[, wholeWord[, searchInFrames[, showDialog]]]]]]]);
        //                     //Experimental: Works only on Chrome/Firefox/Safari
        //                     //TODO: This is a HACK!
        //                     setTimeout(function() {
        //                         //Search in reverse order; This will always find what we want.
        //                         $window.find(search, false, true, true, false, true, false);
        //                     });

        //                 });

        //             }]
        //         ];
        //     }
        //
        //     if (feedbackHeader && feedbackFunction) {
        //         options = options.concat([
        //             [feedbackHeader, null],
        //             null,
        //             [$rootScope.config.classificationName["positive"], function () {
        //                 feedbackFunction('positive');
        //             }],
        //             null,
        //             [$rootScope.config.classificationName["negative"], function () {
        //                 feedbackFunction('negative');
        //             }]
        //         ], optionsExtra);
        //     }

        //     return options;
        // }

        /*
         * Misc.
         */

        function showInfo (notice){
            $scope.appInfo = notice;

            setTimeout(function() {
              $scope.appInfo = false;
              $scope.$digest();
            }, 1500);
        }

        // Loading
        $scope.loaderCount = 0;
        $scope.appDisabled = false;

        function startLoading() {
            $scope.loaderCount += 1;
        }

        function stopLoading() {
            if ($scope.loaderCount > 1)
                $scope.loaderCount -= 1;
            else
                $scope.loaderCount = 0;
        }

        $scope.keypressCallback = function($event, reverse) {
            if (! $($event.explicitOriginalTarget).is("input")){
                $scope.gotoNextDoc(reverse);
                $event.preventDefault();
            }
        };


        /*
         * Sorting
         */

        function variableCompare(variable) {
            return function(a, b) {
                var diff = a[variable].confidence - b[variable].confidence;

                if(diff === 0)
                    return parseInt(a.id) - parseInt(b.id);
                else
                    return diff
            }
        }

        function idCompare() {
            return function(a, b) {
                return parseInt(a.id) - parseInt(b.id);
            }
        }

        $scope.sortGridObject = function(variable, reverse) {
            if(!$scope.gridData)
                return

            if($rootScope.config.variables.indexOf(variable) !== -1) {
                $scope.gridData.sort(variableCompare(variable));
                $scope.active.sort.variable = variable;
            }
            else {
                $scope.gridData.sort(idCompare());
                $scope.active.sort.variable = "id";
            }

            if(reverse){
                $scope.gridData.reverse();
                $scope.active.sort.reverse = true;
            }
            else{
                $scope.active.sort.reverse = false;
            }

            $scope.updateGrid(variable, $scope.active.docIndex, true);

        }

        return true;
    }])
