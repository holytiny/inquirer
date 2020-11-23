import * as fs from 'fs';
import * as path from 'path';

import * as YAML from 'yaml';
import { prompt } from 'enquirer';

import { ReturnCode } from '../common/return-code';
import { parseMultiSelect } from '../common/parse-multiselect';
export class Inquirer {
  constructor(
    private configFilePath = './inquirer.yaml',
    private outputBasePath = './.inquirer'
  ) {
      fs.mkdirSync(outputBasePath, { recursive: true });
  }

  async run() {
    const yaml = this.yaml();
    await this.parse(yaml);


    this.exit('inquirer succeed!', ReturnCode.OK);
  }

  private exit(message: string, code: number) {
    console.info(message);
    process.exit(code);
  }

  private yaml() {
    try {
      // console.log(process.cwd());
      const inputFile = fs.readFileSync(this.configFilePath, 'utf8');
      const yaml = YAML.parse(inputFile);

      return yaml;
    } catch (e) {
      this.exit(e.message, ReturnCode.ReadConfigFileError);
    }    
  }

  private async parse(yaml: any) {
    for (let inquirer of yaml.inquirers) {
      await this.processInquirer(inquirer);
    }
  }

  private async processInquirer(inquirer: any) {
    const filePath = path.join(this.outputBasePath, inquirer.output);
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
      const response = await prompt(question);    
      if (question.type === 'multiselect') {
        for (let choice of question.choices) {
          console.log('response: ', response);
          parseMultiSelect(choice, response);
        }
      }

      baseObj = Object.assign(baseObj, response);
    }
  }
}
