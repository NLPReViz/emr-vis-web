// 'use strict';

/* Directives */


angular.module('myApp.directives', [])
.directive('horizontalSplitter', ['$document', function($document) {
    return function(scope, element, attr) {
        var start = 0, cursor_offset = 0

        if(!angular.isFunction($(element).offset)) {
            throw new Error('Need jquery!');
        }

        var topHeight = 0, bottomHeight = 0, y = 0;

        var minTop = 0.1*$(element).prev().height();
        var minBottom = 0.1*$(element).next().height();

        element.on('mousedown', function(event) {
            // Prevent default dragging of selected content
            event.preventDefault();
            
            cursor_offset = event.pageY - $(element).position().top;
            start = event.pageY;

            topHeight = $(element).prev().height();
            bottomHeight = $(element).next().height();

            $document.on('mouseup', mouseup);
            $document.on('mousemove', mousemove);

            scope.appDisabled = true;
            scope.$apply();
        });

        function mousemove(event) {
            var delta = event.pageY - start;

            if( (topHeight + delta) > minTop && 
                    (bottomHeight - delta) > minBottom)
            {
                $("#sidebar-resize-indicator").css({ top: event.pageY - cursor_offset });
                y = delta
            }
        }

        function mouseup() {
            $(element).prev().height(topHeight + y); 
            $(element).next().height(bottomHeight - y);
            y = 0;

            $("#sidebar-top").trigger('heightChange'); 
            
            $("#sidebar-resize-indicator").css({ top: "-9999px" });

            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);

            scope.appDisabled = false;
            scope.$apply();
        }
    };
}])

.directive('highlightedReport', [ function() {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            posTerms: '=',
            negTerms: '=',
        },
        link: function (scope, element, attrs) {

                // console.log(scope.posTerms);
                // console.log(scope.negTerms);

                scope.highlightTerms = function(posTerms, negTerms) {

                    element.text(scope.data);

                    $(element).highlight(/S_O_H[\s\S]*E_O_H/, "dim") // header
                        .highlight(/De-ID.*reserved./i, "dim") //copright
                        .highlight(/\[Report de-identified.*/i, "dim") //De-ID
                        .highlight(/\*\* Report Electronically Signed Out \*\*/, "dim") //Pathology template
                        .highlight(/My signature is attestation[\s\S]*reflects that evaluation./, "dim") //Pathology template
                        .highlight(/E_O_R/, "dim") //End of report
                        .highlight(/\*\*[A-Z\ ,-\[\]\.]*/g, "dim") //DE-IDed Names
                        .highlight(/[A-Z\-\ #]*\:/g, "dim"); //Colon fields

                    posTerms.forEach( function(keyword) {
                        keyword.matchedList.forEach(function (string) {
                            $(element).highlight(new RegExp("\\b"+string+"\\b","gi"), "highlight positive", keyword.term);
                            // console.log(string);
                        });
                    });

                    negTerms.forEach( function(keyword) {
                        keyword.matchedList.forEach(function (string) {
                            $(element).highlight(new RegExp("\\b"+string+"\\b","gi"), "highlight negative", keyword.term);
                            // console.log(string);
                        });
                    });
                };
        
                scope.$watch('[posTerms, negTerms]', function(){
                    scope.highlightTerms(scope.posTerms, scope.negTerms);
                }, true);
        }
    };
}])

.directive( 'd3Distchart', [  function () {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function (scope, element) {

                // var margin = {top: 10, right: 20, bottom: 30, left: 10},
                // width = 170 - margin.left - margin.right,
                // height = 170 - margin.top - margin.bottom,
                // radius = Math.min(width, height) / 2;

                var margin = {top: 10, right: 20, bottom: 30, left: 35},
                width = 150 - margin.left - margin.right,
                height = 95 - margin.top - margin.bottom;

                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(3, "%");

                var svg = d3.select(element[0])
                              .append("svg")
                                .attr('width', width + margin.left + margin.right)
                                .attr('height', height + margin.top + margin.bottom)
                              .append("g")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

                function type(d) {
                    d.count = +d.count;
                    return d;
                }

                //Render graph based on 'data'
                scope.render = function(data) {
                    if(data != null){

                        svg.selectAll('g').remove();
                        svg.selectAll(".bar").remove();

                        x.domain(data.map(function(d) { return d.name; }));
                        y.domain([0, d3.max(data, function(d) { return d.count; })]);

                        svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis);

                        svg.append("g")
                          .attr("class", "y axis")
                          .call(yAxis)
                        .append("text")
                          .attr("transform", "rotate(-90)")
                          .attr("y", 0)
                          .attr("dy", "-2.75em")
                          .style("text-anchor", "end")
                          .text("Count");

                        svg.selectAll(".bar")
                          .data(data)
                        .enter().append("rect")
                          .attr("class", function(d) { return "bar " + d.classification; })
                          .attr("x", function(d) { return x(d.name) + margin.left/4;})
                          .attr("width", "10")
                          .attr("y", function(d) { return y(d.count); })
                          .attr("height", function(d) { return height - y(d.count); })


                    }
                };

                //Watch 'data' and run scope.render(newVal) whenever it changes
                //Use true for 'objectEquality' property so comparisons are done on equality and not reference
                scope.$watch('data', function(){
                    scope.render(scope.data);
                }, true);
            }
    };
}])

//From http://nadeemkhedr.wordpress.com/2014/01/03/angularjs-scroll-to-element-using-directives/
.directive('scrollToBookmark', function() {
    return {
      link: function(scope, element, attrs) {
        var value = attrs.scrollToBookmark;
        element.bind("click", function(e){
          scope.$apply(function() {
            var selector = "[scroll-bookmark='"+ value +"']";
            var element = $(selector);

            if(element.length){
                $('html, body').animate({scrollTop: $(element).offset().top - 100}, 1000);
                $(element).addClass("flash");
                setTimeout(function () { 
                    $(element).removeClass('flash');
                }, 2000);
            }
          });
        });
      }
    };
})