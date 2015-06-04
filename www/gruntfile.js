/*global module, require*/

module.exports = function (grunt) {

    'use strict';

    //load all modules
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            /*
            html: {
                files: ['index.html'],
                tasks: ['htmlhint']
            },
            */
            js: {
                files: ['app/vis1.js', 'app/vis2.js', 'app/vis3.js'],
                tasks: ['jslint', 'uglify', 'concat']
            },
            css: {
                files: ['css/style.scss'],
                tasks: ['buildcss']
            }
        },
        /*------*/
        /* HTML */
        /*------*/
        /*
        htmlhint: {
            build: {
                options: {
                    'tag-pair': true, // Force tags to have a closing pair
                    'tagname-lowercase': true, // Force tags to be lowercase
                    'attr-lowercase': true, // Force attribute names to be lowercase
                    'attr-value-double-quotes': false, // Force attributes to have double quotes rather than single
                    'doctype-first': true, // Force the DOCTYPE declaration to come first in the document
                    'spec-char-escape': true, // Force special characters to be escaped
                    'id-unique': true, // Prevent using the same ID multiple times in a document
                    'head-script-disabled': true, // Prevent script tags in the header for performance reasons
                    'style-disabled': false // Prevent style tags
                },
                src: ['index.html']
            }
        },
        */
        /*----*/
        /* JS */
        /*----*/
        //jslint
        jslint: {
            build: {
            // files to lint
                src: [
                    'app/vis1.js',
                    'app/vis2.js',
                    'app/vis3.js'
                ],
                // lint options (taken from technical page of Webarchitecture module)
                // https://hci.ecs.soton.ac.uk/wiki/NodejsReferences
                directives: {
                    //node: true,
                    //devel: true,
                    //sloppy: true,
                    //unparam: true, //prevent "unused variable" jslint errors
                    //nomen: true,
                    //white: false
                    //latedef: false
                }
            }
        },
        uglify: {
            build: {
                files: {
                    'app/_prod.js': [
                        'app/field_config.js',
                        'app/progressbar.js',
                        'app/vis1.js',
                        'app/vis2.js'
                    ]
                }
            }
        },
        /* package production JS */
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    //'js/vendor/modernizr.js',
                    'js/vendor/d3/d3.min.js',
                    'js/vendor/jquery/dist/jquery.min.js',
                    //'js/vendor/fastclick.js',
                    'js/vendor/foundation/foundation.min.js',
                    'js/vendor/foundation/foundation.reveal.js',
                    'js/vendor/PapaParse/papaparse.min.js',
                    'app/_prod.js'
                ],
                dest: 'app/_prod.js'
            }
        },
        /*-----*/
        /* CSS */
        /*-----*/
        sass: {
            build: {
                files: {
                    'css/style.css': 'css/style.scss'
                }
            }
        },
        cssc: {
            build: {
                options: {
                    consolidateViaDeclarations: true,
                    consolidateViaSelectors: true,
                    consolidateMediaQueries: true
                },
                files: {
                    'css/style.css': 'css/style.css'
                }
            }
        },
        concat_css: {
            build: {
                src: [
                    'css/vendor/fontello.css',
                    'css/vendor/foundation.min.css',
                    'css/style.css'
                ],
                dest: 'css/_prod.css'
            }
        },
        cssmin: {
            build: {
                src: 'css/_prod.css',
                dest: 'css/_prod.css'
            }
        }
    });

    grunt.registerTask('default', []);

    grunt.registerTask('buildcss',  ['sass', 'cssc', 'concat_css', 'cssmin']);

};