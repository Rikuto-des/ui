import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const first=JSON.parse(readFileSync(new URL('./current.json',import.meta.url),'utf8'))[0];
export default defineConfig({testDir:'.',testIgnore:'**/runs/**',testMatch:'workflows.spec.ts',outputDir:'../../test-results/competition',workers:4,fullyParallel:true,timeout:20000,retries:0,expect:{timeout:3000},reporter:[['json',{outputFile:resolve(import.meta.dirname,'browser-results.json')}]],use:{baseURL:'http://localhost:4481',viewport:{width:1000,height:800},reducedMotion:'reduce',screenshot:'on',trace:'retain-on-failure'},webServer:{command:'node scripts/serve-static.ts evals/competition/runs 4481',cwd:resolve(import.meta.dirname,'../..'),url:'http://localhost:4481'+first.url,reuseExistingServer:false},projects:[{name:'chromium',use:{browserName:'chromium'}}]});
