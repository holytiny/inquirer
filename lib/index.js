const { Command } = require('commander');
const Logger = require('js-logger');

const Inquirer = require('./app/inquirer');

const packageJson = require('../package.json');

function increaseVerbosity(_, previous) {
  return previous + 1;
}

const program = new Command();
program
.version(packageJson.version)
.option('-f, --force', 'force to generate output json files')
.option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
.parse(process.argv);


// Predefined logging levels.
// Logger.TRACE = defineLogLevel(1, 'TRACE');
// Logger.DEBUG = defineLogLevel(2, 'DEBUG');
// Logger.INFO = defineLogLevel(3, 'INFO');
// Logger.TIME = defineLogLevel(4, 'TIME');
// Logger.WARN = defineLogLevel(5, 'WARN');
// Logger.ERROR = defineLogLevel(8, 'ERROR');
const LogLevel = [  
  // Logger.ERROR,
  // Logger.WARN,
  // Logger.TIME,
  // Logger.INFO,
  Logger.DEBUG,
  Logger.TRACE,
];
Logger.useDefaults();
Logger.setLevel(Logger.INFO);

Logger.setLoggerLevel = function(level) {
  if (!level) {
    return;
  }
  if (level > LogLevel.length) {
    level = LogLevel.length - 1;
  }

  const theLevel = LogLevel[level - 1];
  Logger.setLevel(theLevel);
}

const theApp = new Inquirer(program, Logger);

module.exports = theApp;
