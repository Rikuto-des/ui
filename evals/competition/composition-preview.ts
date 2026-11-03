/** Local, fictional-data preview. Independent of the frozen comparison server. */
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'runs');
const failures=new Set<string>();
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url!,'http://localhost');
  if(url.pathname==='/api/owners'){
   const query=(url.searchParams.get('q')??'').toLowerCase();
   const owners=[{value:'mika',label:'Mika Sato'},{value:'kai',label:'Kai Ito'},{value:'ren',label:'Ren Aoki',disabled:true}];
   await new Promise(r=>setTimeout(r,query==='mi'?700:180));
   res.setHeader('content-type','application/json');
   if(query==='offline'&&!failures.has(query)){failures.add(query);res.statusCode=503;res.end(JSON.stringify({error:'Preview retry scenario'}));return;}
   res.end(JSON.stringify(query==='designer'||query==='offline'?[owners[1]]:owners.filter(o=>o.label.toLowerCase().includes(query))));return;
  }
  if(req.method==='PUT'&&url.pathname.startsWith('/api/projects/')){
   let body='';for await(const part of req)body+=part;await new Promise(r=>setTimeout(r,450));res.setHeader('content-type','application/json');res.end(JSON.stringify(JSON.parse(body)));return;
  }
  let path=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!path.startsWith(root+sep)){res.statusCode=403;res.end();return;}
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
  res.setHeader('content-type',types[extname(path)]??'application/octet-stream');res.setHeader('cache-control','no-store');res.end(await readFile(path));
 }catch{res.statusCode=404;res.end('Not found');}
});
server.listen(4486,'127.0.0.1',()=>console.log('Fictional comparison previews at http://localhost:4486/<run>/<sample>/<stage>/dist/'));
