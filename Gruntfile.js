module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/* Test */
		jasmine: {
			photopop: {
				src: ['build/photopop.js', 'build/photopop.min.js'],
				options: {
					specs: 'spec/photopopSpec.js',
					helpers: 'spec/mock.js'
				}
			}
		},
		
		/* Lint */
		jshint: {
			all: ['Gruntfile.js', 'src/**/*.js', 'spec/mock.js', 'spec/photopopSpec.js']
		},
		
		/* Build */
		component: {
			build : {
				options : {
					action : 'build',
					args : {
						name : 'photopop'
					}
				}
			}
		},

		/* Minify */
		uglify: {
			options: {
				banner: '/*! photopop <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/photopop.js',
				dest: 'build/photopop.min.js'
			}
		},		
		
		/* Doc */
		jsdoc : {
			dist : {
				src: ['src/**/*.js'], 
				options : {
						destination: 'doc'
				}
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-component');

	// Default task(s).
	grunt.registerTask('default', ['component', 'uglify', 'jasmine', 'jshint']);
	grunt.registerTask('build', ['component', 'uglify', 'jasmine', 'jshint', 'jsdoc']);

};