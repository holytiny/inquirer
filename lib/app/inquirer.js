const fs = require('fs');
const path = require('path');

const YAML = require('yaml');
const { prompt } = require('enquirer');
const Logger = require('js-logger');

const  { ReturnCode } = require('../common/return-code');

// Predefined logging levels.
// Logger.TRACE = defineLogLevel(1, 'TRACE');
// Logger.DEBUG = defineLogLevel(2, 'DEBUG');
// Logger.INFO = defineLogLevel(3, 'INFO');
// Logger.TIME = defineLogLevel(4, 'TIME');
// Logger.WARN = defineLogLevel(5, 'WARN');
// Logger.ERROR = defineLogLevel(8, 'ERROR');
const LogLevel = [  
  Logger.ERROR,
  Logger.WARN,
  Logger.TIME,
  Logger.INFO,
  Logger.DEBUG,
  Logger.TRACE,
];

const configFilePath = './inquirer.yaml';
const outputBasePath = './.inquirer';
class Inquirer {
  constructor() {
    this.logger = Logger;
    this.logger.useDefaults();
    this.logger.setLevel(this.logger.OFF);

    fs.mkdirSync(outputBasePath, { recursive: true });
  }

  setLoggerLevel(level) {
    if (!level) {
      return;
    }
    if (level > LogLevel.length) {
      level = LogLevel.length - 1;
    }

    const theLevel = LogLevel[level];
    this.logger.setLevel(theLevel);
  }

  async run() {
    const yaml = this.yaml();
    await this.parse(yaml);


    this.exit('inquirer succeed!', ReturnCode.OK);
  }

  exit(message, code) {
    console.info(message);
    process.exit(code);
  }

  yaml() {
    try {
      // console.log(process.cwd());
      const inputFile = fs.readFileSync(configFilePath, 'utf8');
      const yaml = YAML.parse(inputFile);

      return yaml;
    } catch (e) {
      this.exit(e.message, ReturnCode.ReadConfigFileError);
    }    
  }

  async parse(yaml) {
    for (let inquirer of yaml.inquirers) {
      await this.processInquirer(inquirer);
    }
  }

  async processInquirer(inquirer) {
    const filePath = path.join(outputBasePath, inquirer.output);
    if (fs.existsSync(filePath)) {
      if (process.argv[1] === '-f') {
        fs.unlinkSync(filePath);
      } else {
        return;
      }
    } 
    const writeStream = fs.createWriteStream(filePath);
    let baseObj = {};
    for (let question of inquirer.questions) {
      console.log('question: ', question);
      // console.log('Prompt: ', TypeMapping[`${question.type}`]);
      const response = await prompt(question);
      console.log('response', response);
      
      baseObj = Object.assign(baseObj, response);
      
      console.log('baseObj: ', baseObj);
    }
  }
}

module.exports = Inquirer;