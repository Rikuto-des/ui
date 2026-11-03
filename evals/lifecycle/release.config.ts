import {resolve} from 'node:path';
import config from './playwright.config';
export default {...config,testMatch:'release-workflows.spec.ts',reporter:[['list'],['json',{outputFile:resolve(import.meta.dirname,'release-results.json')}]],outputDir:'../../test-results/release-workflows',projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',use:{browserName:'firefox'}},{name:'webkit',use:{browserName:'webkit'}}]};
