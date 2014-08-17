'use strict';

/* Services */
/* app/js/services.js is automatically generated from config/services.js.
It would be overwritten when the grunt task is run */

angular.module('myApp.services', [])
    .factory('backend', function($http, $q) {
    return {
        getVarDatasetList: function() {
            return $http.get('@@backEndApp/getVarDatasetList/')
                       .then(function(result) {
                            return result.data;
                        });
        },
        getGridData: function(model, dataset) {
            if(typeof this.gridDataCanceler != 'undefined')
                this.gridDataCanceler.resolve();

            this.gridDataCanceler = $q.defer();
            return $http.get("@@backEndApp/getVarGridObj/" + model + ".xml/" + dataset + ".xml",
                            {timeout: this.gridDataCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        });
        },
        getReport: function(report) {
            if(typeof this.reportCanceler != 'undefined')
                this.reportCanceler.resolve();

            this.reportCanceler = $q.defer();
            return $http.get("@@backEndApp/getReport/" + report, 
                            {timeout: this.reportCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        });
        },
        getWordTree: function(dataset, query) {
            if(typeof this.wordTreeCanceler != 'undefined')
                this.wordTreeCanceler.resolve();

            this.wordTreeCanceler = $q.defer();
            return $http.get('@@backEndApp/getWordTree/' + dataset + ".xml/" + query, 
                            {timeout: this.wordTreeCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        });
        },
        putFeedback: function(feedbackList, model, dataset, override) {
            var uri = "@@backEndApp/putFeedback/";
            
            if(override)
                uri = "@@backEndApp/putFeedbackOverride/";

            return $http.put(uri + model + ".xml/" + dataset + ".xml", 
                            angular.toJson(feedbackList))
                        .then(function(result) {
                            return result.data;
                        });
        }
    }
});
