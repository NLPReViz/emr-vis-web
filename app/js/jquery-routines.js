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

   // var report = $(".report pre");
   // report.highlight(/ascending/gi, "highlight positive")
   //       .highlight(/colonoscopy/gi, "highlight negative")
   //       .highlight(/.*\:/gi, "dim")
   //       .highlight(/S_O_H\s\SE_O_H/gi, "dim")
   //       .highlight(/De-ID.*S_O_H/gi, "dim")
   //       .highlight(/.*E_O_H/gi, "dim")
   //       .highlight(/\[Report de-identified.*/gi, "dim")
   //       .highlight(/\*\*.*/gi, "dim")
   //       .highlight(/E_O_R/gi, "dim");
});