'use strict';

/* Filters */

angular.module('myApp.filters', [])
  .filter('docFilter', function(){

    return function(input, query){
      if(!query) return input;
      var result = [];

      angular.forEach(input, function(doc){
        if(doc.id.indexOf(query) !== -1)
          result.push(doc);          
      });
      return result;
    };
  });
