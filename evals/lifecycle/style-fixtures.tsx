import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { transform } from 'esbuild';
import { selectStyles } from '../../packages/cli/src/styles.ts';
import catalog from '../../packages/cli/src/catalog.generated.json' with { type: 'json' };
const root=resolve(import.meta.dirname,'../..'), out=join(import.meta.dirname,'runs/style-fixtures');await mkdir(out,{recursive:true});
const source=await readFile(join(root,'packages/react/styles/index.css'),'utf8'), packs=await readFile(join(root,'packages/packs/generated/all.css'),'utf8');
const minify=async(css:string)=>(await transform(css,{loader:'css',minify:true})).code;
await writeFile(join(out,'full.css'),await minify(packs+'\n'+source));
const index=[];
for(const contract of catalog) {
  if(contract.name === "toast") continue; // Imperative content is covered by runtime E2E, not this SSR fixture.
  const path=join(root,'apps/site/examples',contract.name+'.tsx'), code=await readFile(path,'utf8');
  const compiled=await transform(code,{loader:'tsx',jsx:'automatic',format:'esm'});
  const modulePath=join(out,contract.name+'.mjs');await writeFile(modulePath,compiled.code);
  const {default:Example}=await import(modulePath);
  const used=catalog.filter(c=>c.parts.some(p=>new RegExp('<'+p.jsx.replaceAll('.','\\.')+'(?:\\s|/|>)').test(code))).map(c=>c.name);
  if(!used.includes(contract.name))throw Error('No example found for '+contract.name);
  await writeFile(join(out,contract.name+'.css'),await minify(packs+'\n'+selectStyles(source,used,catalog)));
  await writeFile(join(out,contract.name+'.html'),`<!doctype html><html lang="ja" data-pack="graphite" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${contract.name}</title><link id="css" rel="stylesheet" href="./full.css"><body><main style="padding:16px;min-height:600px">${renderToStaticMarkup(createElement(Example))}</main></body></html>`);
  index.push({name:contract.name,used});
}
await writeFile(join(out,'index.json'),JSON.stringify(index,null,2));
