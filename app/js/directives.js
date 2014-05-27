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
        }
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  }]);
