import { resolve } from 'node:path';
import config from './playwright.config';
export default {...config,testMatch:'css-equivalence.spec.ts',reporter:[['list'],['json',{outputFile:resolve(import.meta.dirname,'css-results.json')}]],outputDir:'../../test-results/css-equivalence'};
