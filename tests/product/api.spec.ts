import {test,expect} from '@playwright/test';
test('file-backed API validates dates, persists mutations and detects stale writes',async({request})=>{
 const name=`Integration ${Date.now()} ${test.info().project.name}`;const input={name,description:'API verification',owner:'mika',status:'planned',due:'2026-11-30'};
 const invalid=await request.post('/api/projects',{data:{...input,due:'2026-02-30'}});expect(invalid.status()).toBe(400);
 const created=await request.post('/api/projects',{data:input});expect(created.ok()).toBe(true);const workspace=await created.json();const project=workspace.projects.find((row:{name:string})=>row.name===name);expect(project.revision).toBe(0);
 const saved=await request.put(`/api/projects/${project.id}`,{data:{...project,name:name+' saved'}});expect(saved.ok()).toBe(true);
 const stale=await request.put(`/api/projects/${project.id}`,{data:{...project,name:'stale overwrite'}});expect(stale.status()).toBe(409);
 const read=await request.get('/api/workspace');expect((await read.json()).projects.find((row:{id:string})=>row.id===project.id).name).toBe(name+' saved');
 const crossOrigin=await request.put('/api/settings',{headers:{origin:'https://different-origin.invalid'},data:{workspace:'Not allowed',theme:'dark',pack:'graphite'}});expect(crossOrigin.status()).toBe(403);
});
