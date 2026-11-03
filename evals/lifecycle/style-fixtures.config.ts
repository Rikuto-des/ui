import {resolve} from 'node:path';
import config from './playwright.config';
export default {...config,testMatch:'style-fixtures.spec.ts',reporter:[['list'],['json',{outputFile:resolve(import.meta.dirname,'style-fixtures-results.json')}]],outputDir:'../../test-results/style-fixtures'};
