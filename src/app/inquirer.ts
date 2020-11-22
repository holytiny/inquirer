import * as fs from 'fs'
import * as YAML from 'yaml'

import { ReturnCode } from '../common/return-code';
export class Inquirer {
  constructor(
    private  configFilePath = './inquirer.yaml'
  ) {
      
  }

  async run() {
    const yaml = this.yaml();

    this.exit('inquirer succeed!', ReturnCode.OK);
  }

  exit(message: string, code: number) {
    console.info(message);
    process.exit(code);
  }

  yaml() {
    try {
      // console.log(process.cwd());
      const inputFile = fs.readFileSync(this.configFilePath, 'utf8');
      const yaml = YAML.parse(inputFile);

      return yaml;
    } catch (e) {
      this.exit(e.message, ReturnCode.ReadConfigFileError);
    }    
  }
}