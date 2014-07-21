'use strict';

/* Services */

angular.module('myApp.services', [])
    .factory('backend', function($http) {
    return {
        getVarDatasetList: function() {
            return $http.get('@@backEndApp/getVarDatasetList/')
                       .then(function(result) {
                            return result.data;
                        });
        },
        getGridData: function(model, dataset) {
            return $http.get("@@backEndApp/getVarGridObj/" + model + ".xml/" + dataset + ".xml")
                       .then(function(result) {
                            return result.data;
                        });
        },
        getReport: function(report) {
            return $http.get("@@backEndApp/getReport/" + report)
                       .then(function(result) {
                            return result.data;
                        });
        },
        getWordTree: function(dataset, query) {
            return $http.get('@@backEndApp/getWordTree/' + dataset + ".xml/" + query)
                       .then(function(result) {
                            return result.data;
                        });
        },
        putFeedback: function(feedbackList, model, dataset) {
            //ignore dataset for now
            return $http.put("@@backEndApp/putFeedback/" + model + ".xml", angular.toJson(feedbackList))
                        .then(function(result) {
                            return result.data;
                        });
        }
    }
});
