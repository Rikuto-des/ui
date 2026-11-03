import {writeFile,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {guide,type Library} from './guides.ts';
import {tasks,protocol} from './product-tasks.ts';
const source=await readFile(new URL('./product-run.ts',import.meta.url),'utf8');
const systemBase=/const systemBase=`([\s\S]*?)`;/.exec(source)![1];
for(const library of ['urushi','base','radix','shadcn'] as Library[]){const reference=await guide(library,'dialog');const system=systemBase+`\nAssigned library: ${library}.\nReference (source/version recorded with this run):\n`+reference;const data={destination:'OpenAI through authenticated Codex CLI',models:['gpt-6.1-sol','gpt-6-luna'],library,system,prompt:tasks[0].prompt,specificationUpdate:tasks[0].update,repairData:'Only the AI-generated source and diagnostics from the synthetic project-management fixture. No Studio workspace data or user files.',sha256:createHash('sha256').update(system+tasks[0].prompt).digest('hex')};await writeFile(join(import.meta.dirname,'../product/send-review',library+'.json'),JSON.stringify(data,null,2));}
console.log('Prepared four request bodies. No model requests sent.');
