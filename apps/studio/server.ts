import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { initialProjects, initialSettings } from "./src/model.ts";
import { projectSchema, settingsSchema } from "./schema.ts";
const root=dirname(fileURLToPath(import.meta.url));
const dataFile=resolve(process.env.URUSHI_STUDIO_DATA ?? join(root,"data/workspace.json"));
const stateSchema=z.object({projects:z.array(projectSchema),settings:settingsSchema});
let state=await readFile(dataFile,"utf8").then(text=>stateSchema.parse(JSON.parse(text))).catch(error=>{if(error.code!=="ENOENT")throw error;return {projects:initialProjects,settings:initialSettings};});
let queue=Promise.resolve();
const server=createServer(async(req,res)=>{
 const path=new URL(req.url??"/","http://localhost").pathname;
 const json=(status:number,value:unknown)=>{res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(value));};
 try {
  if(path==="/api/workspace" && req.method==="GET"){json(200,state);return;}
  if(path.startsWith("/api/") && ["POST","PUT","PATCH","DELETE"].includes(req.method??"")){
   if(req.headers.origin && new URL(req.headers.origin).host!==req.headers.host){json(403,{error:"Origin does not match."});return;}
   if(!req.headers["content-type"]?.startsWith("application/json")){json(415,{error:"JSON is required."});return;}
   let text="";for await(const chunk of req){text+=chunk;if(text.length>100_000){json(413,{error:"Request is too large."});return;}}
   const body:unknown=JSON.parse(text);
   const work=queue.then(async()=>{
    let next=structuredClone(state);
    if(path==="/api/projects" && req.method==="POST") {
     const payload=projectSchema.omit({id:true,revision:true}).parse(body);
     next.projects.unshift({...payload,id:`PRJ-${randomUUID().slice(0,8)}`,revision:0});
    } else if(path.startsWith("/api/projects/") && req.method==="PUT"){
     const id=decodeURIComponent(path.slice("/api/projects/".length));const index=next.projects.findIndex(row=>row.id===id);
     if(index<0){json(404,{error:"このプロジェクトは削除されています。"});return;}
     const payload=projectSchema.parse(body);
     if(payload.id!==id){json(400,{error:"Project ID does not match."});return;}
     if(payload.revision!==next.projects[index].revision){json(409,{error:"別の画面で更新されています。入力内容を控え、一覧を再読み込みしてください。"});return;}
     next.projects[index]={...payload,revision:payload.revision+1};
    } else if(path==="/api/projects/bulk" && req.method==="PATCH"){
     const payload=z.object({ids:z.array(z.string()).min(1),status:projectSchema.shape.status}).parse(body);
     next.projects=next.projects.map(row=>payload.ids.includes(row.id)?{...row,status:payload.status,revision:row.revision+1}:row);
    } else if(path==="/api/settings" && req.method==="PUT") next.settings=settingsSchema.parse(body);
    else {json(404,{error:"Unknown operation."});return;}
    await mkdir(dirname(dataFile),{recursive:true});await writeFile(dataFile+".tmp",JSON.stringify(next,null,2)+"\n");await rename(dataFile+".tmp",dataFile);state=next;json(200,state);
   });
   queue=work.catch(()=>{});await work;return;
  }
  if(path.startsWith("/api/")){json(404,{error:"Not found."});return;}
  const file=resolve(root,"dist",path==="/"?"index.html":"."+decodeURIComponent(path));
  if(!file.startsWith(join(root,"dist")+"/")){json(403,{error:"Forbidden."});return;}
  const body=await readFile(file).catch(error=>{if(error.code==="ENOENT" && !extname(path))return readFile(join(root,"dist/index.html"));throw error;});
  res.writeHead(200,{"Content-Type":({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml"} as Record<string,string>)[extname(file)]??"application/octet-stream","X-Content-Type-Options":"nosniff"});res.end(body);
 }catch(error){json(error instanceof z.ZodError || error instanceof SyntaxError?400:500,{error:error instanceof z.ZodError?"入力内容を確認してください。":error instanceof SyntaxError?"入力形式が正しくありません。":"保存先にアクセスできません。時間をおいて再試行してください。"});}
});
server.listen(Number(process.env.PORT??3301),process.env.HOST??"127.0.0.1",()=>console.log(`Urushi Studio: http://${process.env.HOST??"127.0.0.1"}:${process.env.PORT??3301}`));
