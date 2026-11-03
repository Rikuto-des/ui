import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {build} from 'esbuild';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {selectStyles} from '../../packages/cli/src/styles.ts';
import catalog from '../../packages/cli/src/catalog.generated.json' with {type:'json'};
const here=import.meta.dirname,root=resolve(here,'../..'),out=join(here,'runs/release-v2');await mkdir(out,{recursive:true});
for(const name of ['react','core']){
 await cp(join(root,'packages',name,'src'),join(out,'source',name,'src'),{recursive:true});
 await cp(join(root,'packages',name,'package.json'),join(out,'source',name,'package.json'));
}
await cp(join(root,'packages/react/styles/index.css'),join(out,'source/full.css'));
await cp(join(root,'packages/packs/generated/graphite.css'),join(out,'source/graphite.css'));
await writeFile(join(out,'source/contracts.json'),JSON.stringify(catalog,null,2));
const alias:Record<string,string>={};
for(const name of ['react','core'])for(const [key,value] of Object.entries(JSON.parse(await readFile(join(out,'source',name,'package.json'),'utf8')).exports) as [string,string][])if(value.startsWith('./src/'))alias[`@urushi/${name}${key==='.'?'':key.slice(1)}`]=join(out,'source',name,value);
const modules=join(here,'environments/after/node_modules');alias.react=join(modules,'react');alias['react-dom']=join(modules,'react-dom');
const controlled=JSON.parse(await readFile(join(here,'runs/dependency-v2/build-results.json'),'utf8'));
const full=await readFile(join(out,'source/full.css'),'utf8');
await cp(join(here,'runs/dependency-v2/shared.css'),join(out,'shared.css'));
const rows=[],entries=[];
for(const r of controlled.rows.filter((r:any)=>r.arm==='selected')){
 const id=r.id.slice('selected-'.length),dir=join(out,id);await mkdir(dir,{recursive:true});
 await cp(join(here,'runs/dependency-v2/selected',id,'App.tsx'),join(dir,'App.tsx'));
 await writeFile(join(dir,'selected.css'),selectStyles(full,r.selectedNames,catalog));
 await writeFile(join(dir,'entry.tsx'),`import{createRoot}from'react-dom/client';import App from './App.tsx';import './selected.css';import '../source/graphite.css';import{installRuntime}from'@urushi/core';installRuntime();createRoot(document.getElementById('root')!).render(<App/>);`);
 await build({entryPoints:[join(dir,'entry.tsx')],bundle:true,format:'esm',platform:'browser',target:'es2022',jsx:'automatic',minify:true,outdir:join(dir,'dist'),alias,tsconfigRaw:{compilerOptions:{jsx:'react-jsx'}},logLevel:'silent'});
 const isolated=await build({entryPoints:[join(dir,'entry.tsx')],bundle:true,format:'esm',platform:'browser',target:'es2022',jsx:'automatic',minify:true,outdir:join(dir,'isolated'),write:false,alias:Object.fromEntries(Object.entries(alias).filter(([k])=>k!=='react'&&k!=='react-dom')),external:['react','react-dom','react/jsx-runtime','react-dom/client'],tsconfigRaw:{compilerOptions:{jsx:'react-jsx'}},logLevel:'silent'});
 const jsGzip=gzipSync(await readFile(join(dir,'dist/entry.js'))).length,cssGzip=gzipSync(await readFile(join(dir,'dist/entry.css'))).length;
 await writeFile(join(dir,'dist/index.html'),`<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Current Urushi</title><link rel="stylesheet" href="../../shared.css"><link rel="stylesheet" href="./entry.css"><body><main id="root"></main><script type="module" src="./entry.js"></script></body></html>`);
 rows.push({id,task:r.task,sourceSha256:createHash('sha256').update(await readFile(join(dir,'App.tsx'))).digest('hex'),jsGzip,cssGzip,totalGzip:jsGzip+cssGzip+controlled.sharedCssGzip,withoutReactGzip:gzipSync(isolated.outputFiles.find(f=>f.path.endsWith('.js'))!.contents).length});
 entries.push({id,task:r.task,stage:'update',url:`/release-v2/${id}/dist/`});
}
await writeFile(join(out,'results.json'),JSON.stringify(rows,null,2));await writeFile(join(here,'release-current.json'),JSON.stringify(entries,null,2));console.log(rows);
