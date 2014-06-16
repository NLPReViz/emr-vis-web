'use strict';

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
                            $(element).highlight(new RegExp("\\b"+string+"\\b","gi"), "highlight positive");
                            // console.log(string);
                        });
                    });

                    negTerms.forEach( function(keyword) {
                        keyword.matchedList.forEach(function (string) {
                            $(element).highlight(new RegExp("\\b"+string+"\\b","gi"), "highlight negative");
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

.directive( 'd3Piechart', [  function () {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function (scope, element) {
                var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 170 - margin.left - margin.right,
                height = 170 - margin.top - margin.bottom,
                radius = Math.min(width, height) / 2;

                var svg = d3.select(element[0])
                              .append("svg")
                                .attr('width', width + margin.left + margin.right)
                                .attr('height', height + margin.top + margin.bottom)
                              .append("g")
                                .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")")

                var arc = d3.svg.arc()
                            .outerRadius(radius - 10)
                            .innerRadius(0);

                var pie = d3.layout.pie()
                            .sort(null)
                            .value(function(d) { return d.count; });

                //Render graph based on 'data'
                scope.render = function(data) {
                    if(data != null){
                        data.forEach(function(d) {
                            d.count = +d.count;
                        });

                        svg.selectAll('.arc').remove();

                        var g = svg.selectAll(".arc")
                                    .data(pie(data))
                                  .enter().append("g")
                                    .attr("class", "arc")
                                    .on("mouseover", function(d) { g.select(".d3-tip").style("opacity", "1");})
                                    .on("mouseout", function(d) { g.select(".d3-tip").style("opacity", "0");});

                        g.append("path")
                            .attr("d", arc)
                            .attr("class", function(d) { return d.data.classification; })
                            
                        g.append("text")
                            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                            .attr("dy", "0em")
                            .style("text-anchor", "middle")
                            .attr("class", function(d) { return d.data.classification+"-label"; })
                            .text(function(d) { if (d.data.count > 0) return d.data.name; });

                        g.append("text")
                         .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                         .attr("dy", "1.15em")
                         .style("text-anchor", "middle")
                         .attr("class", function(d) { return d.data.classification+"-label" + " d3-tip"; })
                         .text(function(d) { return "(" + d.data.count + ")"; });
                    }

                    // //Animate bars
                    // bars.transition()
                    //     .duration(1000)
                    //     .attr('height', function(d) { return height - y(d.count); })
                    //     .attr("y", function(d) { return y(d.count); })
                };

                //Watch 'data' and run scope.render(newVal) whenever it changes
                //Use true for 'objectEquality' property so comparisons are done on equality and not reference
                scope.$watch('data', function(){
                    scope.render(scope.data);
                }, true);
            }
    };
}]);
