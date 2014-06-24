module.exports = function (grunt) {
  var backend = process.env.npm_package_config_backend;
  var appFolder = process.env.npm_package_config_appFolder;

  grunt.loadNpmTasks('grunt-replace');
  grunt.initConfig({
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'backEndApp',
              replacement: backend + "/rest/server"
            }
          ]
        },
        files: [
          {
            expand: true, 
            flatten: true, 
            src: ['./config/services.js'], 
            dest: appFolder + '/js/'}
        ]
      }
    }
  });
  grunt.registerTask('default', 'replace');
};

