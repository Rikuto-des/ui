import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, rm, access, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { parseArgs } from 'node:util';
import ts from 'typescript';
import { build } from 'esbuild';
import { check } from '../../packages/cli/src/check.ts';
import { tasks, protocol } from './tasks.ts';
import { guide, type Library } from './guides.ts';

const here=import.meta.dirname, root=resolve(here,'../..');
const {values:args}=parseArgs({options:{id:{type:'string',default:'baseline'},trials:{type:'string',default:'2'},libraries:{type:'string',default:'urushi,base,radix,shadcn'},stage:{type:'string',default:'all'},'rescore':{type:'boolean',default:false},provider:{type:'string',default:'codex'},model:{type:'string'}}});
if(!/^[a-z0-9-]+$/.test(args.id!))throw Error('Invalid run id');
if(!['codex','claude'].includes(args.provider!))throw Error('Unknown provider');
// The Claude runs use Claude Code headless with every tool, MCP server and customization off.
const claude=args.provider==='claude', claudeBin=process.env.CLAUDE_BIN??(spawnSync('sh',['-c','ls ~/.claude/local/claude']).status===0?join(process.env.HOME!,'.claude/local/claude'):'claude'), modelName=args.model??(claude?'claude-sonnet-5-5':protocol.model);
const providerName=claude?`Claude Code ${spawnSync(claudeBin,['--version'],{encoding:'utf8'}).stdout.trim()} headless, --safe-mode --tools ""`:protocol.provider;
const runDir=join(here,'runs',args.id!), libs=args.libraries!.split(',') as Library[], trials=Number(args.trials);
const hash=(text:string)=>createHash('sha256').update(text).digest('hex');
const exists=(p:string)=>access(p).then(()=>true,()=>false);
await mkdir(runDir,{recursive:true});
if(!await exists(join(runDir,'harness'))) {
  await mkdir(join(runDir,'harness'));
  for(const name of ['run.ts','tasks.ts','guides.ts','workflows.spec.ts','playwright.config.ts','style.css','package.json','pnpm-lock.yaml','tsconfig.json'])await cp(join(here,name),join(runDir,'harness',name));
}
const manifestPath=join(runDir,'protocol.json');
if(!await exists(manifestPath)) await writeFile(manifestPath,JSON.stringify({...protocol,model:modelName,provider:providerName,trials,libraries:libs,startedAt:new Date().toISOString(),packageVersions:JSON.parse(await readFile(join(here,'package.json'),'utf8')).dependencies,tasks},null,2));
// Archive the Urushi implementation that was tested, not just its Git HEAD (this tree has local edits).
if(!await exists(join(runDir,'urushi-source'))) {
  await cp(join(root,'packages/react/src'),join(runDir,'urushi-source/react'),{recursive:true});
  await cp(join(root,'packages/core/src'),join(runDir,'urushi-source/core'),{recursive:true});
  await cp(join(root,'contracts'),join(runDir,'urushi-source/contracts'),{recursive:true});
  await cp(join(root,'packages/react/styles'),join(runDir,'urushi-source/styles'),{recursive:true});
  await cp(join(root,'packages/packs/generated/graphite.css'),join(runDir,'urushi-source/styles/graphite.css'));
}
const frozen=join(runDir,'urushi-source');
const libraryAliases:Record<string,string>={};
for(const name of ['react','core']) {
  const pkg=JSON.parse(await readFile(join(root,'packages',name,'package.json'),'utf8'));
  const saved=join(frozen,name,'package.json');
  if(!await exists(saved))await writeFile(saved,JSON.stringify(pkg,null,2));
  for(const [key,value] of Object.entries(pkg.exports) as [string,string][])if(value.startsWith('./src/'))libraryAliases[`@urushi/${name}${key==='.'?'':key.slice(1)}`]=join(frozen,name,value.slice(6));
}
type Sample={id:string;library:Library;task:typeof tasks[number];trial:number};
const samples:Sample[]=[];
for(let trial=1;trial<=trials;trial++) for(const [n,task] of tasks.entries()) for(let l=0;l<libs.length;l++) {
  const library=libs[(l+n+trial-1)%libs.length]; samples.push({id:`${library}-${task.id}-${trial}`,library,task,trial});
}
type Stage='generate'|'repair'|'update'|'update-repair';
const stages:Stage[]=['generate','repair','update','update-repair'];
const systemBase=`You are writing one React 19 + strict TypeScript screen for a controlled evaluation. Return only one complete TSX code block with default export App. You have no tools. Use the assigned library's documented primitive for the core dialog/tabs/menu, ordinary HTML or its controls elsewhere. Do not use other UI libraries or recreate the core primitive. No network calls, external assets, test manipulation, ts-ignore/ts-nocheck, or any type escapes. The harness mounts your component in a React client application; React hooks are allowed. It loads all library CSS and runtime, Tailwind v4, and a neutral base stylesheet. Use className=modal for an unstyled dialog popup/content, backdrop for an unstyled backdrop/overlay, menu for an unstyled menu popup/content; stack and row are layout helpers. These helpers are already defined. All libraries have the same viewport and tests. Use the exact accessible labels and messages requested. Do not assume passing typecheck means behavior is correct.`;

async function model(system:string,prompt:string) {
  if(claude)return claudeModel(system,prompt);
  const cwd=await mkdtemp(join(tmpdir(),'urushi-compare-model-'));
  const start=Date.now();
  await writeFile(join(cwd,'instructions.txt'),system);
  try {
    return await new Promise<any>((resolveReply,reject)=>{
      const child=spawn('codex',['exec','--ignore-user-config','--ephemeral','--skip-git-repo-check','--sandbox','read-only','--disable','shell_tool','--disable','shell_snapshot','--disable','apps','--disable','browser_use','--disable','computer_use','--disable','multi_agent','-c','web_search="disabled"','-c','project_doc_max_bytes=0','-c','memories.use_memories=false','-c','memories.generate_memories=false','-c','skills.max_context_tokens=1','-c',`model_instructions_file=${JSON.stringify(join(cwd,'instructions.txt'))}`,'-c',`model_reasoning_effort=${JSON.stringify(protocol.effort)}`,'-m',protocol.model,'--json','-'],{cwd,env:process.env,stdio:['pipe','pipe','pipe']});
      let out='',err='';
      const timer=setTimeout(()=>{child.kill('SIGTERM');reject(Error('Model timeout after 240s'));},240000);
      child.stdout.on('data',(c)=>out+=c);child.stderr.on('data',(c)=>err=(err+c).slice(-1500));
      child.on('error',(e)=>{clearTimeout(timer);reject(e);});
      child.on('close',(code)=>{clearTimeout(timer);try{
        const events=out.split('\n').filter(Boolean).map((s)=>JSON.parse(s));
        const completed=events.find((e)=>e.type==='turn.completed');
        const tools=events.filter((e)=>e.type==='item.completed'&&!['agent_message','reasoning','error'].includes(e.item?.type));
        if(tools.length)throw Error('Tool use invalidates this trial: '+tools.map((e)=>e.item?.type).join(','));
        const messages=events.filter((e)=>e.type==='item.completed'&&e.item?.type==='agent_message');
        const text=messages.at(-1)?.item.text;
        if(code!==0||!completed||!text)throw Error(events.find((e)=>e.type==='error')?.message??`exit ${code}`);
        resolveReply({text,usage:completed.usage,costUsd:null,stopReason:'completed',elapsedMs:Date.now()-start,toolCalls:0,warnings:events.filter((e)=>e.type==='item.completed'&&e.item?.type==='error').map((e)=>e.item)});
      }catch(e){reject(Error(`Model failed: ${String(e)} ${err.slice(-200)}`));}});
      child.stdin.end(prompt);
    });
  } finally {await rm(cwd,{recursive:true,force:true});}
}
async function claudeModel(system:string,prompt:string) {
  const cwd=await mkdtemp(join(tmpdir(),'urushi-compare-model-'));
  const start=Date.now();
  await writeFile(join(cwd,'instructions.txt'),system);
  try {
    return await new Promise<any>((resolveReply,reject)=>{
      const child=spawn(claudeBin,['-p','--safe-mode','--strict-mcp-config','--tools','','--disable-slash-commands','--no-session-persistence','--model',modelName,'--effort',protocol.effort,'--system-prompt-file',join(cwd,'instructions.txt'),'--output-format','json'],{cwd,env:process.env,stdio:['pipe','pipe','pipe']});
      let out='',err='';
      const timer=setTimeout(()=>{child.kill('SIGTERM');reject(Error('Model timeout after 240s'));},240000);
      child.stdout.on('data',(c)=>out+=c);child.stderr.on('data',(c)=>err=(err+c).slice(-1500));
      child.on('error',(e)=>{clearTimeout(timer);reject(e);});
      child.on('close',(code)=>{clearTimeout(timer);try{
        const result=JSON.parse(out);
        const tools=Object.values(result.usage?.server_tool_use??{}).reduce((a:number,b)=>a+Number(b),0);
        if(tools)throw Error('Tool use invalidates this trial');
        if(code!==0||result.is_error||!result.result)throw Error(result.result??`exit ${code}`);
        resolveReply({text:result.result,usage:result.usage,costUsd:result.total_cost_usd??null,stopReason:result.stop_reason,elapsedMs:Date.now()-start,toolCalls:0,warnings:[]});
      }catch(e){reject(Error(`Model failed: ${String(e)} ${err.slice(-200)}`));}});
      child.stdin.end(prompt);
    });
  } finally {await rm(cwd,{recursive:true,force:true});}
}
function extract(text:string){return [...text.matchAll(/```(?:tsx|jsx|typescript|ts)?\s*\n([\s\S]*?)```/g)].sort((a,b)=>b[1].length-a[1].length)[0]?.[1]??null;}
async function pool<T>(items:T[],fn:(x:T)=>Promise<void>){let n=0;await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{while(n<items.length)await fn(items[n++]);}));}
const dirFor=(s:Sample,stage:Stage)=>join(runDir,s.id,stage);
async function readScore(s:Sample,stage:Stage){try{return JSON.parse(await readFile(join(dirFor(s,stage),'score.json'),'utf8'));}catch{return null;}}
async function best(s:Sample,updated=false):Promise<Stage>{const repaired=updated?'update-repair':'repair';return await exists(join(dirFor(s,repaired),'App.tsx'))?repaired:updated?'update':'generate';}

async function generate(s:Sample,stage:Stage){
  const dir=dirFor(s,stage);if(await exists(join(dir,'reply.json')))return;
  await mkdir(dir,{recursive:true});
  const guidePath=join(runDir,s.id,'reference.txt');
  if(!await exists(guidePath))await writeFile(guidePath,await guide(s.library,s.task.id));
  const reference=await readFile(guidePath,'utf8');
  const system=systemBase+`\nAssigned library: ${s.library}.\nReference (source/version recorded with this run):\n`+reference;
  let prompt=s.task.prompt;
  if(stage!=='generate'){
    const prev:Stage=stage==='repair'?'generate':stage==='update'?await best(s):'update';
    const code=await readFile(join(dirFor(s,prev),'App.tsx'),'utf8').catch(()=>'(no code returned)');
    prompt += '\n\nCurrent code:\n```tsx\n'+code+'\n```';
    if(stage==='update'||stage==='update-repair')prompt+='\n\nSpecification update:\n'+s.task.update;
    if(stage==='repair'||stage==='update-repair')prompt+='\n\nFix these measured failures. Return the complete corrected file, preserving all requirements:\n'+JSON.stringify(await readScore(s,prev),null,2).slice(0,20000);
  }
  await writeFile(join(dir,'request.json'),JSON.stringify({system,prompt,systemSha256:hash(system),promptSha256:hash(prompt)},null,2));
  try{
    const reply=await model(system,prompt);const code=extract(reply.text);
    await writeFile(join(dir,'reply.json'),JSON.stringify(reply,null,2));
    if(code)await writeFile(join(dir,'App.tsx'),code);
    console.log(`${s.id} ${stage}: generated ${code?.length??0} chars, ${Math.round(reply.elapsedMs/1000)}s`);
  }catch(e){await writeFile(join(dir,'reply.json'),JSON.stringify({error:String(e)},null,2));console.log(`${s.id} ${stage}: ${e}`);}
}

async function prepare(s:Sample,stage:Stage){
  const dir=dirFor(s,stage), file=join(dir,'App.tsx');
  const code=await readFile(file,'utf8').catch(()=>null);
  const score:any={sample:s.id,library:s.library,task:s.task.id,stage,pass:false,sourceSha256:code?hash(code):null,sourceBytes:code?Buffer.byteLength(code):0,errors:[],browser:[],libraryDiagnostics:[]};
  if(!code){score.errors.push('No TSX response');return score;}
  const imports=[...code.matchAll(/from\s*['"]([^'"]+)['"]/g)].map((m)=>m[1]);
  const prefix=s.library==='urushi'?'@urushi/react':s.library==='base'?'@base-ui/react':s.library==='radix'?'radix-ui':'@/components/ui/';
  if(!imports.some((i)=>i.startsWith(prefix)))score.errors.push('Required library not imported');
  const allowed=(i:string)=>i==='react'||i.startsWith(prefix);
  if(imports.some((i)=>!allowed(i)))score.errors.push('Unsupported import: '+imports.filter((i)=>!allowed(i)).join(','));
  if(/@ts-(ignore|nocheck)|\bas\s+any\b/.test(code))score.errors.push('Type checking suppression is not allowed');
  if(!/<(?:\w+\.)*(?:Dialog\w*|Tabs\w*|Menu\w*|DropdownMenu\w*|Root)\b/.test(code))score.errors.push('Required primitive is not used in JSX');
  const config={compilerOptions:{target:'ES2023',lib:['ES2023','DOM','DOM.Iterable'],module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,noEmit:true,skipLibCheck:true,allowImportingTsExtensions:true,paths:{'@urushi/react':[join(frozen,'react/index.ts')],'@urushi/react/*':[join(frozen,'react/*')],'@urushi/core/*':[join(frozen,'core/*')],'@/components/ui/*':[join(here,'ui/*')],'react':[join(here,'node_modules/@types/react/index.d.ts')],'react/*':[join(here,'node_modules/@types/react/*')],'react-dom':[join(here,'node_modules/@types/react-dom/index.d.ts')],'react-dom/*':[join(here,'node_modules/@types/react-dom/*')]}},files:[file]};
  await writeFile(join(dir,'tsconfig.json'),JSON.stringify(config));
  const parsed=ts.parseJsonConfigFileContent(config,ts.sys,dir);
  const program=ts.createProgram(parsed.fileNames,parsed.options);
  score.errors.push(...ts.getPreEmitDiagnostics(program).map((d)=>{
    const p=d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start):null;
    return `${d.file?relative(dir,d.file.fileName):'config'}:${p?p.line+1:''} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText,'\n')}`;
  }));
  if(s.library==='urushi'){
    const diagnostics=await check(dir,{strict:true});score.libraryDiagnostics=diagnostics.issues;
  }
  await writeFile(join(dir,'entry.tsx'),`import React from 'react';import{createRoot}from'react-dom/client';import App from './App.tsx';\n${s.library==='urushi'?`import '${join(frozen,'styles/index.css')}';import '${join(frozen,'styles/graphite.css')}';import{installRuntime}from'@urushi/core';installRuntime();`:''}\ncreateRoot(document.getElementById('root')!).render(<App/>);`);
  try{
    const result=await build({entryPoints:[join(dir,'entry.tsx')],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outdir:join(dir,'dist'),write:true,metafile:true,alias:{...libraryAliases,'@/components/ui':join(here,'ui'),react:join(here,'node_modules/react'),'react-dom':join(here,'node_modules/react-dom')},logLevel:'silent'});
    const js=await readFile(join(dir,'dist/entry.js'));score.bundleGzip=gzipSync(js).length;
    score.bundleInputs=Object.keys(result.metafile!.inputs).length;
    const isolated=await build({entryPoints:[join(dir,'entry.tsx')],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outdir:join(dir,'isolated'),write:false,external:['react','react-dom','react/jsx-runtime','react-dom/client'],alias:{...libraryAliases,'@/components/ui':join(here,'ui')},logLevel:'silent'});
    score.withoutReactGzip=gzipSync(isolated.outputFiles.find(f=>f.path.endsWith('.js'))!.contents).length;
    const css=await exists(join(dir,'dist/entry.css'))?'<link rel="stylesheet" href="./entry.css">':'';
    await writeFile(join(dir,'dist/index.html'),`<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>UI workflow evaluation</title><link rel="stylesheet" href="../../../shared.css">${css}<body><main id="root"></main><script type="module" src="./entry.js"></script></body></html>`);
  }catch(e){score.errors.push('Build: '+String(e).slice(0,5000));}
  return score;
}

async function scoreStage(stage:Stage,active:Sample[]){
  const entries=[];
  for(const s of active){const score=await prepare(s,stage);await writeFile(join(dirFor(s,stage),'score.json'),JSON.stringify(score,null,2));if(!score.errors.length)entries.push({id:s.id,task:s.task.id,stage,url:`/${args.id}/${s.id}/${stage}/dist/`});}
  const tw=spawnSync('pnpm',['--dir',here,'exec','tailwindcss','-i',join(here,'style.css'),'-o',join(runDir,'shared.css'),'--minify'],{cwd:root,encoding:'utf8'});if(tw.status!==0)throw Error(tw.stderr);
  await writeFile(join(here,'current.json'),JSON.stringify(entries));
  if(entries.length){
    const result=spawnSync('pnpm',['exec','playwright','test','-c','evals/competition/playwright.config.ts'],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
    await writeFile(join(runDir,stage+'-test.log'),result.stdout+'\n'+result.stderr);
    const report=JSON.parse(await readFile(join(here,'browser-results.json'),'utf8'));
    await writeFile(join(runDir,stage+'-browser-results.json'),JSON.stringify(report,null,2));
    await cp(join(root,'test-results/competition'),join(runDir,stage+'-browser-artifacts'),{recursive:true});
    const specs:any[]=[];const walk=(s:any)=>{specs.push(...(s.specs??[]));for(const sub of s.suites??[])walk(sub);};for(const suite of report.suites)walk(suite);
    if(report.errors?.length || specs.length!==entries.length*4)throw Error('Browser harness did not execute the complete test set; this is an infrastructure failure, not a model score.');
    for(const s of active){
      const path=join(dirFor(s,stage),'score.json'),score=JSON.parse(await readFile(path,'utf8'));
      score.browser=specs.filter(x=>x.title.startsWith(s.id+' | ')).map(x=>({name:x.title.split(' | ')[1],pass:x.ok,errors:x.tests.flatMap((t:any)=>t.results.flatMap((r:any)=>r.errors??[])).map((e:any)=>(e.message??String(e)).replace(/\u001b\[[0-9;]*m/g,''))}));
      score.pass=score.errors.length===0&&score.browser.length===4&&score.browser.every((t:any)=>t.pass);
      await writeFile(path,JSON.stringify(score,null,2));
    }
  }
  for(const s of active){const score=await readScore(s,stage);console.log(`${s.id} ${stage}: ${score.pass?'PASS':'FAIL'} (${score.errors.length} compile/format; ${score.browser.filter((x:any)=>!x.pass).map((x:any)=>x.name).join(', ')})`);}
}

for(const stage of stages){
  if(args.stage!=='all'&&args.stage!==stage)continue;
  let active=samples;
  if(stage==='repair'||stage==='update-repair'){
    const previous=stage==='repair'?'generate':'update';
    active=[];for(const s of samples)if(args.rescore?await exists(join(dirFor(s,stage),'reply.json')):!(await readScore(s,previous))?.pass)active.push(s);
  }
  if(!active.length)continue;
  if(!args.rescore)await pool(active,s=>generate(s,stage));
  await scoreStage(stage,active);
}
const results=[];
for(const s of samples){const row:any={id:s.id,library:s.library,task:s.task.id,trial:s.trial};for(const stage of stages)row[stage]=await readScore(s,stage);results.push(row);}
await writeFile(join(runDir,'results.json'),JSON.stringify(results,null,2));
console.log('Saved '+join(runDir,'results.json'));
