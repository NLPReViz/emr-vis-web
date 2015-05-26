'use strict';

/* Services */
/* app/js/services.js is automatically generated from config/services.js.
It would be overwritten when the grunt task is run */

angular.module('myApp.services', [])
.factory('backend', ['Base64', '$cookieStore', '$http', '$q', function (Base64, $cookieStore, $http, $q) {

    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');

    function checkResponse(response) {
        if(response.status == 401)
            alert("Invalid username or password!");
    }

    return {
        getVarDatasetList: function() {
            return $http.get('@@backEndApp/getVarDatasetList/')
                       .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },
        getGridData: function(model, dataset) {
            if(typeof this.gridDataCanceler != 'undefined')
                this.gridDataCanceler.resolve();

            this.gridDataCanceler = $q.defer();
            return $http.get("@@backEndApp/getVarGridObj/" + model + ".xml/" + dataset + ".xml",
                            {timeout: this.gridDataCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },
        getReport: function(report) {
            if(typeof this.reportCanceler != 'undefined')
                this.reportCanceler.resolve();

            this.reportCanceler = $q.defer();
            return $http.get("@@backEndApp/getReport/" + report, 
                            {timeout: this.reportCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },
        getWordTree: function(dataset, query) {
            if(typeof this.wordTreeCanceler != 'undefined')
                this.wordTreeCanceler.resolve();

            this.wordTreeCanceler = $q.defer();
            return $http.get('@@backEndApp/getWordTree/' + dataset + ".xml/" + query, 
                            {timeout: this.wordTreeCanceler.promise})
                        .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },
        putFeedback: function(feedbackList, model, dataset, override) {
            var uri = "@@backEndApp/putFeedback/";
            
            if(override)
                uri = "@@backEndApp/putFeedbackOverride/";

            return $http.put(uri + model + ".xml/" + dataset + ".xml", 
                            JSON.stringify(appCtrl.feedbackList, ["kind", "selected", "span", "classification", "variable", "docList"]))
                        .then(function(result) {
                            return result.data;
                        }, function(response){
                            checkResponse(response);
                            return $q.reject(response);
                        }
            );
        },
        logout: function () {
            document.execCommand("ClearAuthenticationCache");
            $cookieStore.remove('authdata');
            $http.defaults.headers.common.Authorization = 'Basic ';
        },
        login: function(username, password) {            
            var encoded = Base64.encode(username + ':' + password);
            $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
            $cookieStore.put('authdata', encoded);
        },
        checkLogin: function() {            
            return $http.get("@@backEndApp/login/")
                        .then(function(result) {
                            return result.data;
                        }
            );
        },
        getUserName: function(){
            var data = $cookieStore.get('authdata');
            if(data) 
                return Base64.decode(data).split(":")[0];
            else
                return null;
        },
        resetDB: function(empty){
            var uri = "@@backEndApp/resetDB/";
            
            if(empty)
                uri = "@@backEndApp/resetDBEmpty/";

            return $http.get(uri)
                        .then(function(result) {
                            return result.data;
                        }
            );
        },
        putLogEvent: function(event_name, message){
            var uri = "/emr-nlp-server/rest/server/logEvent/";
            return $http.put(uri + event_name, message);
        }
    };
}])

//http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
});
