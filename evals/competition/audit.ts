import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const here=import.meta.dirname, id=process.argv[2]??'measured-v4', dir=join(here,'runs',id);
assert.match(id,/^[a-z0-9-]+$/);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const results=JSON.parse(await readFile(join(dir,'results.json'),'utf8'));
const hashes:Record<string,string>={};
for(const file of ['run.ts','tasks.ts','guides.ts','workflows.spec.ts','playwright.config.ts','style.css','package.json','pnpm-lock.yaml','tsconfig.json']){
  const current=await readFile(join(here,file),'utf8'), frozen=await readFile(join(dir,'harness',file),'utf8');
  assert.equal(current,frozen,`${file} changed during the final evaluation`);hashes[file]=sha(frozen);
}
const references=new Map<string,string>();let responses=0;
for(const row of results){
  const reference=await readFile(join(dir,row.id,'reference.txt'),'utf8');
  const key=`${row.library}/${row.task}`;
  if(references.has(key))assert.equal(sha(reference),references.get(key),`${key}: trials received different references`);
  references.set(key,sha(reference));
  for(const stage of ['generate','repair','update','update-repair'])if(row[stage]){
    const folder=join(dir,row.id,stage);
    const source=await readFile(join(folder,'App.tsx'),'utf8');
    const request=JSON.parse(await readFile(join(folder,'request.json'),'utf8'));
    const reply=JSON.parse(await readFile(join(folder,'reply.json'),'utf8'));
    assert.equal(sha(source),row[stage].sourceSha256);
    assert.equal(sha(request.system),request.systemSha256);assert.equal(sha(request.prompt),request.promptSha256);
    const extracted=[...reply.text.matchAll(/```(?:tsx|jsx|typescript|ts)?\s*\n([\s\S]*?)```/g)].sort((a,b)=>b[1].length-a[1].length)[0]?.[1];
    assert.equal(source,extracted,`${row.id}/${stage}: the scored source differs from the model response`);
    assert.equal(reply.toolCalls,0);assert.ok(reply.usage.input_tokens>0&&reply.usage.output_tokens>0);
    assert.equal(row[stage].browser.length,4,`${row.id}/${stage}: incomplete browser tests`);
    responses++;
  }
}
const report={run:id,verifiedAt:new Date().toISOString(),samples:results.length,responses,checks:['unchanged harness','same references per library/task','request hashes','unmodified model output hashes','zero model tool calls','four browser tests per scored response'],harness:hashes,references:Object.fromEntries(references)};
await writeFile(join(dir,'audit.json'),JSON.stringify(report,null,2));
console.log(`Audited ${responses} responses across ${results.length} samples.`);
