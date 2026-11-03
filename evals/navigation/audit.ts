import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname;
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
const read=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
let responses=0,seeds=0;
const evidence:Record<string,string>={};
async function track(path:string){evidence[relative(here,path)]=hash(await readFile(path));}
async function walk(dir:string):Promise<string[]>{const out:string[]=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(e.isFile())out.push(p);}return out;}
for(const run of ['measured-v3','repair-v3']){
 const dir=join(here,'runs',run), rows=await read(join(dir,'results.json'));assert.equal(rows.length,8);
 for(const sample of rows)for(const stage of ['generate','repair','update','update-repair']){
  if(!sample[stage])continue;
  const location=join(dir,sample.id,stage), code=await readFile(join(location,'App.tsx'),'utf8');
  assert.equal(sample[stage].sourceSha256,hash(code));
  assert.equal(sample[stage].pass,!sample[stage].errors.length&&sample[stage].browser.length===4&&sample[stage].browser.every((t:any)=>t.pass));
  await track(join(location,'App.tsx'));await track(join(location,'score.json'));
  if(run==='repair-v3'&&stage==='update'){
   const seed=await read(join(location,'seed.json'));assert.equal(hash(code),seed.seedSha256);
   assert.equal(hash(await readFile(join(here,'runs',seed.sourceRun,sample.id,seed.sourceStage,'App.tsx'))),seed.sourceSha256);
   assert.equal(sample[stage].errors.length,0);assert.deepEqual(sample[stage].browser.filter((t:any)=>!t.pass).map((t:any)=>t.name),['keyboard and dismissal','links and update','320px layout']);
   assert.ok(code.includes('minWidth:640')&&code.includes('Incorrect navigation name')&&code.includes('#broken-docs'));await track(join(location,'seed.json'));seeds++;continue;
  }
  const request=await read(join(location,'request.json')),reply=await read(join(location,'reply.json'));
  assert.equal(hash(request.system),request.systemSha256);assert.equal(hash(request.prompt),request.promptSha256);
  const extracted=[...reply.text.matchAll(/```(?:tsx|jsx|typescript|ts)?\s*\n([\s\S]*?)```/g)].sort((a:any,b:any)=>b[1].length-a[1].length)[0]?.[1];
  assert.equal(code,extracted,'Model response must equal the tested source');assert.equal(reply.toolCalls,0);assert.equal(reply.stopReason,'completed');assert.ok(reply.usage.input_tokens>0);responses++;
  for(const name of ['request.json','reply.json'])await track(join(location,name));
 }
 for(const folder of ['harness','urushi-source'])for(const file of await walk(join(dir,folder)))await track(file);
 for(const sample of rows)await track(join(dir,sample.id,'reference.txt'));
 for(const file of ['protocol.json','results.json','shared.css'])await track(join(dir,file));
}
assert.equal(responses,27);assert.equal(seeds,8);
const report={verifiedAt:new Date().toISOString(),responses,seeds,evidence};
const manifest=join(here,'evidence-manifest.json');
if(process.argv.includes('--write'))await writeFile(manifest,JSON.stringify(report,null,2)+'\n');
else assert.deepEqual(evidence,(await read(manifest)).evidence,'Frozen evidence changed');
console.log(`Verified ${responses} real responses, ${seeds} matched fault fixtures, ${Object.keys(evidence).length} file hashes.`);
