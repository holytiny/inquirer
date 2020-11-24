const fs = require('fs');
const path = require('path');

const YAML = require('yaml');
const { prompt } = require('enquirer');


const  { ReturnCode } = require('../common/return-code');

const configFilePath = './inquirer.yaml';
const outputBasePath = './.inquirer';
class Inquirer {
  constructor(program, Logger) {
    this.program = program;
    this.logger = Logger;
    this.setLoggerLevel(program.verbose);

    this.logger.debug('verbose', program.verbose);

    fs.mkdirSync(outputBasePath, { recursive: true });
  }

  setLoggerLevel(level) {
    this.logger.setLoggerLevel(level)
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
      if (this.program.force) {
        fs.unlinkSync(filePath);
      } else {
        return;
      }
    } 
    let baseObj = {};
    for (let question of inquirer.questions) {
      this.logger.debug('question: ', question);
      // console.log('Prompt: ', TypeMapping[`${question.type}`]);
      const response = await prompt(question);
      this.logger.debug('response: ', response);
      let mergeObj = {};   

      if (question.type === 'multiselect') {
        mergeObj[`${question.name}`] = {};
        let images = {};
        const choices = question.choices;
        for (let choice of choices) {
          let image = {};
          if (response[`${question.name}`].includes(choice.name)) {
            image[`${choice.name}`] = true;            
          } else {
            image[`${choice.name}`] = false;        
          }
          Object.assign(mergeObj[`${question.name}`], image);
        } 
      } else {
        mergeObj = Object.assign(mergeObj, response);
      }      
      
      this.logger.debug('mergeObj: ', mergeObj);
      baseObj = Object.assign(baseObj, mergeObj);
      
      this.logger.debug('baseObj: ', baseObj);
      const writeObj = JSON.stringify(baseObj, null, 2);

      fs.writeFileSync(filePath, writeObj, 'utf8');
    }
  }
}

module.exports = Inquirer;