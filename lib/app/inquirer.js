const fs = require('fs');
const path = require('path');

const YAML = require('yaml');
const { prompt } = require('enquirer');

const  { ReturnCode } = require('../common/return-code');

const configFilePath = './inquirer.yaml';
const outputBasePath = './.inquirer';
class Inquirer {
  constructor() {
    fs.mkdirSync(outputBasePath, { recursive: true });
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