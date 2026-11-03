/** Summarize every fixed confirmation trial; never select trials by outcome. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=resolve(here,'../..');
const runIds=['composition-luna-v2','composition-sol-v2'];
const phases=['generate','repair','update','update-repair'];
const json=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
const optional=async(path:string)=>json(path).catch(()=>null);
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const median=(values:number[])=>{if(!values.length)return null;const a=[...values].sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
const trials:any[]=[];const audits:any[]=[];
for(const id of runIds){
 const dir=join(here,'runs',id),protocol=await json(join(dir,'protocol.json')),results=await json(join(dir,'results.json'));
 if(results.length!==6)throw Error('Incomplete trial inventory: '+id);
 for(const row of results){
  const stages=[];
  for(const phase of phases){
   const path=join(dir,row.id,phase),reply=await optional(join(path,'reply.json'));if(!reply)continue;
   const request=await json(join(path,'request.json')),score=await json(join(path,'score.json'));
   const source=await readFile(join(path,'App.tsx'),'utf8').catch(()=>null);
   if(hash(request.system)!==request.systemSha256||hash(request.prompt)!==request.promptSha256)throw Error('Request hash mismatch: '+path);
   if(source&&hash(source)!==score.sourceSha256)throw Error('Source hash mismatch: '+path);
   if(reply.toolCalls>0)throw Error('Unexpected tool calls: '+path);
   stages.push({phase,pass:score.pass,infrastructureError:reply.error??null,sourceBytes:score.sourceBytes,sourceSha256:score.sourceSha256,requestSystemSha256:request.systemSha256,requestPromptSha256:request.promptSha256,usage:reply.usage??null,elapsedMs:reply.elapsedMs??null,toolCalls:reply.toolCalls??null,browserPassed:score.browser.filter((x:any)=>x.pass).length,browserTotal:score.browser.length,failures:[...score.errors,...score.browser.filter((x:any)=>!x.pass).map((x:any)=>x.name)],cssGzip:score.cssGzip,sharedCssGzip:score.sharedCssGzip,totalWithReactGzip:score.totalWithReactGzip,totalWithoutReactGzip:score.totalWithoutReactGzip});
  }
  const stage=(name:string)=>stages.find(s=>s.phase===name),initial=stage('repair')??stage('generate'),final=stage('update-repair')??stage('update');
  const infrastructure=stages.some(s=>s.infrastructureError)||!stage('generate')||!stage('update');
  const reference=await readFile(join(dir,row.id,'reference.txt'),'utf8');
  trials.push({run:id,model:protocol.model,library:row.library,trial:row.trial,infrastructure,referenceChars:reference.length,referenceSha256:hash(reference),generatePass:stage('generate')?.pass??false,initialPass:initial?.pass??false,updatePass:stage('update')?.pass??false,finalPass:final?.pass??false,calls:stages.length,inputTokens:stages.reduce((s,r)=>s+(r.usage?.input_tokens??0),0),outputTokens:stages.reduce((s,r)=>s+(r.usage?.output_tokens??0),0),final,stages});
 }
 const frozenFiles=['composition-run.ts','composition-task.ts','composition-guide.ts','guides.ts','composition-workflows.spec.ts','composition-playwright.config.ts','composition.css','package.json','pnpm-lock.yaml'];
 audits.push({run:id,protocol,harness:await Promise.all(frozenFiles.map(async name=>({name,sha256:hash(await readFile(join(dir,'harness',name),'utf8'))}))) });
}
// All references for a library must match across model and trial, and both runs
// must have exactly the same harness. Frozen library source hashes are exported.
for(const library of ['urushi','base'])if(new Set(trials.filter(t=>t.library===library).map(t=>t.referenceSha256)).size!==1)throw Error('Reference drift: '+library);
if(JSON.stringify(audits[0].harness)!==JSON.stringify(audits[1].harness))throw Error('Harness differs between models');
function aggregate(rows:any[]){return ['urushi','base'].map(library=>{const all=rows.filter(t=>t.library===library),eligible=all.filter(t=>!t.infrastructure);return {library,requested:all.length,n:eligible.length,infrastructure:all.length-eligible.length,generate:eligible.filter(t=>t.generatePass).length,afterRepair:eligible.filter(t=>t.initialPass).length,update:eligible.filter(t=>t.updatePass).length,final:eligible.filter(t=>t.finalPass).length,calls:all.reduce((n,t)=>n+t.calls,0),medianOutputTokens:median(eligible.map(t=>t.outputTokens)),medianInputTokens:median(eligible.map(t=>t.inputTokens)),medianFinalSourceBytes:median(eligible.map(t=>t.final.sourceBytes)),referenceChars:all[0].referenceChars,passedSizes:eligible.filter(t=>t.finalPass).map(t=>({run:t.run,trial:t.trial,withReact:t.final.totalWithReactGzip,withoutReact:t.final.totalWithoutReactGzip,css:t.final.cssGzip,sharedCss:t.final.sharedCssGzip}))};});}
const models=[...new Set(trials.map(t=>t.model))].map(model=>({model,libraries:aggregate(trials.filter(t=>t.model===model))}));
const libraries=aggregate(trials);const [u,b]=libraries;
const reduction=u.medianOutputTokens!==null&&b.medianOutputTokens?1-u.medianOutputTokens/b.medianOutputTokens:null;
const pairedSizes=trials.filter(t=>t.library==='urushi'&&t.finalPass&&!t.infrastructure).flatMap(t=>{const peer=trials.find(p=>p.run===t.run&&p.trial===t.trial&&p.library==='base'&&p.finalPass&&!p.infrastructure);return peer?[{model:t.model,trial:t.trial,urushi:t.final.totalWithReactGzip,base:peer.final.totalWithReactGzip,reduction:1-t.final.totalWithReactGzip/peer.final.totalWithReactGzip}]:[];});
const ledger=(await readFile(join(here,'studies/composition-20261029/requests.jsonl'),'utf8')).trim().split('\n').map(s=>JSON.parse(s));
const starts=ledger.filter(x=>x.event==='start');
const summary={version:2,measuredAt:new Date().toISOString(),libraries,models,trials,pairedSizes,audits,requestLedger:{total:starts.length,exploratory:starts.filter(x=>x.run==='composition-luna-v1').length,confirmation:starts.filter(x=>runIds.includes(x.run)).length,ceiling:72},decision:{metric:'Median total model output tokens across generation, repair, update and update repair per requested trial. All valid trials included, regardless of pass.',outputReduction:reduction,criterionMet:u.n===6&&b.n===6&&u.final>=b.final&&reduction!==null&&reduction>=.30,limitations:['Six trials per library across two models; this does not establish general success rates.','References differ by library and length; input-token differences are not a same-context model ranking.','Chromium common gate; physical devices and assistive technology were not measured.','Successful final outputs only for the size comparison; every failure remains in trials.','CSS, runtime, React and app code included; image/font/HTML size and startup time excluded.','Original exploratory diagnostics had harness errors; exploratory results are not pooled into confirmation.']}};
await writeFile(join(root,'generated/composition-summary.json'),JSON.stringify(summary,null,2)+'\n');
await mkdir(join(root,'apps/site/public/evals'),{recursive:true});await writeFile(join(root,'apps/site/public/evals/composition-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({libraries,models,pairedSizes,requestLedger:summary.requestLedger,decision:summary.decision},null,2));
