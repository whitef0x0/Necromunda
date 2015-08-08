module.exports = function(config) {
  config.set({

  	// base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    frameworks: ['mocha'],

    files: [
      'engine/*.js',
      'gameScript/*.js',
      'tests/*.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    //     'test/*.html': ['html2js'],
        'js/*.js': ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // Web server port
	port: 9876,

	// Enable / disable colors in the output (reporters and logs)
	colors: true,

	// Enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,

	// Start these browsers, currently available:
	// - Chrome
	// - ChromeCanary
	// - Firefox
	// - Opera
	// - Safari (only Mac)
	// - PhantomJS
	// - IE (only Windows)
	// browsers: ['Chrome', 'Firefox', 'PhantomJS'],


	// Continuous Integration mode
	// If true, it capture browsers, run tests and exit
	singleRun: false,

	// level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


  });
};