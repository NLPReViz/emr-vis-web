'use strict';

/* Services */

angular.module('myApp.services', [])
    .factory('backend', function($http) {
    return {
        getVarDatasetList: function() {
            return $http.get('@@backEndApp/rest/server/getVarDatasetList/')
                       .then(function(result) {
                            return result.data;
                        });
        },
        getGridData: function(model, dataset) {
            return $http.get("@@backEndApp/rest/server/getVarGridObj/" + model +".xml/" + dataset + ".xml")
                       .then(function(result) {
                            return result.data;
                        });
        },
        getReport: function(report) {
            return $http.get("@@backEndApp/rest/server/getReport/" + report)
                       .then(function(result) {
                            return result.data;
                        });
        },
        getWordTree: function(dataset, query) {
            return $http.get('@@backEndApp/rest/server/getWordTree/' + dataset + ".xml/" + query)
                       .then(function(result) {
                            return result.data;
                        });
        }
    }
});
