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

.directive('highlightedReport', [ function() {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function (scope, element) {

            scope.highlight = function(data) {
                element.text(data);

                $(element).highlight(/ascending/gi, "highlight positive")
                .highlight(/colonoscopy/gi, "highlight negative")
                .highlight(/.*\:/gi, "dim")
                .highlight(/S_O_H\s\SE_O_H/gi, "dim")
                .highlight(/De-ID.*S_O_H/gi, "dim")
                .highlight(/.*E_O_H/gi, "dim")
                .highlight(/\[Report de-identified.*/gi, "dim")
                .highlight(/\*\*.*/gi, "dim")
                .highlight(/E_O_R/gi, "dim");
            };

            scope.$watch('data', function(){
                    scope.highlight(scope.data);
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
                     .style("font-size", "90%")
                     .attr("class", function(d) { return d.data.classification+"-label" + " d3-tip"; })
                     .text(function(d) { return "(" + d.data.count + ")"; });


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
}])

