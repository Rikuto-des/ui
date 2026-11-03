import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,readFile,symlink,realpath} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {workflowSchema,sourceHash,validatePatch,sourcePath} from "../src/workflow.ts";

test("workflow requires checks, unique bounded repair budget and explicit file edits",()=>{
 const base={version:1,sources:["App.tsx"],checks:[{name:"edit",url:"http://localhost:3300",scenario:"scenario.json"}]};
 assert.equal(workflowSchema.safeParse({...base,repair:{command:["agent"],maxAttempts:4}}).success,false);
 assert.equal(workflowSchema.safeParse({...base,checks:[]}).success,false);
 assert.equal(workflowSchema.parse(base).checks[0].browser,"chromium");
});
test("patch validation is all-or-nothing and preserves existing files on rejected paths or stale edits",async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),"urushi-patch-test-")));
 await writeFile(join(root,"App.tsx"),"original");
 const sources=[{path:"App.tsx",content:"original",sha256:sourceHash("original")}];
 const edit={path:"App.tsx",beforeSha256:sources[0].sha256,content:"fixed"};
 assert.equal((await validatePatch(root,{edits:[edit]},sources))[0].before,"original");
 await assert.rejects(validatePatch(root,{edits:[edit,{...edit,path:"scenario.json"}]},sources),/allowlist/);
 await assert.rejects(validatePatch(root,{edits:[edit,edit]},sources),/repeated/);
 await writeFile(join(root,"App.tsx"),"human edit");
 await assert.rejects(validatePatch(root,{edits:[edit]},sources),/changed/);
 assert.equal(await readFile(join(root,"App.tsx"),"utf8"),"human edit");
});
test("source allowlist rejects traversal, tests and symlinks",async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),"urushi-patch-path-")));
 await writeFile(join(root,"App.tsx"),"source");await symlink(join(root,"App.tsx"),join(root,"Alias.tsx"));
 for(const path of ["../App.tsx","/tmp/App.tsx","App.spec.tsx","tests/App.tsx","Alias.tsx","package.json","pnpm-lock.yaml","vite.config.ts"])await assert.rejects(sourcePath(root,path));
});
