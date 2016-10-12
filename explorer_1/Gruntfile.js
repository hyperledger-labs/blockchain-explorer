/*
Copyright DTCC 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


module.exports = function(grunt) {

  grunt.initConfig({
	
	auto_install: {
		local : { 
			options: {
				stdout: true,
				stderr: true,
				failOnError: true,
				exclude : ['node_modules']
			}
		},
		peerintf : {
			options: {
				cwd :'hyperledgerpeerintf',
				stdout: true,
				stderr: true,
				failOnError: true,
				exclude : ['node_modules']
			}
		},
		bower_scripts : {
			options: {
				cwd :'resources',
				stdout: true,
				stderr: true,
				failOnError: true,
				recursive : 'true'
			}
		}
	},
	
	copy: {
		fontawesome: {
                        files: [{
                                expand: true,
                                cwd: 'resources/bower_components/font-awesome/',
                                src: ['css/*min.css','fonts/*'],
                                dest: 'webcontent/static/css/font-awesome'
                        }]
                },
		scripts: {
                        files: [{
                                expand: true,
                                cwd: 'resources',
                                src: ['*.js'],
                                dest: 'webcontent/static/scripts'
                        }]
                },
                websocket: {
                        files: [{
                                expand: true,
                                cwd: 'node_modules',
                                src: ['socket.io-client/**'],
                                dest: 'webcontent/static/scripts'
                        }]
                },
                angular: {
                        files: [{
                                expand: true,
                                cwd: 'resources/bower_components',
                                src: ['angular*/**'],
                                dest: 'webcontent/static/scripts'
                        }]
                },
		charts: {
                        files: [{
                                expand: true,
                                cwd: 'node_modules/chart.js/dist',
                                src: ['Chart.min.js'],
                                dest: 'webcontent/static/scripts'
                        }]
                }
	}
  });

  grunt.loadNpmTasks('grunt-auto-install');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['auto_install','copy']);

};
