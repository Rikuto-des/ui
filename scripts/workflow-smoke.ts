import {mkdir,writeFile,readFile,realpath}from'node:fs/promises';
import{resolve,join}from'node:path';import{createServer}from'node:http';import assert from'node:assert/strict';
import{workflow}from'../packages/cli/src/workflow.ts';
const root=resolve(import.meta.dirname,'..'),folder=resolve(root,'test-results/workflow-smoke-'+Date.now());await mkdir(folder,{recursive:true});const cwd=await realpath(folder);
const original=`import{useState}from'react';export default function App(){const[n,set]=useState(0);return <main><h1>Counter {n}</h1><button onClick={()=>set(n+0)}>Add</button></main>}`;
await writeFile(join(cwd,'App.tsx'),original);
await writeFile(join(cwd,'entry.tsx'),`import{createRoot}from'react-dom/client';import App from './App.tsx';createRoot(document.getElementById('root')!).render(<App/>);`);
await writeFile(join(cwd,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2023',module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,allowImportingTsExtensions:true,noEmit:true},files:['App.tsx']}));
await writeFile(join(cwd,'build.mjs'),`import{build}from'esbuild';await build({entryPoints:['entry.tsx'],bundle:true,outfile:'app.js'});`);
await writeFile(join(cwd,'adapter.mjs'),`let s='';for await(const c of process.stdin)s+=c;const r=JSON.parse(s),f=r.sources[0];if(!r.checks[0].scenario.steps.length)throw Error('Complete scenario missing');process.stdout.write(JSON.stringify({edits:[{path:f.path,beforeSha256:f.sha256,content:f.content.replace('n+0','n+'+process.argv[2])}]}));`);
await writeFile(join(cwd,'scenario.json'),JSON.stringify({version:1,name:'Counter increments once',steps:[{action:'click',target:{role:'button',name:'Add'}},{action:'expect',target:{role:'heading',name:'Counter 1'},visible:true}]}));
const server=createServer(async(req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(join(cwd,'app.js')));}else res.end('<!doctype html><html lang="en"><title>Workflow smoke</title><main id="root"></main><script src="/app.js"></script></html>');});
await new Promise<void>(done=>server.listen(0,'127.0.0.1',done));const address=server.address();assert(address&&typeof address==='object');
const config={version:1,sources:['App.tsx'],build:[process.execPath,'build.mjs'],checks:[{name:'counter',url:`http://127.0.0.1:${address.port}`,scenario:'scenario.json'}],repair:{command:[process.execPath,'adapter.mjs','2'],maxAttempts:1}};
try{
 await writeFile(join(cwd,'workflow.json'),JSON.stringify(config));let result=await workflow({cwd,config:'workflow.json',out:'failed',repair:true});assert.equal(result.status,'fail');assert.equal(result.rollback,true);assert.equal(await readFile(join(cwd,'App.tsx'),'utf8'),original);assert.equal(result.requestCount,1);
 config.repair.command[2]='1';await writeFile(join(cwd,'workflow.json'),JSON.stringify(config));result=await workflow({cwd,config:'workflow.json',out:'passed',repair:true});assert.equal(result.status,'pass');assert.equal(result.requestCount,1);assert.match(await readFile(join(cwd,'App.tsx'),'utf8'),/n\+1/);
 console.log(JSON.stringify({status:'pass',checks:['actual browser failure','rejected candidate rollback','complete unchanged scenario sent to adapter','accepted candidate passes replay'],evidence:cwd}));
}finally{await new Promise<void>(done=>server.close(()=>done()));}
