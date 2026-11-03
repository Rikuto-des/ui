import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {resolve} from 'node:path';
test('nested cancel and close notify only their owning Dialog',async({page})=>{
 const result=await build({stdin:{resolveDir:resolve('.'),loader:'tsx',contents:`
 import React,{useRef,useState} from 'react';import{createRoot}from'react-dom/client';import{Dialog}from'./packages/react/src/dialog.tsx';
 function App(){const outer=useRef(null),inner=useRef(null);const [oc,setOC]=useState(0),[ox,setOX]=useState(0),[ic,setIC]=useState(0),[ix,setIX]=useState(0);
 return <main><button onClick={()=>outer.current.showModal()}>Open editor</button><output aria-label="Outer cancels">{oc}</output><output aria-label="Outer closes">{ox}</output><output aria-label="Inner cancels">{ic}</output><output aria-label="Inner closes">{ix}</output><Dialog id="outer" title="Editor" ref={outer} onCancel={e=>{e.preventDefault();setOC(x=>x+1);}} onClose={()=>setOX(x=>x+1)}><button onClick={()=>inner.current.showModal()}>Open confirmation</button><button onClick={()=>outer.current.close()}>Close editor</button><Dialog id="inner" title="Confirmation" ref={inner} onCancel={e=>{e.preventDefault();setIC(x=>x+1);inner.current.close();}} onClose={()=>setIX(x=>x+1)}><button autoFocus>Keep editing</button></Dialog></Dialog></main>;}createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,format:'esm',write:false,logLevel:'silent'});
 await page.route('**/dialog-events-test',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Dialogs</title><body><div id="root"></div><script type="module" src="/dialog-events.js"></script></body></html>'}));
 await page.route('**/dialog-events.js',r=>r.fulfill({contentType:'text/javascript',body:result.outputFiles[0].text}));
 await page.goto('/dialog-events-test');await page.getByRole('button',{name:'Open editor',exact:true}).click();await page.getByRole('button',{name:'Open confirmation',exact:true}).click();await expect(page.getByRole('button',{name:'Keep editing',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Confirmation',exact:true})).not.toBeVisible();await expect(page.getByRole('dialog',{name:'Editor',exact:true})).toBeVisible();
 await expect(page.getByLabel('Inner cancels')).toHaveText('1');await expect(page.getByLabel('Inner closes')).toHaveText('1');await expect(page.getByLabel('Outer cancels')).toHaveText('0');await expect(page.getByLabel('Outer closes')).toHaveText('0');
 await page.keyboard.press('Escape');await expect(page.getByLabel('Outer cancels')).toHaveText('1');await page.getByRole('button',{name:'Close editor',exact:true}).click();await expect(page.getByLabel('Outer closes')).toHaveText('1');
});
