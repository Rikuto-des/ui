import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const root = resolve(import.meta.dirname, "../..");
const runs = join(root, "evals/competition/runs");
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const labels: Record<string,string> = {urushi:"Urushi",base:"Base UI",radix:"Radix UI",shadcn:"shadcn/ui"};
const full = await json(join(runs,"product-luna-recheck-v2/results.json"));
const css = await json(join(runs,"product-luna-css-v2/results.json"));
const sol = await json(join(runs,"product-sol-recheck-v2/results.json"));
const common = await readFile(join(runs,"product-luna-recheck-v2/shared.css"));
const commonSelected = await readFile(join(runs,"product-luna-css-v2/shared.css"));
if (!common.equals(commonSelected)) throw Error("Common CSS changed during size comparison");
const complete = [];
for (const [id,label] of Object.entries(labels)) {
  const samples = full.filter((sample:any) => sample.library===id);
  const sizes = [];
  for (const sample of samples) {
    const original = sample["update-repair"] ?? sample.update;
    const selected = id==="urushi" ? css.find((s:any)=>s.id===sample.id).update : original;
    if(original.sourceSha256!==selected.sourceSha256)throw Error("Source changed during CSS comparison");
    sizes.push({sample:sample.id,sourceSha256:original.sourceSha256,pass:selected.pass,jsGzip:selected.bundleGzip,cssGzip:selected.cssGzip,commonCssGzip:gzipSync(common).length,totalGzip:selected.bundleGzip+selected.cssGzip+gzipSync(common).length,fullCssGzip:original.cssGzip,fullTotalGzip:original.bundleGzip+original.cssGzip+gzipSync(common).length});
  }
  complete.push({id,label,n:samples.length,generate:samples.filter((s:any)=>s.generate.pass).length,afterRepair:samples.filter((s:any)=>(s.repair??s.generate).pass).length,update:samples.filter((s:any)=>s.update.pass).length,afterUpdateRepair:samples.filter((s:any)=>(s["update-repair"]??s.update).pass).length,sizes});
}
const partial = Object.entries(labels).map(([id,label])=>{const samples=sol.filter((s:any)=>s.library===id);const returned=samples.filter((s:any)=>s.generate.sourceSha256);return {id,label,planned:samples.length,responses:returned.length,pass:returned.filter((s:any)=>s.generate.pass).length,missing:samples.length-returned.length};});
const modelCalls=[];
for (const run of ["product-sol-v1","product-luna-v1"]) {
 const results=await json(join(runs,run,"results.json"));let attempts=0,responses=0,inputTokens=0,outputTokens=0;
 for (const sample of results) for(const stage of ["generate","repair","update","update-repair"]){try{const reply=await json(join(runs,run,sample.id,stage,"reply.json"));attempts++;if(!reply.error){responses++;inputTokens+=reply.usage?.input_tokens??0;outputTokens+=reply.usage?.output_tokens??0;}}catch{}}
 modelCalls.push({run,attempts,responses,inputTokens,outputTokens});
}
const summary={date:"2026-10-28",completeModel:"gpt-6-luna",partialModel:"gpt-6.1-sol",trials:2,complete,partial,modelCalls,commonCssSha256:createHash("sha256").update(common).digest("hex"),notes:[
 "One project-management task, four libraries, two trials, generation then specification update; at most one repair per phase. This is not another dependency-version update.",
 "Common gates: TypeScript, assigned primitive, search/filter/selection/bulk, save/focus, error/retry/cancel, automated axe, 390px page overflow. Chromium only for comparison. Urushi-specific lint is recorded separately, not included in common pass.",
 "gpt-6.1-sol stopped yielding responses with HTTP 429. Missing responses are infrastructure-unavailable, not implementation failures. Initial selector/animation false failures were corrected by rescoring saved code in a new directory; original repair prompts are not comparable, so repaired sol results are excluded from primary comparison.",
 "Both models were rescored with the final corrected harness; inference responses remain unchanged. Urushi and Base UI tie on all four generated/updated screens. Two trials of one task do not establish general superiority.",
 "CSS comparison changes only Urushi's full CSS import to public dialog.css; complete runtime, full Graphite tokens, React and identical common CSS are included. No generated application source is edited. All four Urushi screens retain their passing gates. Other libraries keep original build inputs; failing final applications are labelled.",
 "Recorded Radix failure: focus after Escape; shadcn failure: mobile document overflow. These are failures of these generated screens, not claims that the libraries cannot implement those behaviors.",
 "Assistive-technology speech and actual phone touch verification remain unverified; automated axe and browser engines are different evidence."
]};
for(const destination of ["generated/product-summary.json","apps/site/public/evals/product-summary.json","evals/product/results.json"]){const path=join(root,destination);await mkdir(resolve(path,".."),{recursive:true});await writeFile(path,JSON.stringify(summary,null,2)+"\n");}
console.log(JSON.stringify(summary,null,2));
