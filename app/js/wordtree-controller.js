/** Computes the hierarchical word tree data structure from the given data
    then calls {@link #drawWordTree}. Uses the wordtree Javascript library in 
    lib/wordtree.js

    @param {WordSeer.view.visualize.wordtree.WordTree} the WordTree view into
    which to render the tree.
    @param {String} query The root query, the root of the tree.
    @param {Object} concordance An object with 'left' and 'right' fields, which
    contain a list of sentence fragments that occurred to the left and right of
    the search query.
*/

/*
 * All the world is programmable, and codes merely hacks!
 */

var WordTreeData = {};
WordTreeData.doc_class = new Object();
WordTreeData.doc_class.variable = null;
WordTreeData.doc_class.positive = [];
WordTreeData.doc_class.negative = [];
WordTreeData.vis = null;

/*
 * Functions exposed to appCtrl:
 * - updateAppCtrlWordTree
 * - updateClass
 * - makeWordTree
 */

function updateAppCtrlWordTree(selected, span) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;
    
    setTimeout(function() {
        appCtrl.$apply(function(){
          appCtrl.setWordTreeFeedback(selected, span, WordTreeData.filterDocs); 
          appCtrl.setWordTreePercentage(WordTreeData.filterDocs.length, WordTreeData.total); 
        }); 
    }, duration);
}

function updateClassWordTree(variable, positive, negative) {
    // console.log(variable);
    // console.log(positive);
    // console.log(negative);

    WordTreeData.doc_class.variable = variable;
    WordTreeData.doc_class.positive = positive;
    WordTreeData.doc_class.negative = negative;

    if(WordTreeData.vis) {
      updateGradients("left");
      updateGradients("right");
    }
}

function makeWordTree(data){
  
    WordTreeData.total = data.total;
    WordTreeData.matchedList = data.matchedList;
    WordTreeData.query = data.query;
    WordTreeData.filterDocs = data.matchedList;
    WordTreeData.classificationName = data.classificationName;
    WordTreeData.container = data.container;
    WordTreeData.popup = data.popup;
    WordTreeData.sentences = new Object();

    var detail = 100;

    for(var i = 0; i < data.lefts.length; i++){
        data.lefts[i].sentence = data.lefts[i].sentence.reverse();
        WordTreeData.sentences[data.lefts[i].id] = {"doc": data.lefts[i].doc,
                                                    "left": data.lefts[i].sentence, 
                                                    "right": data.rights[i].sentence}
    }

    var rightTree = makeWordTreeDataStructure(data.rights, data.query, detail, "right");
    var leftTree = makeWordTreeDataStructure(data.lefts, "", detail, "left");
    
    var w = $('body').innerWidth(),
    canvasWidth = w*10,
    h = $(document).height();

    // var containerClass = 'wordtree-container-class';
    // $(WordTreeData.container).addClass(containerClass);  

    var m = [20, 120, 20, canvasWidth/2];

    // Get ready to draw the word tree by emptying this container and adding
    // a new empty SVG container.
    $(WordTreeData.container).html("");
    var svg =  d3.select(WordTreeData.container).append("svg:svg")
           .attr("width", canvasWidth)
           .attr("height", h)
    WordTreeData.vis = svg.append("svg:g")
            .style("fill", "white")
           .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    panel = $(WordTreeData.container);
    WordTreeData.vis.panel = panel;

    // Calculate the dimensions of this Word Tree depending on the container
    // width and height, and the number of total branches.
    WordTreeData.vis.m =m;
    WordTreeData.vis.svg = svg;
    WordTreeData.vis.w = w - WordTreeData.vis.m[1] - WordTreeData.vis.m[3];
    WordTreeData.vis.h = h - WordTreeData.vis.m[0] - WordTreeData.vis.m[2];
    WordTreeData.vis.maxVisibleBranches = Math.max(leftTree.children.length, 
        rightTree.children.length);
    
    WordTreeData.vis.leftData = leftTree;
    WordTreeData.vis.rightData = rightTree;
    WordTreeData.vis.maxWordTreeNodeID = 0;

    // WordTreeData.vis.container = $(WordTreeData.container);
    WordTreeData.vis.wordtreeID = (new Date()).getTime();
    WordTreeData.vis.orientationFilterDepth = {left: 0, right: 0};

    this.drawTree(leftTree, "left", w, h, panel)
    this.drawTree(rightTree,"right", w, h, panel)
}


/*
 * Private functions
 */

/** Draws a WordTree.
    @param {Object} data The hierarchical data structure containing the word 
    tree. Each node (including the root) has the following fields:
        - {Number} x0, y0, x, y Positions
        - {Number} count The number of sentences under this node.
        - {Number} id The identifier of this node.
        - {Boolean} isRoot Whether or not this node is the root.
        - {Number} depth The depth of this node.
        - {Array} ids The node ids of this node.
        - {Array} children The list of visible children of this node.
        - {Array} all_chilren The list of children of htis node
        - {Array} hidden_chilren a list of hidden children of this node. 
        - {String} key The word or word sequence at this node.
        - {Boolean} expanded Whether or not this node is visible
        - {Boolean} selected Whether or not this node was selected for expansion
        by the user. 
    @param {String} orientation "left" or "right", the side of the tree 
    currently being drawn
    @param {WordSeer.view.visualize.wordtree.WordTree} the view in which the
    wordtree is currently being drawn.
*/
function drawTree(data, orientation, width, height){
    root = data;
    root.isRoot = true;
    if(orientation == "left"){
        WordTreeData.vis.leftData = root
    }else{
        WordTreeData.vis.rightData = root
    }

    WordTreeData.vis.selectedIDs = [];
    WordTreeData.vis.selectedNodeIDs = {left:[], right:[]};
    WordTreeData.vis.selectedNodes = {left: [], right: []};
    
    // Initialize the display to show only one level of nodes.
    root.children.forEach(function(child){
        toggleAll(child) // turn off all children of children
    });

    // A function that calculates the total height of the tree, depending
    // on the number of visible branches.
    WordTreeData.vis.treeHeight = function(){
        var vis = this;
        var treeHeight = 20*WordTreeData.vis.maxVisibleBranches;
        var svgHeight = Math.max(treeHeight+WordTreeData.vis.m[0], 100);
        WordTreeData.vis.svg.attr("height", svgHeight);
        WordTreeData.vis.h = svgHeight;
        return treeHeight
    }

    // Initalize the tree layout algorithm from the D3 visualization library.
    WordTreeData.vis.tree_layout = d3.layout.tree()
                        .size([WordTreeData.vis.treeHeight(), WordTreeData.vis.w])
                        .sort(function(a, b){ return b.count - a.count;})
                        .separation(function(a, b){ return fontSize(a)+fontSize(b)/2});

    WordTreeData.vis.diagonal = d3.svg.diagonal()
                    .projection(function(d) {return [d.y, d.x]; });
    
    updateWordTreeNode(root, orientation, root);
}

/** Calculates the font size of a node based on how many sentences are below it.
    @param {Object} d The node whose font size to calculate.
*/
function fontSize(d){
    if(d.isRoot){
        return 30
    }else{
        return Math.min(20, 2*Math.sqrt(d.count)+7)
    }
}

/** Calculates the width of a node.
    @param {Object} d The node whose width to calculate.
*/
function width(d){
    return fontSize(d) * d.key.length * 0.7
}


var getPositiveOffset = function(d) {
  if (WordTreeData.doc_class.variable == null){
    d.hoverPos = 0;
    d.hoverNeg = 0;
    return 0.5;
  }

  if (!d.isRoot)
    docs = d.docs;
  else
    docs = WordTreeData.matchedList;

  var pos = 0;
  var neg = 0;

  for (var i=0; i < WordTreeData.filterDocs.length; i++) {
    if (docs.indexOf(WordTreeData.filterDocs[i]) > -1){
      if (WordTreeData.doc_class.positive.indexOf(WordTreeData.filterDocs[i]) > -1)
        pos++;
      else if (WordTreeData.doc_class.negative.indexOf(WordTreeData.filterDocs[i]) > -1)
        neg++;
    }
  }

  if ((neg+pos) == 0){
    d.hoverPos = 0;
    d.hoverNeg = 0;
    return 0.5;
  }

  d.hoverPos = pos;
  d.hoverNeg = neg;

  return (pos/(pos+neg));
}

function updateGradients(orientation) {
  //Update gradients
    WordTreeData.vis.selectAll("g.node"+"."+orientation).select("defs").select("stop")
      .attr("offset", getPositiveOffset)
}

/** Called after any change to the word tree or when it's first rendered. 
    Recursively moves nodes to their positions, and shows and hides them 
    depending on whether they are expanded or not.
    @param {Object} source The parent node.
    @param {String} orientation Either 'left' or 'right' -- which tree we're
    drawing.
    @param {Object} root The root of this tree
    @param {SVGElement} vis The SVG element that is being drawn into.
 */

function updateWordTreeNode(source, orientation, root) {
    var diagonal = WordTreeData.vis.diagonal;
    var sign = (orientation == "left")?-1:1;
    var duration = d3.event && d3.event.altKey ? 5000 : 500;
    
    // Compute the new tree layout. Calculate the number of visible nodes
    // and place the root at the center.
    root.x0 = Math.min(WordTreeData.vis.treeHeight()/2, 150);
    root.y0 = 0;
    
    // Hierarchially compute new x and y values for each node in the tree
    // using the D3 visualization library.
    WordTreeData.vis.tree_layout.size([WordTreeData.vis.treeHeight(), WordTreeData.vis.w]);
    var nodes = WordTreeData.vis.tree_layout.nodes(root);  


    // Normalize for the length of the longest strings, and 
    // move the root to the top of its child tree instead of
    // the center.
    calculateDepths(root, sign);

    // Correct positions for left-right orientation
    if(orientation == "left"){
      nodes.forEach(function(d){
          d.y = -d.y; 
          if(d.isRoot){
              WordTreeData.vis.leftData = d
          }
        })
    }else{
      nodes.forEach(function(d){
          if(!d.isRoot){
              d.y = d.y-50;
          }else{
              WordTreeData.vis.rightData = d;
          }
        })
    }
    // Update the visualization to reflect the new node positions.
    var node = WordTreeData.vis.selectAll("g.node"+"."+orientation)
      .data(nodes, function(d) {
          // If the nodes don't have ID's assign them id's.
          return d.id || (d.id = ++WordTreeData.vis.maxWordTreeNodeID);
      });

    // Start any newly-appearing nodes at the parent's previous position.
    var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node "+orientation)
      .attr("transform", function(d) { 
          return "translate(" + source.y0 + "," + source.x0 + ")"; 
        })
      .on("click", function(d){ 
        wordTreeNodeClick(node, d, orientation, root /*, "click"*/) 
      })
      // .on("contextmenu", function(d){
      //        d3.event.preventDefault();
      //        WordTreeData.vis.panel.fireEvent('nodecontextmenu', 
      //            this, d,orientation, root, "contextmenu");
      // })
      .on("mouseover", function(d){
            wordTreeNodeMouseOver(node, d, orientation, root, "mouseover")
      })
      .on("mouseout", function(d){
          wordTreeNodeMouseOut(node, d, orientation, root, "mouseout")
      });

    var padding = 5;
    var getNodeClasses = function(d) {
        var childrenState = d.all_children.length > 0? 'tree':'leaf'
        var filteredState = "";
        if(WordTreeData.vis.selectedNodeIDs[orientation].contains(d.id)){
            filteredState = " selected";
        }
        var sentenceIDs = "";
        var docIDs = "";
        
        if (d.ids) {
          for (var i = 0; i < d.ids.length; i++) {
              sentenceIDs += " wordtree-"+WordTreeData.vis.wordtreeID+"-sentence-"+d.ids[i]; //TODO add wordtree id 2012-07-23 11:45 GMT-7
          }
          for (var i = 0; i < d.docs.length; i++) {
              docIDs += " wordtree-doc-"+d.docs[i];
          }
        }
        
        var classes = childrenState + filteredState + sentenceIDs + docIDs;
        return classes;
    }

    // var color = d3.interpolateLab("#008000", "#c83a22");

    var gradient = nodeEnter.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", function(d){return "gradient-"+d.id+"-wordtree-"+WordTreeData.vis.wordtreeID})
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

    gradient.append("svg:stop")
            .attr("offset", 0)
            .attr("stop-color", "#388db8")
            .attr("stop-opacity", 1);
 
    gradient.append("svg:stop")
            .attr("offset", 0)
            .attr("stop-color", "#e76835")
            .attr("stop-opacity", 1);

    nodeEnter.append("svg:text")
      .attr("x", function(d) { 
          if(d.isRoot){
              return 0
          }else{
             return orientation == "left"? -padding/2:padding/2;
          }
        })
      .attr("fill", "black")
      .attr("dy", ".35em")
      .attr("id", function(d){return "text-"+d.id+"-wordtree-"+WordTreeData.vis.wordtreeID})
      .attr("text-anchor",function(d){
              return orientation=="left"?"end":"start"
      })
      .attr("class", getNodeClasses)
      // .style("fill", function(d) { return color(d.t); })
      .style("fill", function(d) { return "url(#gradient-"+d.id+"-wordtree-"+WordTreeData.vis.wordtreeID+")"; })
      .text(function(d) { return d.key; })
      .style("fill-opacity", 1e-6)
      .attr("font-size", fontSize);

    updateGradients(orientation);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    nodeUpdate.select("text")
        .attr("class", getNodeClasses)
      .style("fill-opacity", 1);
    
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();
    nodeExit.select("text")
      .style("fill-opacity", 1e-6);
    
    // Update the links between nodes.
    var link = WordTreeData.vis.selectAll("path.link."+orientation)
      .data(WordTreeData.vis.tree_layout.links(nodes), function(d) { return d.target.id; });
    
    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
      .attr("class", "link "+orientation)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", ".5px")
      .attr("d", function(d) {
        var bbox = d3.select("#text-"+source.id+"-wordtree-"+WordTreeData.vis.wordtreeID)[0][0].getBBox();
        var o = {x: source.x0, y: source.y0+((padding+bbox.width)*sign)};
        return WordTreeData.vis.diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", function(d){
          var sourceBox = d3.select("#text-"+d.source.id+"-wordtree-"+WordTreeData.vis.wordtreeID)[0][0].getBBox();
          var s = {x: d.source.x, y: d.source.y+((padding+sourceBox.width)*sign)};
          return WordTreeData.vis.diagonal({source:s, target:d.target})
      });
    
    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", function(d){
            var sourceBox = d3.select("#text-"+d.source.id+"-wordtree-"+WordTreeData.vis.wordtreeID)[0][0].getBBox();
            var s = {x: d.source.x, y:d.source.y+((padding+sourceBox.width)*sign)};
            return WordTreeData.vis.diagonal({source:s, target:d.target})
        });
    
    // Transition exiting links to the parent's new position.
    link.exit()
    .transition()
      .duration(duration)
      .attr("d", function(d) {
          var bbox = d3.select("#text-"+source.id+"-wordtree-"+WordTreeData.vis.wordtreeID)[0][0].getBBox();
          var o = {x: source.x0, y: source.y0-((padding+bbox.width)*sign)};
          return WordTreeData.vis.diagonal({source: o, target: o});
      })
      .remove();
    
    // Stash the old positions for transition.
    nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
    });
    
    // Scroll the container of this word tree so that the root of the
    // tree is in view.
    $(WordTreeData.container).parent().scrollTo('50%', {duration:1, axis:'x'});
}

/** Recursively repositions the x-value of tree nodes starting at the given
node, to avoid overlapping text by moving them all to avoid the longest 
string at each level. Also calls {@link #adjustHeight} to move the node to
the top of its child tree.

@param {Object} d The node to reposition.
@param {SVGElement} The main SVG canvas element.
@param {Number} sign The sign of the adjustment to x, either -1 or +1. -1 
if we're drawing the left tree, +1 if we're drawing the right tree.
*/
function calculateDepths(d, sign){
    if(d.isRoot){
        d.y = d.y0;
        d.x = d.x0;
        d.depth = 0;
    }else{
        if(d.parent.isRoot){
            d.y = width(d.parent)+50;
            d.depth = 1;
        }else{
            var maxWidth = -1;
            d.parent.parent.children.forEach(function(node){
                var w = width(node);
                if(w > maxWidth && node.children.length > 0){
                    maxWidth = w
                }
            })
            maxWidth = Math.max(maxWidth, 50);
            d.y = d.parent.y + maxWidth;
            d.depth = d.parent.depth + 1;   
        }
        adjustHeight(d);
    }
    d.hidden_children = [];
 
    d.children.forEach(function(d){
        calculateDepths(d, sign)
    });
}


/** To improve readability, recursively adjusts the y value (height) of parent 
    nodes to the tops of their child trees (from the centers, where the D3 algorithm)
    positions them.
    @param {Object} d The node at which to start repositioning.
*/
    
function adjustHeight(d){
    if(!d.isRoot){
        var minX = d.x;

        if(d.children){
            d.children.forEach(function(node){
                if(!minX){
                    minX = node.x
                }
                if(node.x < minX){
                    minX = node.x
                }
            })
            var newX = Math.min(minX+20, d.x);
            if (newX != d.x){
                d.x = newX;
                adjustHeight(d.parent);
            }
        }
    }
}

/** Called when a word tree node is clicked or double clicked. 
    For clicking, if the node was already
    selected, this deselcts it, and vice versa. Clicking a node filters the word 
    tree to show only the sentences that 'pass through' that node. This list 
    of sentences is stored in the 'ids' attribute of each node.

    Double clicking a node makes a difference (from just clicking a node) when
    there are already some filters active. Double clicking resets the filter to \
    only filter take into account that node.
    
    @param {SVGElement} node The svg element representing the node that was
    hovered over.
    @param {Object} d The object containing the data for the node that was 
    clicked.
    @param {String} orientation Either 'left' or 'right', which tree we're
    drawing.
    @param {Object} root The root of this tree.
    @param {SVGElement} vis The svg canvas we're drawing into.
    @param {String} clickType either "click" or "dbclick".
    */
    
// function wordTreeNodeClick(node, d, orientation, root, clickType){
function wordTreeNodeClick(node, d, orientation, root){
    // Calculate which nodes should be collapsed or expanded.

    filterDocs = [];

    // If it's the root node that was clicked, then reset the filters.
    if(d.isRoot){
      WordTreeData.vis.selectedIDs = [];
      // WordTreeData.vis.selectedNodeIDs = {left:[], right:[]};
      WordTreeData.vis.selectedNodes = {left: [], right: []};
      WordTreeData.vis.filterDepth = 0; 
      WordTreeData.vis.orientationFilterDepth = {left: 0, right: 0};
      
      WordTreeData.vis.leftFilterDepth = 0;

      WordTreeData.vis.filterOrientation = null;

      WordTreeData.filterDocs = WordTreeData.matchedList;
    } 
    // If it was a double click, or there are no active filters, first
    // reset the filters and then add the ID's for that node as the 
    // selected ID's.
    else if(WordTreeData.vis.selectedIDs.length == 0 /*|| clickType == "dblclick"*/){
        WordTreeData.vis.selectedIDs = d.ids;
        // WordTreeData.vis.selectedNodeIDs = {left:[], right:[]};
        WordTreeData.vis.selectedNodes = {left: [], right: []};
        // WordTreeData.vis.selectedNodeIDs[orientation] = [d.id];
        WordTreeData.vis.selectedNodes[orientation] = [d];
        WordTreeData.vis.filterDepth = d.depth;
        WordTreeData.vis.orientationFilterDepth[orientation] = d.depth;
        WordTreeData.vis.filterOrientation = orientation;
        toggle(d);

        WordTreeData.filterDocs = d.docs;
    }
    // If there are active filters, restrict the active filters to the
    // just the list of ID's passing through this node.
    else{
        //
        toggle(d);
        
        var check = orientation == "left" ? "right" : "left";
        var filter_words = [];
        var depth = 1;

        WordTreeData.vis.selectedNodes[check].forEach(function(node){
          while(depth < node.depth){
            filter_words.push("");
            depth++;
          }

          filter_words.push(node.key.toLowerCase());
          depth++;
        });
        
        var filter_length = filter_words.length;

        if((d.depth > WordTreeData.vis.filterDepth && orientation == WordTreeData.vis.filterOrientation) || orientation != WordTreeData.vis.filterOrientation){
            // sub-filtering in progress
            if(d.depth > WordTreeData.vis.filterDepth)
              WordTreeData.vis.filterDepth = d.depth;

            if (d.depth > WordTreeData.vis.orientationFilterDepth[orientation]) {
              // WordTreeData.vis.selectedNodeIDs[orientation].push(d.id)
              WordTreeData.vis.orientationFilterDepth[orientation] = d.depth;
              WordTreeData.vis.selectedNodes[orientation].push(d);
            }

            var intersection = [];
            d.ids.forEach(function(id){
                if(WordTreeData.vis.selectedIDs.contains(id)) {
                  
                  if(WordTreeData.sentences[id][check].length < filter_length)
                    return;
                  
                  for (var i=0; i < filter_length; i++) {
                    if (filter_words[i] == "")
                      continue;

                    if(WordTreeData.sentences[id][check][i].toLowerCase() != filter_words[i])
                      return
                  }
                  
                  intersection.push(id);
                }
            });

            WordTreeData.vis.selectedIDs = intersection;
            WordTreeData.vis.filterOrientation = orientation;

        }else if(d.depth < WordTreeData.vis.filterDepth && orientation == WordTreeData.vis.filterOrientation){

            // backtracking up the tree
            WordTreeData.vis.selectedIDs = [];

            d.ids.forEach(function(id){
              if(WordTreeData.sentences[id][check].length < filter_length)
                return;
                  
              for (var i=0; i < filter_length; i++) {
                if (filter_words[i] == "")
                  continue;

                if(WordTreeData.sentences[id][check][i].toLowerCase() != filter_words[i])
                  return
              }
              
              WordTreeData.vis.selectedIDs.push(id);
            });

            // WordTreeData.vis.selectedNodeIDs = {left:[], right:[]};
            // WordTreeData.vis.selectedNodeIDs[orientation] = [d.id];
            var intersection = [];
            WordTreeData.vis.selectedNodes[orientation].forEach(function (node){
                if (d.depth > node.depth)
                    intersection.push(node);
            });
            intersection.push(d);

            WordTreeData.vis.selectedNodes[orientation] = intersection;
            WordTreeData.vis.filterDepth = d.depth;
            WordTreeData.vis.orientationFilterDepth[orientation] = d.depth;
            WordTreeData.vis.filterOrientation = orientation;
        }

        //Update filter docs
        // var leftMost = WordTreeData.vis.selectedNodes.left[WordTreeData.vis.selectedNodes.left.length - 1];
        // var rightMost = WordTreeData.vis.selectedNodes.right[WordTreeData.vis.selectedNodes.right.length - 1];

        // if (leftMost && rightMost) {
        //   intersection = [];
        //   leftMost.docs.forEach(function (doc) {
        //       if (rightMost.docs.contains(doc))
        //         intersection.push(doc);
        //   });
        //   WordTreeData.filterDocs = intersection;  
        // }
        // else if(leftMost) {
        //   WordTreeData.filterDocs = leftMost.docs;
        // }
        // else {
        //   WordTreeData.filterDocs = rightMost.docs;
        // }
        WordTreeData.filterDocs = [];
        WordTreeData.vis.selectedIDs.forEach(function(id) {
          doc = WordTreeData.sentences[id].doc;
          if(!WordTreeData.filterDocs.contains(doc))
            WordTreeData.filterDocs.push(doc);
        });
    }

    // Apply the filter to the other tree, so nodes in the sentences that 
    // should be hidden or shown because of new filters can be hidden 
    // or shown as well.
    var otherRoot = (orientation == "right")? WordTreeData.vis.leftData:WordTreeData.vis.rightData;
    var otherOrientation = orientation == "right" ? "left" : "right";
    WordTreeData.vis.leftVisibleBranches = 0;
    WordTreeData.vis.rightVisibleBranches = 0;
    showSentences(WordTreeData.vis.selectedIDs, root, orientation)
    showSentences(WordTreeData.vis.selectedIDs, otherRoot, otherOrientation);
    
    // Re-display the nodes.
    WordTreeData.vis.maxVisibleBranches = Math.max(WordTreeData.vis.leftVisibleBranches, WordTreeData.vis.rightVisibleBranches);
    updateWordTreeNode(d, orientation, root);
    updateWordTreeNode(otherRoot, otherOrientation, otherRoot);
    
    // Compute the selected phrase.
    var selected_phrase = "";
    var root_phrase = "";
    for (var i = WordTreeData.vis.selectedNodes.left.length-1; i >= 0; i--) {
        selected_phrase += WordTreeData.vis.selectedNodes.left[i].key +" ";
    }
    if (WordTreeData.vis.leftData.key.length > 0) {
        selected_phrase += WordTreeData.vis.leftData.key +" ";
        root_phrase += WordTreeData.vis.leftData.key +" ";
    }
    if (WordTreeData.vis.rightData.key.length > 0) {
        selected_phrase += WordTreeData.vis.rightData.key + " ";
        root_phrase += WordTreeData.vis.rightData.key + " ";
    }
    for (var i = 0; i < WordTreeData.vis.selectedNodes.right.length; i++) {
        selected_phrase += WordTreeData.vis.selectedNodes.right[i].key +" ";
    }

    //Compute span
    var span_phrase_keys = {left: [], right: []};

    var node = WordTreeData.vis.selectedNodes.left[WordTreeData.vis.selectedNodes.left.length - 1];
    if (node !== undefined) {
        while(!node.isRoot) {
            span_phrase_keys.left.push(node.key);
            node = node.parent;
        }
    }

    node = WordTreeData.vis.selectedNodes.right[WordTreeData.vis.selectedNodes.right.length - 1];
    if (node !== undefined) {
        while(!node.isRoot) {
            span_phrase_keys.right.push(node.key);
            node = node.parent;
        }
    }
    
    var span_phrase = "";

    for (var i = 0; i < span_phrase_keys.left.length; i++) {
        span_phrase += span_phrase_keys.left[i] +" ";
    }

    span_phrase += root_phrase;

    for (var i = span_phrase_keys.right.length-1; i >= 0; i--) {
        span_phrase += span_phrase_keys.right[i] +" ";
    }

    // Update feedback
    // console.log(selected_phrase.trim());
    // console.log(span_phrase.trim());

    updateAppCtrlWordTree(selected_phrase.trim(), span_phrase.trim())
}

/** Show or hide the immediate children of the given node. If they are 
    visible, hide them. If they are not visible, show them.
    @param {Object} d The node whose children should be hidden.
*/
    
function toggle(d) {
  if (d.children.length > 0) {
      hideChildren(d);
  } else {
      showChildren(d);
  }
}

/** Recursively show or hide all the descendants of the given node. 
    If they are visible, hide them. If they are not visible, show them.
    @param {Object} d The node whose children should be hidden.
*/
    
function toggleAll(d) {
  if (d.children) {
    d.children.forEach(function(child){
        toggleAll(child)
    });
    toggle(d);
  }
}

/** Hide the children of the given node.
    @param {Object} d The node whose children should be hidden.
*/
    
function hideChildren(d) {
    d.hidden_children = d.all_children;
    d.children = []
}

/** Show the children of the given node.
    @param {Object} d The node whose children should be hidden.
*/
    
function showChildren(d){
   d.children = d.all_children;
   d.hidden_children = [];
}

/** Recursively hide or show a nodes upto a certain depth depending on how many 
    sentences there are in this tree 
    @param {Array[Number]} The list of visible sentence IDs.
*/
    
function showSentences(ids, tree, thisOrientation){
    // fanOut is the depth to which to show nodes.
    var fanOut = (ids.length < 50)? 10 :
    (ids.length < 100)? 3:
    (ids.length < 200)? 3 : 1;
    // If there are sentences in this filter, recursively travel the 
    // tree and mark nodes visible if they span one of these sentences.
    if(ids.length > 0){
        tree.children = [];
        tree.all_children.forEach(function(t){
            t.selected = false;
            ids.forEach(function(id){
                if(t.ids.contains(id)){
                    t.selected = true;
                }
            })
            if(t.selected){
            // Show the nodes of this tree upto a certain depth
                var show = false;
                if(thisOrientation == WordTreeData.vis.filterOrientation){
                    if(t.depth <= WordTreeData.vis.filterDepth + fanOut ){
                        show = true
                    }
                }else{
                    if(t.depth <= fanOut){
                        show = true
                    }
                }
                if(show){
                    if(thisOrientation == "left"){
                        WordTreeData.vis.leftVisibleBranches += 1;
                    }else{
                        WordTreeData.vis.rightVisibleBranches += 1;
                    }
                    showSentences(ids, t, thisOrientation);
                    tree.children.push(t);                  
                }
            }       
        })
    }
    // If there are no selected sentences (i.e. there is no active filter)
    // reset the tree nodes' visibility to their original state.
    else{
        // Show the children of the root
        if(tree.isRoot){
            showChildren(tree);
            tree.children.forEach(function(child){
                hideChildren(child);
            })
            if(thisOrientation == "left"){
                WordTreeData.vis.leftVisibleBranches = tree.children.length;
            }else{
                WordTreeData.vis.rightVisibleBranches = tree.children.length;
            }
        }
    }
}

/** When the user hovers over a node, shows contextual information. If the
    node is not a leaf, it shows a popup with the number of sentences under
    the node. If the node is a leaf, it highlights all the nodes corresponding
    to the sentence, and shows a sentence popup.

    @param {SVGElement} node The svg element representing the node that was
    hovered over.
    @param {Object} d The object containing the data for the node that was 
    clicked.
    @param {String} orientation Either 'left' or 'right', which tree we're
    drawing.
    @param {Object} root The root of this tree.
    @param {SVGElement} vis The svg canvas we're drawing into.
    @param {String} clickType either "click" or "dbclick".
*/
    
function wordTreeNodeMouseOver(node, d, orientation, root, eventName){
    if(!d.isRoot){ 
      ids = d.ids
    
      //Highlight other parts of the sentence
      for (var i = 0; i < ids.length; i++) 
        d3.selectAll('*[class~="wordtree-' + 
          WordTreeData.vis.wordtreeID +'-sentence-'+ids[i]+'"]').classed("wordtree-highlight-sentence", true);

      //Highlight root as well
      d3.select("#text-" + WordTreeData.vis.rightData.id.toString() + "-wordtree-" + WordTreeData.vis.wordtreeID).classed("wordtree-highlight-sentence", true)
      // docs = d.docs;
    }
    else{
      d3.selectAll('.node text').classed("wordtree-highlight-sentence", true);
    }
    // else {
    //   docs = WordTreeData.matchedList
    // }

    if(WordTreeData.doc_class.variable == null)
      return;

    // /* Count positive and negatives */
    // var pos = 0;
    // var neg = 0;

    // for (var i=0; i < WordTreeData.filterDocs.length; i++) {
    //   if (docs.indexOf(WordTreeData.filterDocs[i]) > -1){
    //     if (WordTreeData.doc_class.positive.indexOf(WordTreeData.filterDocs[i]) > -1)
    //       pos++;
    //     else if (WordTreeData.doc_class.negative.indexOf(WordTreeData.filterDocs[i]) > -1)
    //       neg++;
    //   }
    // }

    // for (var i=0; i < docs.length; i++){
    //   if(WordTreeData.filterDocs.indexOf(docs[i]) > -1)) {
    //     if (WordTreeData.doc_class.positive.indexOf(docs[i]) > -1)
    //       pos++;
    //     else if (WordTreeData.doc_class.negative.indexOf(docs[i]) > -1)
    //       neg++;
    //   }
    // } 

    /* Add popup for class numbers */

    var child = document.getElementById("text-"+d.id+"-wordtree-"+WordTreeData.vis.wordtreeID);
    
    WordTreeData.vis.popup_bbox = d3.select(child.parentNode)
        .insert("svg:rect")
        .style("fill", "#eee")
        .style("fill-opacity", ".9")
        .attr("rx", 4)
        .attr("ry", 4);

    var num_text = d.hoverPos + "/" + d.hoverNeg;

    WordTreeData.vis.popup_number = d3.select(child.parentNode)
                        .append("svg:text")
                        .attr("y", function() {if (!d.isRoot) return 1; else return -17;})
                        .attr("id", "number-popup")
                        .attr("font-size", 12)
                        .attr("class", "number-popup")
                        .attr("x", function() {
                                      if (!d.isRoot){
                                        if (orientation == "left")
                                          return 5;
                                        else
                                          return -5*(num_text.length) - 8;
                                      } 
                                      else
                                        return 0;
                                    });

    WordTreeData.vis.popup_number.append("tspan")
        .attr("class", "positive")
        .text(d.hoverPos);

    WordTreeData.vis.popup_number.append("tspan")
        .text("/");

    WordTreeData.vis.popup_number.append("tspan")
        .attr("class", "negative")
        .text(d.hoverNeg);

    var bbox = WordTreeData.vis.popup_number.node().getBBox();
    WordTreeData.vis.popup_bbox
        .attr("x", bbox.x - 1)
        .attr("y", bbox.y - 1)
        .attr("width", bbox.width + 2)
        .attr("height", bbox.height + 1)

    $(WordTreeData.popup).html(
      '<strong>"'+d.key.truncate(30)+'"</strong> occurs in <strong>' 
      + d.hoverPos + " " + WordTreeData.classificationName['positive'].toLowerCase() + 
      '</strong> and <strong>' + d.hoverNeg + " " + WordTreeData.classificationName['negative'].toLowerCase() +
      '</strong> documents in the grid.')
      .show();


    // child.parentNode.insertBefore(WordTreeData.vis.popup_number, child.nextSibling);    

    // var nodeEl = $("#text-"+d.id+"-wordtree-"+WordTreeData.vis.wordtreeID).parent();
    // WordTreeData.vis.popup_number = d3.select(nodeEl).append("svg:text")
    //                     .attr("x", -15*(orientation=="left"?-1:1))
    //                     .attr("y", 10)
    //                     .attr("id", "number-popup")
    //                     .text("("+pos+ "/" + neg + ")")
    //                     .attr("font-size", 10)
    //                     .attr("class", "number-popup");

    // WordTreeData.vis.popup_number = d3.select(node).append("svg:text")
    //                     .attr("x", -15*(orientation=="left"?-1:1))
    //                     .attr("y", -10)
    //                     .attr("id", "number-popup")
    //                     .text("("+d.ids.length+")")
    //                     .attr("font-size", 10)
    //                     .attr("class", "number-popup");


 //    if(!d.isRoot){ 
 //     // If the hovered node is not a leaf, show a popup with the number.
    //      if(d.all_children.length > 1){
    //          // Remove the previous popups.
    //          removePopup(WordTreeData.vis.popup); 
    //         if (WordTreeData.vis.popup_number) {
    //          WordTreeData.vis.popup_number.remove();
    //         }
    //         WordTreeData.vis.popup_number = d3.select(node).append("svg:text")
    //           .attr("x", -15*(orientation=="left"?-1:1))
    //           .attr("y", -10)
    //           .attr("id", "number-popup")
    //           .text("("+d.ids.length+")")
    //           .attr("font-size", 10)
    //           .attr("class", "number-popup");
    //     } 
    //     // If the hovered node is a leaf, ask the server for details
    //     // about the sentence, and highlight the nodes corresponding to 
    //     // this sentence.
    //     else {
    //      // Get the sentence ID of the leaf -- since it's a leaf, there's
    //      // only one ID.
    //         var id = d.ids[0];
            
    //         // Highlight the nodes corresponding to this sentence by adding
    //         // a CSS class to those SVG elements.
    //         var nodes = $( ('*[class~="wordtree-' + 
    //          WordTreeData.vis.wordtreeID +'-sentence-'+id+'"]'));
    //         for (var i = 0; i < nodes.length; i++) {
    //             var old_class = $('#'+nodes[i].id).attr("class");
    //             $('#'+nodes[i].id).attr("old-classes", old_class);
    //             $('#'+nodes[i].id).attr("class", 
    //              old_class+" wordtree-highlight-sentence");
    //         }

    //         // // Only ask for a popup after 0.5 seconds, so that passing
    //         // // mouseovers don't cause popups to appear.
    //         // WordTreeData.vis.event = d3.event;
    //         // WordTreeData.vis.mouseoverTimeout = setTimeout(function(){
    //         //   getMetadataForSentenceNode(node, id, orientation)
    //         // }, 100);
    //     }
    // }
}

/** Requests details about the hovered-over sentence from the server. 
    The server responds with a JSON object containing the following fields:
        - {String} sentence: The full sentence.
        - {String} title: The title of the document to which the sentence
        belongs.
        - {Object} metadata: Objects with name: and value: fields for metadata 
        belonging to this sentence.
    @param {SVGElement} node: The svg element displaying the node that was 
    hovered over.
    @param {Number} sentenceID The ID of the sentence about which to request 
    information.
    @param {String} orientation 'left' or 'right' -- the side of the tree
    that we're drawing.
    #@param {SVGElement} vis The SVGElement in which the word tree is being
    drawn.
*/
    
// function getMetadataForSentenceNode(node, sentenceID, orientation){
//     Ext.Ajax.request({
//         url:'../../src/php/strip-vis/getsentence.php',
//         method:'GET',
//         disableCaching: false,
//         params:{
//             id:sentenceID,
//             wordtree:'true',
//             instance:getInstance(),
//             user:getUsername(),
//         },
//         scope:this,
//         success:function(response){
//             var data = Ext.decode(response.responseText);
//             var sentence = {};
//             sentence.words = data.words;
//             sentence.sentenceID = data.sentence_id;
//             sentence.documentID = data.document_id;
//             sentence.metadata = data.metadata;
//             if (WordTreeData.vis.popup_number) {
//              WordTreeData.vis.popup_number.remove();
//             }
//              this.getController('SentencePopupController')
//              .removePopup(WordTreeData.vis.popup);
//             WordTreeData.vis.popup = Ext.create(
//              'WordSeer.view.visualize.wordtree.SentencePopup', 
//              {
//                    sentences: [sentence],
//              });
//             WordTreeData.vis.popup.show();
//             WordTreeData.vis.popup.setPosition(WordTreeData.vis.event.pageX+20, 
//                 WordTreeData.vis.event.pageY+20);
//         }
//     })
// }

/** Called when the user mouses away from a node.
    @param {SVGElement} node The svg element representing the node that was
    hovered over.
    @param {Object} d The object containing the data for the node that was 
    clicked.
    @param {String} orientation Either 'left' or 'right', which tree we're
    drawing.
    @param {Object} root The root of this tree.
    @param {SVGElement} vis The svg canvas we're drawing into.
    @param {String} clickType either "click" or "dbclick".
*/
    
function wordTreeNodeMouseOut(node, d, orientation, root, eventName){
 //    // clearTimeout(WordTreeData.vis.mouseoverTimeout); //cancel queued popup
 //    if (WordTreeData.vis.popup) {
 //     var popup = WordTreeData.vis.popup;
 //     var number_popup = WordTreeData.vis.popup_number;

    //     destroySentencePopupTimeOut = setTimeout(function(){
    //       removePopup(popup);
    //       if (number_popup){
    //        number_popup.remove();
    //       }
    //     }, 1000);
    // }
    // Remove the highlight that was applied to the nodes when the user
    // hovered over them, by restoring the old CSS class which we stored in 
    // the 'old-classes' attribute.


    d3.selectAll('*[class~="wordtree-highlight-sentence"]').classed("wordtree-highlight-sentence", false)
    // $("#word-tree-info").hide();
    $(WordTreeData.popup).hide();

    if (WordTreeData.vis.popup_number){
      WordTreeData.vis.popup_number.remove();
      WordTreeData.vis.popup_bbox.remove();
    }

    // var nodes = $('*[class~="wordtree-highlight-sentence"]');
    // for (var i = 0; i < nodes.length; i++) {
    //     $('#'+nodes[i].id).attr("class", $('#'+nodes[i].id).attr("old-classes"));
    //     $('#'+nodes[i].id).attr("old-classes", "");
    // }
}


function addDocClass(id, classname){
    d3.selectAll('*[class~="wordtree-doc-' + 
           id+'"]').classed(classname, true);
}

function removeDocClass(id, classname){
    d3.selectAll('*[class~="wordtree-doc-' + 
           ids+'"]').classed(classname, false);
}

/** Utils **/

/** checks if an array <a> contains an object <obj>**/
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

String.prototype.truncate = function(length, end) {

    if (isNaN(length))
        length = 10;

    if (end === undefined)
        end = "...";

    if (this.length <= length || this.length - end.length <= length) {
        return this;
    }
    else {
        return String(this).substring(0, length-end.length) + end;
    }
}

/** Sentence Popup Controller **/

/** Destroys the sentence popup that appeared when a user last hovered
  a node.
  @param {WordSeer.view.visualize.wordtree.SentencePopup} popup The sentence
  popup.
*/
function removePopup(popup) {
    if (popup) {
      if (!popup.isHovered) {
        if (popup.destroy) {
            popup.destroy();
        }
        else {
            popup.destroy();
        } 
      }
    }
}

/** Prevents the sentence popup from fading away.
  @param {WordSeer.view.visualize.wordtree.SentencePopup} popup The sentence
  popup.
  */
// function  sentencePopupMouseEnter(popup) {
//     popup.isHovered = true;
// }

// * Sets a timeout for the the sentence popup to fade away 0.5s after the 
//   user's mouse leaves it.
//   @param {WordSeer.view.visualize.wordtree.SentencePopup} popup The sentence
//   popup.

// function sentencePopupMouseOut(popup) {
//     popup.isHovered = false;
//     destroySentencePopupTimeOut = setTimeout(function(){
//       removePopup(popup);
//     }, 500);
// }


/** Called when the 'go to text' button in the
  {@link WordSeer.view.visualize.wordtree.SentencePopup} is clicked. Calls the
  DocumentsController's 
  {@link WordSeer.controller.DocumentsController#openDocument} method with the
  {@link WordSeer.view.visualize.wordtree.SentencePopup#documentId} and
  {@link WordSeer.view.visualize.wordtree.SentencePopup#sentenceId} of the
  sentence in the popup.
*/
// function sentencePopupGoToText(button) {
//     var index = button.index;
//     var popup = button.up('sentence-popup');
//     var sentence = popup.getSentences()[index];
//     this.getController('DocumentsController').openDocument(
//       sentence.documentID, sentence.sentenceID);
// }
