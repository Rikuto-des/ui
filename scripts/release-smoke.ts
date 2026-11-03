import { mkdtemp, mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync, spawnSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const root=resolve(import.meta.dirname,"..");const release=join(root,"dist/release");
const manifest=JSON.parse(await readFile(join(release,"manifest.json"),"utf8"));
const project=await mkdtemp(join(tmpdir(),"urushi-release-consumer-"));const evidence=join(root,"evals/product/release");await mkdir(evidence,{recursive:true});
const result:{project:string;checks:string[];logs:Record<string,string>}={project,checks:[],logs:{}};
const run=(name:string,cmd:string,args:string[])=>{try{const output=execFileSync(cmd,args,{cwd:project,encoding:"utf8",env:{...process.env,npm_config_cache:"/tmp/urushi-npm-cache",NEXT_TELEMETRY_DISABLED:"1"},maxBuffer:10*1024*1024});result.logs[name]=output;result.checks.push(name);return output;}catch(error){result.logs[name]=String(error);throw error;}};
try{
 assert.match(manifest.version,/^\d+\.\d+\.\d+-beta\.\d+$/);
 assert.equal(manifest.tag,"beta");
 assert.equal(manifest.packages.length,7);
 for(const pkg of manifest.packages){
  assert.equal(pkg.version,manifest.version);
  assert.equal(createHash("sha256").update(await readFile(join(release,pkg.file))).digest("hex"),pkg.sha256);
 }
 result.checks.push("seven beta archives match the release manifest");
 await writeFile(join(project,"package.json"),JSON.stringify({name:"fresh-urushi-consumer",private:true,type:"module",dependencies:Object.fromEntries([...manifest.packages.map((pkg:{name:string;file:string})=>[pkg.name,`file:${join(release,pkg.file)}`]),["react","19.3.1"],["react-dom","19.3.1"],["next","16.4.3"]]),devDependencies:{typescript:"6.0.3","@types/react":"19.3.0","@types/react-dom":"19.3.0","@types/node":"26.6.5",vite:"8.3.4"}},null,2));
 run("install seven packed packages","npm",["install","--ignore-scripts","--no-audit","--no-fund"]);
 for(const pkg of manifest.packages){
  const installed=JSON.parse(await readFile(join(project,"node_modules",pkg.name,"package.json"),"utf8"));
  assert.equal(installed.version,manifest.version);
  assert.deepEqual(installed.publishConfig,{access:"public",tag:"beta",registry:"https://registry.npmjs.org/"});
  for(const field of ["dependencies","peerDependencies","optionalDependencies"])
   for(const [name,version] of Object.entries(installed[field]??{}))if(name.startsWith("@urushi/"))assert.equal(version,manifest.version);
 }
 result.checks.push("installed internal dependencies use the exact beta version");
 const cli=join(project,"node_modules/@urushi/cli/src/bin.js");
 run("bundled registry init",process.execPath,[cli,"init"]);const installHelp=run("install components",process.execPath,[cli,"add","button","combobox","data-table","date-picker","command"]);
 assert.ok(installHelp.includes(`@urushi/packs@${manifest.version}`));
 assert.ok(installHelp.includes(`@urushi/react@${manifest.version}`));
 await mkdir(join(project,"src"));await mkdir(join(project,"app"));
 await writeFile(join(project,"src/App.tsx"),`"use client";\nimport {useState} from 'react';\nimport{Button}from '../components/ui/button';import{Combobox}from '../components/ui/combobox';import{DataTable}from '../components/ui/data-table';import{DatePicker}from '../components/ui/date-picker';import{Command}from '../components/ui/command';\nexport default function App(){const[open,setOpen]=useState(false);return <main><h1>Fresh install</h1><Combobox label="Owner" options={[{value:'mika',label:'Mika'}]}/><DatePicker label="Due date"/><DataTable label="Projects" rows={[{id:'one',name:'Website'}]} getRowId={row=>row.id} columns={[{id:'name',header:'Name',cell:row=>row.name,sortValue:row=>row.name}]}/><Button onClick={()=>setOpen(true)}>Commands</Button><Command label="Commands" open={open} onOpenChange={setOpen} items={[{id:'close',label:'Close',onSelect:()=>setOpen(false)}]}/></main>}`);
 await writeFile(join(project,"src/main.tsx"),`import{createRoot}from'react-dom/client';import App from './App';import '@urushi/packs/graphite.css';import './urushi.css';createRoot(document.getElementById('root')!).render(<App/>);`);
 await writeFile(join(project,"src/urushi.css"),run("selected CSS",process.execPath,[cli,"css","button","combobox","data-table","date-picker","command"]));
 await writeFile(join(project,"tsconfig.json"),JSON.stringify({compilerOptions:{target:"ES2022",lib:["DOM","ES2022"],module:"ESNext",moduleResolution:"Bundler",jsx:"react-jsx",strict:true,types:["vite/client"],skipLibCheck:true,noEmit:true,esModuleInterop:true},include:["src","components"]}));
 run("packed type declarations",process.execPath,[join(project,"node_modules/typescript/bin/tsc"),"--noEmit"]);
 run("strict contracts",process.execPath,[cli,"check","--strict","--json"]);
 await writeFile(join(project,"index.html"),`<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><head><meta charset="utf-8"><title>Fresh Urushi</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
 run("Vite production build",process.execPath,[join(project,"node_modules/vite/bin/vite.js"),"build"]);
 const server=spawn(process.execPath,[join(root,"scripts/serve-static.ts"),join(project,"dist"),"3306"],{stdio:"ignore"});
 try {
  let ready=false;for(let attempt=0;attempt<50;attempt++){try{ready=(await fetch("http://localhost:3306")).ok;}catch{}if(ready)break;await new Promise(resolve=>setTimeout(resolve,100));}
  if(!ready)throw Error("Fresh-install preview did not start");
  const scenario={version:1,name:"Packed CLI operates installed components",steps:[{action:"click",target:{role:"button",name:"Commands"}},{action:"expect",target:{role:"dialog",name:"Commands"},visible:true},{action:"press",target:{role:"combobox",name:"Commands"},key:"Escape"},{action:"expect",target:{role:"button",name:"Commands"},focused:true},{action:"axe"}]};
  await writeFile(join(project,"scenario.json"),JSON.stringify(scenario));
  run("packed CLI browser verification",process.execPath,[cli,"verify","--url","http://localhost:3306","--scenario","scenario.json","--out","review","--json"]);
  await cp(join(project,"review"),join(evidence,"packed-cli"),{recursive:true});
 } finally {server.kill("SIGTERM");}
 await writeFile(join(project,"app/layout.tsx"),`import type {ReactNode}from'react';import '@urushi/packs/graphite.css';import '../src/urushi.css';export default function Layout({children}:{children:ReactNode}){return <html lang="en" data-pack="graphite" data-theme="light"><body>{children}</body></html>}`);
 await writeFile(join(project,"app/page.tsx"),`import App from '../src/App';export default function Page(){return <App/>}`);
 await writeFile(join(project,"next.config.mjs"),`export default {output:'export'};`);
 run("Next RSC production build",process.execPath,[join(project,"node_modules/next/dist/bin/next"),"build"]);
 const registry=join(project,"registry");await cp(join(project,"node_modules/@urushi/cli/registry"),registry,{recursive:true});
 const config=JSON.parse(await readFile(join(project,"urushi.json"),"utf8"));config.registry=registry;await writeFile(join(project,"urushi.json"),JSON.stringify(config));
 const wrapper=join(project,"components/ui/button.tsx");await writeFile(wrapper,(await readFile(wrapper,"utf8"))+"\n// Application-owned customization stays here.\n");
 const itemPath=join(registry,"button.json");const item=JSON.parse(await readFile(itemPath,"utf8"));item.version="0.1.1";item.files[0].content="// Registry update: 0.1.1\n"+item.files[0].content;item.files[0].hash="sha256-"+createHash('sha256').update(item.files[0].content).digest('base64');await writeFile(itemPath,JSON.stringify(item));
 const merged=JSON.parse(run("update preserves customization",process.execPath,[cli,"update","button","--json"]));assert.equal(merged[0].status,"merged");assert.match(await readFile(wrapper,"utf8"),/Application-owned customization/);assert.match(await readFile(wrapper,"utf8"),/Registry update: 0.1.1/);
 const ours=(await readFile(wrapper,"utf8")).replace("Registry update: 0.1.1","Application replaces first line");await writeFile(wrapper,ours);item.version="0.1.2";item.files[0].content=item.files[0].content.replace("Registry update: 0.1.1","Registry replaces first line");item.files[0].hash="sha256-"+createHash('sha256').update(item.files[0].content).digest('base64');await writeFile(itemPath,JSON.stringify(item));
 const conflict=spawnSync(process.execPath,[cli,"update","button","--json"],{cwd:project,encoding:"utf8"});assert.equal(conflict.status,2);assert.equal(JSON.parse(conflict.stdout)[0].status,"conflict");assert.match(await readFile(wrapper,"utf8"),/<<<<<<< yours/);result.checks.push("overlapping edit reports conflict with exit 2");result.logs.conflict=conflict.stdout;
 // Resolve the test conflict by retaining the application version; confirm it remains buildable.
 await writeFile(wrapper,ours);run("resolved update typecheck",process.execPath,[join(project,"node_modules/typescript/bin/tsc"),"--noEmit"]);
 await writeFile(join(evidence,"result.json"),JSON.stringify({...result,status:"pass",manifest},null,2));console.log(JSON.stringify({status:"pass",project,checks:result.checks},null,2));
}catch(error){await writeFile(join(evidence,"result.json"),JSON.stringify({...result,status:"fail",error:String(error)},null,2));throw error;}
