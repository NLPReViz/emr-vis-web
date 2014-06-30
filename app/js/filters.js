'use strict';

/* Filters */

angular.module('myApp.filters', [])
  .filter('truncate', function () {
        // jsfiddle.net/tUyyx/
        return function (string, length, end) {

            if(!string)
                return;

            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (string.length <= length || string.length - end.length <= length) {
                return string;
            }
            else {
                return String(string).substring(0, length-end.length) + end;
            }

        };
    })
    .filter('inArray', function() {
        return function inArray( haystack , needle ) {
            if (!haystack)
                return

            if (!needle)
                return haystack;

            var result = [];
            var item,i;
            for (i=0; i< haystack.length;i++) {
                item = haystack[i];
                if (needle.indexOf(item.id) !== -1)
                  result.push(item);
            };
            return (result);
        };
    });