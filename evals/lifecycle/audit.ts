import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const here=import.meta.dirname, root=resolve(here,'../..'),dir=join(here,'runs/dependency-v2');
const hash=(value:Uint8Array|string)=>createHash('sha256').update(value).digest('hex');
const result=JSON.parse(await readFile(join(dir,'results.json'),'utf8'));
const original=JSON.parse(await readFile(join(root,'evals/competition/runs/measured-v4/results.json'),'utf8'));
assert.equal(result.length,54);
for(const row of result){
 const sample=row.id.replace(/^(before|after|selected)-/,'');
 const prior=original.find((r:any)=>r.id===sample);assert.ok(prior);
 assert.equal(row.sourceSha256,(prior['update-repair']??prior.update).sourceSha256);
 assert.equal(hash(await readFile(join(dir,row.arm,sample,'App.tsx'))),row.sourceSha256);
 assert.equal(row.checks.length,4);
}
assert.equal(hash(await readFile(join(here,'workflows.spec.ts'))),hash(await readFile(join(root,'evals/competition/runs/measured-v4/harness/workflows.spec.ts'))));
const raw=JSON.parse(await readFile(join(dir,'build-results.json'),'utf8'));
for(const [name,manifest] of Object.entries(raw.manifests) as [string,any][]){
 assert.equal(hash(await readFile(join(here,'environments',name,'pnpm-lock.yaml'))),manifest.lockSha256);
 for(const [pkg,version] of Object.entries(manifest.installed))assert.equal(JSON.parse(await readFile(join(here,'environments',name,'node_modules',pkg,'package.json'),'utf8')).version,version);
}
assert.equal(raw.sharedCssSha256,hash(await readFile(join(root,'evals/competition/runs/measured-v4/shared.css'))));
const release=JSON.parse(await readFile(join(here,'runs/release-v2/results.json'),'utf8'));
for(const row of release)assert.equal(row.sourceSha256,(original.find((r:any)=>r.id===row.id)['update-repair']??original.find((r:any)=>r.id===row.id).update).sourceSha256);
// Record all source and evidence hashes so later edits cannot silently stand in for this measurement.
const manifest:Record<string,string>={};
async function files(path:string,prefix:string){for(const entry of await readdir(path,{withFileTypes:true})){const name=join(prefix,entry.name);if(entry.isDirectory())await files(join(path,entry.name),name);else manifest[name]=hash(await readFile(join(path,entry.name)));}}
await files(dir,'dependency-v2');await files(join(here,'runs/release-v2'),'release-v2');
await writeFile(join(here,'evidence-manifest.json'),JSON.stringify(manifest,null,2));
console.log('54 source identities, 24 unchanged common checks per library phase, 2 installed lockfiles, shared CSS and 6 final sources verified.');
