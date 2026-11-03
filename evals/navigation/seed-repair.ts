import {mkdir,readFile,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {parseArgs} from 'node:util';
import ts from 'typescript';
import {protocol,tasks} from './tasks.ts';
const {values}=parseArgs({options:{source:{type:'string',default:'measured-v3'},id:{type:'string',default:'repair-v3'}}});
const here=import.meta.dirname, source=values.source!, id=values.id!, out=join(here,'runs',id);
if(![source,id].every(value=>/^[a-z0-9-]+$/.test(value)))throw Error('Invalid run id');
if(await access(out).then(()=>true,()=>false))throw Error('Refusing to overwrite a seeded repair run');
await mkdir(out,{recursive:true});
await writeFile(join(out,'seed-plan.ts'),await readFile(new URL(import.meta.url),'utf8'));
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const cases=[];
for(const library of protocol.libraries)for(const trial of [1,2]){
  const sample=`${library}-navigation-menu-${trial}`;
  const sourceStage=await access(join(here,'runs',source,sample,'update-repair/App.tsx')).then(()=>'update-repair',()=>'update');
  const sourceScore=JSON.parse(await readFile(join(here,'runs',source,sample,sourceStage,'score.json'),'utf8'));
  if(!sourceScore.pass)throw Error('Repair study requires every source screen to have passed: '+sample);
  const original=await readFile(join(here,'runs',source,sample,sourceStage,'App.tsx'),'utf8');
  if(!original.includes('Main navigation')||!original.includes('#docs'))throw Error('Missing mutation target');
  let broken=original.replaceAll('Main navigation','Incorrect navigation name').replaceAll('#docs','#broken-docs');
  const ast=ts.createSourceFile('App.tsx',broken,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const app=ast.statements.find(s=>ts.isFunctionDeclaration(s)&&s.name?.text==='App');
  if(!app||!ts.isFunctionDeclaration(app)||!app.body)throw Error('No App function');
  const statement=app.body.statements.findLast(ts.isReturnStatement),expression=statement?.expression;
  if(!expression)throw Error('No App return expression');
  broken=broken.slice(0,expression.getStart(ast))+'<div style={{minWidth:640}}>{'+expression.getText(ast)+'}</div>'+broken.slice(expression.end);
  const dir=join(out,sample,'update');await mkdir(dir,{recursive:true});
  await writeFile(join(dir,'App.tsx'),broken);
  // This is an injected fault fixture, never represented as a model response.
  await writeFile(join(dir,'seed.json'),JSON.stringify({sourceRun:source,sourceStage,sourceSha256:hash(original),seedSha256:hash(broken),mutations:['navigation accessible name changed','Guides href #docs changed to #broken-docs','outer wrapper min-width 640px added']},null,2));
  cases.push(sample);
}
await writeFile(join(out,'protocol.json'),JSON.stringify({...protocol,study:'Seeded repair of the successful specification-update outputs',startedAt:new Date().toISOString(),id,sourceRun:source,generationAttempts:0,repairAttempts:0,updateAttempts:0,updateRepairAttempts:1,cases,tasks,repairSpecification:'Original generation requirements plus the specification update; three identical semantic faults; one fresh model response with measured diagnostics. No manual edits to repair outputs.'},null,2));
