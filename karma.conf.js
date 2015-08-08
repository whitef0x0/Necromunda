var bowerDep = require('main-bower-files')('**/**.js');

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'engine/*.js',
      'gameScript/*.js',
      'tests/*.js'
    ],

    // Test results reporter to use
	// Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
	reporters: ['progress'],

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
	browsers: ['Chrome', 'Firefox', 'PhantomJS'],

	// If browser does not capture in given timeout [ms], kill it
	captureTimeout: 60000,

	// Continuous Integration mode
	// If true, it capture browsers, run tests and exit
	singleRun: true

    // client: {
    //   mocha: {
    //     reporter: 'html', // change Karma's debug.html to the mocha web reporter
    //     ui: 'tdd'
    //   }
    // }
  });
};