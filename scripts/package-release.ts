import { cp, mkdir, readFile, writeFile, rm, readdir, chmod } from "node:fs/promises";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { REGISTRY_VERSION } from "../packages/cli/src/build.ts";
const root=resolve(import.meta.dirname,"..");const out=join(root,"dist/release");
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
execFileSync(process.execPath,["node_modules/typescript/bin/tsc","-p","tsconfig.release.json"],{cwd:root,stdio:"inherit"});
const names=["contract","tokens","core","packs","react","eslint-plugin","cli"];
const manifest:unknown[]=[];
for(const name of names){
 const source=join(root,"packages",name);const destination=join(out,"packages",name);await mkdir(destination,{recursive:true});
 if(name!=="packs")await cp(join(out,"modules",name,"src"),join(destination,"src"),{recursive:true});
 for(const directory of name==="react"?["styles"]:name==="packs"?["generated"]:[])await cp(join(source,directory),join(destination,directory),{recursive:true});
 if(name==="cli") {await cp(join(root,"generated/registry"),join(destination,"registry"),{recursive:true});await cp(join(source,"src/styles.generated.css"),join(destination,"src/styles.generated.css"));}
 const pkg=JSON.parse(await readFile(join(source,"package.json"),"utf8"));pkg.version=REGISTRY_VERSION;delete pkg.private;pkg.license="MIT";pkg.engines={node:">=24"};pkg.files=["src","styles","generated","registry","README.md","LICENSE","THIRD_PARTY_NOTICES.md","COMPATIBILITY.md","CHANGELOG.md"];
 pkg.repository={type:"git",url:"git+https://github.com/Rikuto-des/ui.git",directory:`packages/${name}`};
 pkg.bugs={url:"https://github.com/Rikuto-des/ui/issues"};
 pkg.publishConfig={access:"public",tag:"beta",registry:"https://registry.npmjs.org/"};
 for(const field of ["dependencies","peerDependencies","optionalDependencies"])for(const [key,value]of Object.entries(pkg[field]??{}))if(String(value).startsWith("workspace:"))pkg[field][key]=REGISTRY_VERSION;
 if(pkg.exports)for(const [key,value]of Object.entries(pkg.exports)){if(typeof value==="string"&&/\.tsx?$/.test(value))pkg.exports[key]={types:value.replace(/\.tsx?$/,".d.ts"),import:value.replace(/\.tsx?$/,".js")};}
 if(pkg.sideEffects)pkg.sideEffects=pkg.sideEffects.map((s:string)=>s.replace(/\.ts$/,".js"));
 if(pkg.bin){pkg.bin.urushi="./src/bin.js";await chmod(join(destination,"src/bin.js"),0o755);}
 await writeFile(join(destination,"package.json"),JSON.stringify(pkg,null,2)+"\n");await cp(join(root,"docs/release/PACKAGE-README.md"),join(destination,"README.md"));await cp(join(root,"LICENSE"),join(destination,"LICENSE"));await cp(join(root,"THIRD_PARTY_NOTICES.md"),join(destination,"THIRD_PARTY_NOTICES.md"));await cp(join(root,"docs/release/COMPATIBILITY.md"),join(destination,"COMPATIBILITY.md"));await writeFile(join(destination,"CHANGELOG.md"),(await readFile(join(root,"CHANGELOG.md"),"utf8")).replaceAll("docs/release/COMPATIBILITY.md","COMPATIBILITY.md"));
 const result=JSON.parse(execFileSync("npm",["pack","--cache","/tmp/urushi-npm-cache","--json","--ignore-scripts","--pack-destination",out],{cwd:destination,encoding:"utf8"}))[0];
 const bytes=await readFile(join(out,result.filename));manifest.push({name:pkg.name,version:pkg.version,file:result.filename,bytes:bytes.length,sha256:createHash("sha256").update(bytes).digest("hex"),files:result.files.length});
}
const sourceCommit=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim();
await writeFile(join(out,"manifest.json"),JSON.stringify({version:REGISTRY_VERSION,tag:"beta",sourceCommit,createdAt:new Date().toISOString(),packages:manifest},null,2)+"\n");console.log(JSON.stringify(manifest,null,2));
