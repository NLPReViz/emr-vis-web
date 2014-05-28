jQuery(document).ready(function(){
   function fixGrid(){
      // console.log("Handler for .resize() called.");
      var containerHeight = $("#sidebar-top #tablecontainer").height();
      var topbarHeight = $("#sidebar-top #topbar").height();
      var magicHeight = containerHeight - topbarHeight 
                        - $(".sidebar-separator").height()
                        - 4;

      if (magicHeight > 0)
         $("#expandtable").height(magicHeight);
   }
   fixGrid();
   $("#sidebar-top").bind('heightChange', fixGrid);
   $(window).resize(fixGrid);

   $(".report pre").highlight("ascending", "positive");
   $(".report pre").highlight("colonoscopy", "negative");
});