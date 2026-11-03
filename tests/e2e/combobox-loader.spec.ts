import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {resolve} from 'node:path';
const mika={value:'mika',label:'Mika Sato'},kai={value:'kai',label:'Kai Ito'};
test.beforeEach(async({page})=>{
 const result=await build({stdin:{resolveDir:resolve('.'),loader:'tsx',contents:`
 import React,{useState}from'react';import{createRoot}from'react-dom/client';import{Combobox}from'./packages/react/src/combobox.tsx';
 function App(){const [shown,setShown]=useState(true),[disabled,setDisabled]=useState(false),[renders,setRenders]=useState(0),[submits,setSubmits]=useState(0);return <main><button onClick={()=>setShown(x=>!x)}>Toggle field</button><button onClick={()=>setDisabled(x=>!x)}>Toggle disabled</button><button onClick={()=>setRenders(x=>x+1)}>Render {renders}</button><output aria-label="Submits">{submits}</output><form onSubmit={e=>{e.preventDefault();setSubmits(x=>x+1);}}>{shown&&<Combobox label="Owner" name="owner" required disabled={disabled} options={[{value:'mika',label:'Mika Sato'}]} defaultValue="mika" loadingText="Loading owners" emptyText="No owners found" errorText="Could not load owners" retryLabel="Retry owners" loadOptions={async(q,{signal})=>{signal.addEventListener('abort',()=>{document.documentElement.dataset.aborts=String(Number(document.documentElement.dataset.aborts||0)+1);});const r=await fetch('/loader-owners?q='+encodeURIComponent(q));if(!r.ok)throw Error('offline');return await r.json();}}/>}</form></main>;}createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,format:'esm',write:false,logLevel:'silent'});
 await page.route('**/loader-test',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Loader</title><body><div id="root"></div><script type="module" src="/loader.js"></script></body></html>'}));
 await page.route('**/loader.js',r=>r.fulfill({contentType:'text/javascript',body:result.outputFiles[0].text}));
 await page.goto('/loader-test');
});
test('server results keep their ranking and ignore stale completion without relying on abort',async({page})=>{
 let release!:()=>void,seen!:()=>void;const held=new Promise<void>(r=>release=r),requested=new Promise<void>(r=>seen=r);
 await page.route('**/loader-owners?*',async r=>{const q=new URL(r.request().url()).searchParams.get('q');if(q==='old'){seen();await held;}return r.fulfill({json:q==='old'?[mika]:q==='designer'?[kai]:[]});});
 const box=page.getByRole('combobox',{name:'Owner'});await expect(box).toHaveValue('Mika Sato');
 try{await box.fill('old');await requested;await expect(page.getByText('Loading owners')).toBeVisible();await box.fill('designer');await expect(page.getByRole('option',{name:'Kai Ito'})).toBeVisible();release();await page.waitForTimeout(100);await expect(page.getByRole('option',{name:'Mika Sato'})).not.toBeVisible();await box.press('ArrowDown');await box.press('Enter');await expect(box).toHaveValue('Kai Ito');await box.fill('missing');await expect(page.getByText('No owners found')).toBeVisible();await box.press('Escape');await expect(box).toHaveValue('Kai Ito');expect(await box.evaluate(e=>(e as HTMLInputElement).validity.valid)).toBe(true);await expect(page.locator('input[type=hidden]')).toHaveValue('kai');await expect(page.getByLabel('Submits')).toHaveText('0');}finally{release();}
});
test('retry is keyboard reachable and retains the query without submitting',async({page})=>{
 let fail=true;const queries:string[]=[];await page.route('**/loader-owners?*',r=>{queries.push(new URL(r.request().url()).searchParams.get('q')!);return r.fulfill(fail?{status:503,json:{}}:{json:[kai]});});
 const box=page.getByRole('combobox',{name:'Owner'});await box.fill('designer');await expect(page.getByText('Could not load owners')).toBeVisible();await box.press('ArrowDown');const retry=page.getByRole('button',{name:'Retry owners'});await expect(retry).toBeFocused();fail=false;await retry.press('Enter');await expect(box).toBeFocused();await expect(page.getByRole('option',{name:'Kai Ito'})).toBeVisible();expect(queries).toEqual(['designer','designer']);await expect(page.getByLabel('Submits')).toHaveText('0');
});
test('closing, disabling and unmounting invalidate requests across editor instances',async({page})=>{
 let release!:()=>void,seen!:()=>void;const held=new Promise<void>(r=>release=r),requested=new Promise<void>(r=>seen=r);
 await page.route('**/loader-owners?*',async r=>{const q=new URL(r.request().url()).searchParams.get('q');if(q==='old'){seen();await held;}return r.fulfill({json:q==='old'?[mika]:[kai]});});
 const box=page.getByRole('combobox',{name:'Owner'});
 try{await box.fill('old');await requested;await box.press('Escape');await expect(page.locator('html')).toHaveAttribute('data-aborts','1');await page.getByRole('button',{name:'Toggle field'}).click();await page.getByRole('button',{name:'Toggle field'}).click();await box.fill('new');await expect(page.getByRole('option',{name:'Kai Ito'})).toBeVisible();release();await page.waitForTimeout(100);await expect(page.getByRole('option',{name:'Mika Sato'})).not.toBeVisible();await page.getByRole('button',{name:'Toggle disabled'}).click();await expect(box).toBeDisabled();await expect(page.getByRole('listbox')).not.toBeVisible();await expect(page.getByLabel('Submits')).toHaveText('0');}finally{release();}
});

test('a selected remote label takes precedence over an older seed label',async({page})=>{
 await page.route('**/loader-owners?*',r=>r.fulfill({json:[{value:'mika',label:'Mika Updated'}]}));
 const box=page.getByRole('combobox',{name:'Owner'});await box.fill('updated');await page.getByRole('option',{name:'Mika Updated',exact:true}).click();await expect(box).toHaveValue('Mika Updated');
 await page.getByRole('button',{name:'Render 0',exact:true}).click();await expect(box).toHaveValue('Mika Updated');await expect(page.locator('input[type=hidden]')).toHaveValue('mika');
});
