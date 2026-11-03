import { readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import ts from 'typescript';
import { selectStyles } from '../../packages/cli/src/styles.ts';
import catalog from '../../packages/cli/src/catalog.generated.json' with { type: 'json' };
const here=import.meta.dirname, root=resolve(here,'../..'), prior=join(root,'evals/competition/runs/measured-v4');
const exists=(p:string)=>access(p).then(()=>true,()=>false);
const hash=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
const runId=process.argv[2] ?? 'dependency-v2';
if(!/^[a-z0-9-]+$/.test(runId))throw Error('Invalid run id');
const out=join(here,'runs',runId);
if(await exists(join(out,'build-results.json')))throw Error('Run already recorded. Supply a new run id to preserve evidence.');
await mkdir(out,{recursive:true});
if(!await exists(join(out,'source'))) {
  await cp(join(prior,'urushi-source'),join(out,'source/urushi'),{recursive:true});
  await cp(join(root,'evals/competition/ui'),join(out,'source/ui'),{recursive:true});
  await cp(join(here,'protocol.json'),join(out,'protocol.json'));
  await cp(join(here,'run.ts'),join(out,'run.ts'));
  await cp(join(root,'packages/cli/src/styles.ts'),join(out,'styles.ts'));
  await writeFile(join(out,'contracts.json'),JSON.stringify(catalog));
}
const frozen=join(out,'source/urushi'), aliases:Record<string,string>={};
for(const pkg of ['react','core']) {
  const info=JSON.parse(await readFile(join(frozen,pkg,'package.json'),'utf8'));
  for(const [key,value] of Object.entries(info.exports) as [string,string][])if(value.startsWith('./src/'))aliases[`@urushi/${pkg}${key==='.'?'':key.slice(1)}`]=join(frozen,pkg,value.slice(6));
}
const results=JSON.parse(await readFile(join(prior,'results.json'),'utf8'));
const shared=await readFile(join(prior,'shared.css'));await writeFile(join(out,'shared.css'),shared);
const fullStyles=await readFile(join(frozen,'styles/index.css'),'utf8');
const report:any[]=[];const entries=[];const manifests:any={};
for(const arm of ['before','after','selected']) {
  const environment=arm==='before'?'before':'after', env=join(here,'environments',environment), modules=join(env,'node_modules');
  const manifest=JSON.parse(await readFile(join(env,'package.json'),'utf8'));
  const installed:Record<string,string>={};
  for(const pkg of Object.keys(manifest.dependencies)) installed[pkg]=JSON.parse(await readFile(join(modules,pkg,'package.json'),'utf8')).version;
  if(Object.keys(installed).some(k=>installed[k]!==manifest.dependencies[k]))throw Error('Installed versions do not match manifest');
  manifests[environment]={installed,lockSha256:hash(await readFile(join(env,'pnpm-lock.yaml')))};
  for(const row of results) {
    if(arm==='selected'&&row.library!=='urushi')continue;
    const stage=row['update-repair']?'update-repair':'update', code=await readFile(join(prior,row.id,stage,'App.tsx'),'utf8');
    const dir=join(out,arm,row.id);await mkdir(dir,{recursive:true});await writeFile(join(dir,'App.tsx'),code);
    const sourceSha256=hash(code);if(sourceSha256!==(row['update-repair']??row.update).sourceSha256)throw Error('Model output hash mismatch');
    const config={compilerOptions:{target:'ES2023',lib:['ES2023','DOM','DOM.Iterable'],module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,noEmit:true,skipLibCheck:true,allowImportingTsExtensions:true,paths:{'@urushi/react':[join(frozen,'react/index.ts')],'@urushi/react/*':[join(frozen,'react/*')],'@urushi/core/*':[join(frozen,'core/*')],'@/components/ui/*':[join(out,'source/ui/*')],'react':[join(modules,'@types/react/index.d.ts')],'react/*':[join(modules,'@types/react/*')],'react-dom':[join(modules,'@types/react-dom/index.d.ts')],'react-dom/*':[join(modules,'@types/react-dom/*')],'*':[join(modules,'*')]}},files:[join(dir,'App.tsx')]};
    await writeFile(join(dir,'tsconfig.json'),JSON.stringify(config));const parsed=ts.parseJsonConfigFileContent(config,ts.sys,dir);const program=ts.createProgram(parsed.fileNames,parsed.options);
    const errors=ts.getPreEmitDiagnostics(program).map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n'));
    const selectedNames=[...code.matchAll(/\bimport\s*{([^}]+)}\s*from\s*['"]@urushi\/react(?:\/[^'"]+)?['"]/g)].flatMap(m=>m[1].split(',').map(s=>s.trim().split(/\s/)[0])).flatMap(name=>catalog.filter(c=>c.parts.some(p=>p.jsx.split('.')[0]===name)).map(c=>c.name));
    if(arm==='selected')await writeFile(join(dir,'selected.css'),selectStyles(fullStyles,selectedNames,catalog));
    const css=arm==='selected'?join(dir,'selected.css'):join(frozen,'styles/index.css');
    await writeFile(join(dir,'entry.tsx'),`import{createRoot}from'react-dom/client';import App from './App.tsx';${row.library==='urushi'?`import '${css}';import '${join(frozen,'styles/graphite.css')}';import{installRuntime}from'@urushi/core';installRuntime();`:''}createRoot(document.getElementById('root')!).render(<App/>);`);
    let jsGzip=0,cssGzip=0;
    try {
      const deps=Object.fromEntries(Object.keys(installed).filter(k=>!k.startsWith('@types/')&&!['tailwindcss','@tailwindcss/cli','tw-animate-css'].includes(k)).map(k=>[k,join(modules,k)]));
      await build({entryPoints:[join(dir,'entry.tsx')],bundle:true,format:'esm',platform:'browser',target:'es2022',jsx:'automatic',minify:true,outdir:join(dir,'dist'),alias:{...aliases,'@/components/ui':join(out,'source/ui')},logLevel:'silent',tsconfigRaw:{compilerOptions:{jsx:'react-jsx'}},plugins:[{name:'installed-environment',setup(b){b.onResolve({filter:/^(?:react(?:\/|$)|react-dom(?:\/|$)|@base-ui\/react(?:\/|$)|radix-ui(?:\/|$)|class-variance-authority(?:\/|$)|cn(?:\/|$)|lucide-react(?:\/|$))/},args=>{if(args.pluginData?.environmentResolved)return;return b.resolve(args.path,{resolveDir:env,kind:args.kind,pluginData:{environmentResolved:true}});});}}]});
      jsGzip=gzipSync(await readFile(join(dir,'dist/entry.js'))).length;
      const hasCss=await exists(join(dir,'dist/entry.css'));if(hasCss)cssGzip=gzipSync(await readFile(join(dir,'dist/entry.css'))).length;
      await writeFile(join(dir,'dist/index.html'),`<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dependency upgrade</title><link rel="stylesheet" href="../../../shared.css">${hasCss?'<link id="library-css" rel="stylesheet" href="./entry.css">':''}<body><main id="root"></main><script type="module" src="./entry.js"></script></body></html>`);
    }catch(error){errors.push(String(error));}
    const id=arm+'-'+row.id;
    report.push({id,arm,library:row.library,task:row.task,sourceStage:stage,sourceSha256,errors,jsGzip,cssGzip,totalGzip:jsGzip+cssGzip+gzipSync(shared).length,selectedNames});
    if(!errors.length)entries.push({id,task:row.task,stage:'update',url:`/${runId}/${arm}/${row.id}/dist/`});
    console.log(id,errors.length?'FAIL '+errors.join('; ').slice(0,300):`${jsGzip}+${cssGzip} bytes gzip`);
  }
}
await writeFile(join(out,'build-results.json'),JSON.stringify({sharedCssSha256:hash(shared),sharedCssGzip:gzipSync(shared).length,manifests,rows:report},null,2));
await writeFile(join(here,'current.json'),JSON.stringify(entries,null,2));
