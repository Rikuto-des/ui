/** Read-only post-study audit. These diagnostics were not sent during v2. */
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ESLint} from 'eslint';
import tseslint from 'typescript-eslint';
import {noDeferredEventCurrentTarget} from '../../packages/eslint-plugin/src/deferred-event.ts';
const lint=new ESLint({overrideConfigFile:true,ignore:false,overrideConfig:[{files:['**/*.tsx'],languageOptions:{parser:tseslint.parser,parserOptions:{ecmaFeatures:{jsx:true}}},plugins:{audit:{rules:{'deferred-event':noDeferredEventCurrentTarget}}},rules:{'audit/deferred-event':'error'}}]});
const findings=[];
for(const run of ['composition-luna-v2','composition-sol-v2']){
 const root=join(import.meta.dirname,'runs',run);
 for(const name of (await readdir(root)).filter(s=>/^(urushi|base)-settings-/.test(s)))for(const stage of ['generate','repair','update','update-repair']){
  const file=join(root,name,stage,'App.tsx'),source=await readFile(file,'utf8').catch(()=>null);if(!source)continue;
  const result=(await lint.lintText(source,{filePath:file}))[0];
  findings.push({run,sample:name,stage,sha256:createHash('sha256').update(source).digest('hex'),issues:result.messages.map(m=>({line:m.line,column:m.column,message:m.message,excerpt:source.split('\n')[m.line-1]}))});
 }
}
const report={at:new Date().toISOString(),purpose:'Read-only audit after generation. Not part of v2 model feedback or common pass scores.',checked:findings.length,flagged:findings.filter(r=>r.issues.length).length,findings};
await writeFile(join(import.meta.dirname,'studies/composition-20261029/deferred-event-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checked:report.checked,flagged:report.flagged,findings:findings.filter(r=>r.issues.length)},null,2));
