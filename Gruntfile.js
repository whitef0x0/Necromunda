module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dev: {
        src: [
          'lib/*/*.js',
          'engine/*.js',
          'gameScript/*.js',
        ],
        dest: 'build/js/app.js'
      }
    },

    copy: {
      prod: {
        files: [{
          src: 'manifest.json',
          dest: 'build/manifest.json'
        },{
          src: 'package.json',
          dest: 'build/package.json'
        }]
      }
    },

    clean: {
      prod: ['build/js/app.js'],
    },

    uglify: {
      options: {
        report: 'min',
        preserveComments: 'some'
      },
      prod: {
        files: {
          'build/js/app.min.js': [
            'build/js/app.js'
          ]
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          keepalive: false
        }
      }
    },

    watch: {
      dev: {
        files: ['engine/*.js', 'gameScript/*.js', 'lib/*/*'],
        options: {
          spawn: false,
        },
      },
      prod: {
        files: ['build/js/*.js', 'lib/*/*'],
        options: {
          spawn: false,
        },
      },
    },

    wiredep: {

      dev: {

        src: [
          'index.html',
        ],

        options: {
          html: {
            replace: {
              js: '<script type="text/javascript" src="{{filePath}}"></script>',
            }
          },
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-wiredep');

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'copy',
    'clean',
    'wiredep',
  ]);
  grunt.registerTask('dev', ['wiredep', 'connect', 'watch:dev']);
  grunt.registerTask('prod', ['wiredep', 'connect', 'watch:prod']);
}
