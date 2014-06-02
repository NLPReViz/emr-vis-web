'use strict';

/* Directives */


angular.module('myApp.directives', [])
  .directive('horizontalSplitter', ['$document', function($document) {
    return function(scope, element, attr) {
      var startY = 0, y = 0;

      if(!angular.isFunction($(element).offset)) {
        throw new Error('Need jquery!');
      }

      var topMin = 0.1*$(element).prev().height();
      var bottomMin = 0.1*$(element).next().height();

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startY = event.pageY;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        startY = event.pageY;

        //revise height for prev div
        var topHeight = $(element).prev().height() + y;

        //revised height for next div 
        var bottomHeight = $(element).next().height() - y; 

        if(topHeight > topMin && bottomHeight > bottomMin){
            $(element).prev().height(topHeight); 
            $(element).next().height(bottomHeight);
            $("#sidebar-top").trigger('heightChange'); 
        }
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  }])
 
  .directive('highlightReport', ['$document', function($document) {

    function link(scope, element, attr) {
        console.log("I was called");
        element.text(scope.reportText);
        $(element).highlight(/ascending/gi, "highlight positive")
                .highlight(/colonoscopy/gi, "highlight negative")
                .highlight(/.*\:/gi, "dim")
                .highlight(/S_O_H\s\SE_O_H/gi, "dim")
                .highlight(/De-ID.*S_O_H/gi, "dim")
                .highlight(/.*E_O_H/gi, "dim")
                .highlight(/\[Report de-identified.*/gi, "dim")
                .highlight(/\*\*.*/gi, "dim")
                .highlight(/E_O_R/gi, "dim");
    }

    return {
      link: link
    };
  }]);

