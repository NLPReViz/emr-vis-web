jQuery(document).ready(function(){
   fixGrid();
   $("#sidebar-top").bind('heightChange', fixGrid);
   $(window).resize(fixGrid);
});

function fixGrid() {
   // console.log("Handler for .resize() called.");
   var containerHeight = $("#sidebar-top #tablecontainer").height();
   var topbarHeight = $("#sidebar-top #topbar").height();
   var magicHeight = containerHeight - topbarHeight 
                     - $(".sidebar-separator").height()
                     - 4;

   if (magicHeight > 0)
      $("#grid-table").height(magicHeight);

   fixGridScrollBar();
}

function fixGridScrollBar(){
   var row_width = $(".divrow").width();
   if (row_width){
      $("#topbar").width( $(".divrow").width() );
   }
}
