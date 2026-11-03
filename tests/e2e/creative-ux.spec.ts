import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { build } from 'esbuild';
import { resolve } from 'node:path';
const core = `/@fs${resolve('packages/core/src')}`;

test.beforeEach(async ({ page }) => {
  const bundle = await build({ stdin: { resolveDir: resolve('.'), loader: 'tsx', contents: `
import React from 'react'; import {createRoot} from 'react-dom/client'; import {Combobox} from './packages/react/src/combobox.tsx'; import {Tabs} from './packages/react/src/tabs.tsx'; import {installTabs} from './packages/core/src/tabs.ts';
const options=[{value:'mika',label:'Mika',description:'Design',keywords:['designer']},{value:'kai',label:'Kai',description:'Engineering',keywords:['developer']},{value:'ren',label:'Ren',disabled:true}];
createRoot(document.getElementById('root')).render(<main style={{padding:24,maxWidth:600}}><h1>Interaction tests</h1><form onSubmit={e=>e.preventDefault()}><Combobox label="Owner" name="owner" defaultValue="mika" options={options} renderPreview={o=><><h2>{o.label} profile</h2><p>{o.description} details</p></>} previewLabel="Profile" previewActionLabel="Assign owner"/><button type="submit">Save</button></form><Tabs id="work" label="Work" defaultValue="one"><Tabs.List><Tabs.Tab value="one">One</Tabs.Tab><Tabs.Tab value="two">Two longer</Tabs.Tab><Tabs.Tab value="three">Three</Tabs.Tab></Tabs.List><Tabs.Panel value="one"><input aria-label="Draft" defaultValue="Keep this"/><div style={{height:80}}>Short panel</div></Tabs.Panel><Tabs.Panel value="two"><div style={{height:300}}>Tall panel</div></Tabs.Panel><Tabs.Panel value="three"><div style={{height:160}}>Medium panel</div></Tabs.Panel></Tabs><button id="after">After</button></main>);installTabs();` }, bundle: true, format: 'esm', write: false, logLevel: 'silent' });
  await page.route('**/creative-fixture', r => r.fulfill({ contentType:'text/html', body:'<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><head><title>Interactions</title><link rel="stylesheet" href="/@fs'+resolve('packages/react/styles/index.css')+'"><link rel="stylesheet" href="/@fs'+resolve('packages/packs/generated/graphite.css')+'"></head><body><div id="root"></div><script type="module" src="/creative-fixture.js"></script></body></html>' }));
  await page.route('**/creative-fixture.js', r => r.fulfill({ contentType: 'text/javascript', body: bundle.outputFiles[0].text }));
  await page.goto('/creative-fixture');
});

test('preview is exploratory until confirmed, with keyboard and alias search',async({page})=>{
  const box=page.getByRole('combobox',{name:'Owner'});
  await box.click();
  await expect(page.getByRole('region',{name:'Profile'})).toContainText('Mika profile');
  await box.press('ArrowDown');
  await expect(page.getByRole('region',{name:'Profile'})).toContainText('Kai profile');
  await expect(page.locator('input[type=hidden]')).toHaveValue('mika');
  await box.press('Escape'); await expect(box).toHaveValue('Mika');
  await box.fill('developer'); await expect(page.getByRole('option',{name:'Kai Engineering'})).toBeVisible();
  await box.press('Tab'); await expect(page.locator('[data-slot="combobox-preview-content"]')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('button',{name:'Assign owner'})).toBeFocused();
  await page.keyboard.press('Enter'); await expect(box).toHaveValue('Kai'); await expect(box).toBeFocused();
  await expect(page.locator('input[type=hidden]')).toHaveValue('kai');
});

test('pointer preview, disabled entries, narrow screens and axe',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const box=page.getByRole('combobox',{name:'Owner'}); await box.click();
  await page.getByRole('option',{name:'Kai Engineering'}).click();
  await expect(box).toHaveAttribute('aria-expanded','true');
  await expect(page.getByRole('region',{name:'Profile'})).toContainText('Kai profile');
  await page.getByRole('option',{name:'Ren',exact:true}).click({force:true});
  await expect(page.getByRole('region',{name:'Profile'})).toContainText('Kai profile');
  const popup=await page.locator('[data-slot="combobox-popup"]').boundingBox();
  expect(popup!.x).toBeGreaterThanOrEqual(0); expect(popup!.x+popup!.width).toBeLessThanOrEqual(390);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Assign owner'}).click(); await expect(box).toHaveValue('Kai');
});

test('preview text keeps its contrast throughout entry motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('combobox',{name:'Owner'}).click();
  const samples=await page.locator('[data-slot="combobox-preview-body"]').evaluate(element=>{
    const animation=element.getAnimations().find(a=>(a as CSSAnimation).animationName==='ur-combobox-preview')!;
    animation.pause();
    return [0,80,160].map(time=>{animation.currentTime=time;return getComputedStyle(element).opacity;});
  });
  expect(samples).toEqual(['1','1','1']);
});

test('tab heights interpolate, rapid reversal keeps input and one exposed panel',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('textbox',{name:'Draft'}).fill('Edited draft');
  await expect(page.locator('#work [data-slot="tabs-list"]')).toHaveAttribute('data-indicator-ready','');
  const values=await page.evaluate(()=>{
    const first=document.getElementById('work-panel-one')!;
    const previous=first.getBoundingClientRect().height;
    document.getElementById('work-tab-two')!.click();
    const panel=document.getElementById('work-panel-two')!;
    const animation=panel.getAnimations()[0]; animation.pause(); animation.currentTime=100;
    const middle=panel.getBoundingClientRect().height;
    const final=Number.parseFloat(String((animation.effect as KeyframeEffect).getKeyframes().at(-1)!.height));
    document.getElementById('work-tab-three')!.click(); document.getElementById('work-tab-one')!.click();
    return {previous,middle,final};
  });
  expect(values.middle).toBeGreaterThan(values.previous);expect(values.middle).toBeLessThan(values.final);
  await expect(page.getByRole('tabpanel')).toHaveCount(1);await expect(page.getByRole('textbox',{name:'Draft'})).toHaveValue('Edited draft');
  await expect.poll(()=>page.locator('#work-panel-one').evaluate(e=>e.getAnimations().length)).toBe(0);
  const indicator=await page.locator('#work [data-slot="tabs-indicator"]').boundingBox(), tab=await page.getByRole('tab',{name:'One',exact:true}).boundingBox();
  expect(Math.abs(indicator!.x-tab!.x)).toBeLessThan(1.5);expect(Math.abs(indicator!.width-tab!.width)).toBeLessThan(1.5);
});

test('reduced motion changes panels immediately and disables preview entry motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('tab',{name:'Two longer'}).click();
  expect(await page.locator('#work').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  await page.getByRole('combobox',{name:'Owner'}).click();
  expect(await page.locator('[data-slot="combobox-preview-body"]').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
});

test('one toast follows promise progress, success and real undo',async({page})=>{
  const id=await page.evaluate(async(core)=>{
    const {toast}=await import(core+'/toast.ts');
    let finish!:(v:number)=>void;
    const promise=new Promise<number>(resolve=>finish=resolve);
    const id=toast.promise(promise,{loading:'Exporting',success:(n:number)=>({message:n+' files exported',description:'Available locally',action:{label:'Undo',onClick:()=>{document.body.dataset.undone='true';}}}),error:'Failed'});
    Object.assign(window,{finishExport:()=>finish(3)}); toast.update(id,{progress:40,progressLabel:'Export progress'});return id;
  },core);
  await expect(page.locator('#'+id)).toContainText('Exporting');await expect(page.getByRole('progressbar',{name:'Export progress'})).toHaveJSProperty('value',40);
  await page.evaluate(()=>{(window as unknown as {finishExport:()=>void}).finishExport();});
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);await expect(page.locator('#'+id)).toContainText('3 files exported');
  await expect(page.locator('#'+id)).not.toHaveAttribute('data-loading');
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('body')).toHaveAttribute('data-undone','true');
});

test('dismissed pending toast stays dismissed and errors remain actionable',async({page})=>{
  await page.evaluate(async(core)=>{
    const {toast,dismiss}=await import(core+'/toast.ts');
    let finish!:()=>void;const promise=new Promise<void>(r=>finish=r);
    const id=toast.promise(promise,{loading:'Do not return',success:'Ghost notice',error:'Failed'});
    dismiss(id);finish();
    toast.promise(Promise.reject(new Error('offline')),{loading:'Trying',error:()=>({message:'Connection lost',action:{label:'Retry',onClick:()=>{document.body.dataset.retry='true';}}}),success:'Done'});
  },core);
  await expect(page.getByText('Ghost notice')).toHaveCount(0);await expect(page.getByText('Connection lost')).toBeVisible();
  await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.locator('body')).toHaveAttribute('data-retry','true');
});

test('updating a focused toast preserves action focus and pauses its new timeout',async({page})=>{
  const id=await page.evaluate(async(core)=>{const{toast}=await import(core+'/toast.ts');return toast('Pending',{loading:true,action:{label:'Action',onClick(){}}});},core);
  await page.getByRole('button',{name:'Action',exact:true}).focus();
  await page.evaluate(async({core,id})=>{const{toast}=await import(core+'/toast.ts');toast.update(id,{message:'Finished',loading:false,duration:150});},{core,id});
  await page.waitForTimeout(250);await expect(page.locator('#'+id)).toBeVisible();await expect(page.getByRole('button',{name:'Action',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'After',exact:true}).focus();await expect(page.locator('#'+id)).toHaveCount(0);
});

test('finishing a promise clears pending details and preserves focus when its action disappears',async({page})=>{
  const id=await page.evaluate(async(core)=>{
    const{toast}=await import(core+'/toast.ts');let finish!:()=>void;
    const id=toast.promise(new Promise<void>(r=>finish=r),{loading:'Preparing',success:'Complete',error:'Failed'});
    toast.update(id,{description:'40% uploaded',progress:40,action:{label:'Pending action',onClick(){}}});
    Object.assign(window,{finishOperation:finish});return id;
  },core);
  await page.getByRole('button',{name:'Pending action'}).focus();
  await page.evaluate(()=>{(window as unknown as {finishOperation:()=>void}).finishOperation();});
  await expect(page.locator('#'+id)).toContainText('Complete');
  await expect(page.getByText('40% uploaded')).toBeHidden();
  await expect(page.getByRole('button',{name:'Pending action'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'通知を閉じる'})).toBeFocused();
});

test('indicator follows tabs inserted and reordered after initialization',async({page})=>{
  await expect(page.locator('#work [data-slot="tabs-list"]')).toHaveAttribute('data-indicator-ready','');
  await page.evaluate(()=>{
    const first=document.getElementById('work-tab-one')!;const list=first.parentElement!;
    const extra=document.createElement('button');extra.textContent='Inserted';extra.setAttribute('role','tab');extra.dataset.slot='tabs-tab';extra.setAttribute('aria-selected','false');extra.tabIndex=-1;
    list.insertBefore(extra,first);list.insertBefore(document.getElementById('work-tab-three')!,first);
  });
  await expect.poll(async()=>{
    const indicator=await page.locator('#work [data-slot="tabs-indicator"]').boundingBox(),tab=await page.getByRole('tab',{name:'One',exact:true}).boundingBox();
    return Math.abs(indicator!.x-tab!.x);
  }).toBeLessThan(1.5);
});
