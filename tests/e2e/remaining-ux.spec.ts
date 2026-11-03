import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field, Textarea, FileInput, ToggleGroup, Accordion } from '../../packages/react/src/index.ts';

const fixture = `
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{Field,Textarea,FileInput,RadioGroup,ToggleGroup,Accordion,Collapsible,Progress,Button,Input}from'./packages/react/src/index.ts';
import{installRuntime}from'./packages/core/src/runtime.ts';
function App(){const[text,setText]=useState('Hello');const[disabled,setDisabled]=useState(false);const[amount,setAmount]=useState(25);return <main style={{maxWidth:520,padding:16}}><h1>Native feedback</h1><form><Field id="note" label="Note" description="Write a note"><Textarea showCount maxLength={80} value={text} onChange={e=>setText(e.target.value)}/></Field><Button onClick={()=>setText('Reset externally')}>External value</Button><Field id="uncontrolled" label="Uncontrolled"><Textarea showCount defaultValue="Initial" maxLength={80}/></Field><fieldset disabled={disabled}><legend>Attachments</legend><Field id="files" label="Choose files"><FileInput name="files" multiple showFiles variant="dropzone"/></Field></fieldset><Button onClick={()=>setDisabled(!disabled)}>Disable files</Button><RadioGroup name="scope" legend="Audience" variant="cards" defaultValue="team"><RadioGroup.Item value="private" description="Only yourself">Private</RadioGroup.Item><RadioGroup.Item value="team" description="Work together">Team</RadioGroup.Item></RadioGroup><ToggleGroup legend="Layout" name="layout" defaultValue="a"><ToggleGroup.Item value="a">List</ToggleGroup.Item><ToggleGroup.Item value="b">Comfortable grid</ToggleGroup.Item><ToggleGroup.Item value="c">Compact</ToggleGroup.Item></ToggleGroup><ToggleGroup legend="Days" name="days" type="multiple"><ToggleGroup.Item value="mon">Monday</ToggleGroup.Item><ToggleGroup.Item value="tue">Tuesday</ToggleGroup.Item></ToggleGroup><button type="reset">Reset form</button></form><Accordion name="settings"><Accordion.Item title="General" description="Project details" defaultOpen><Field id="project" label="Project"><Input defaultValue="Journal"/></Field></Accordion.Item><Accordion.Item title="Advanced" description="More options"><button>Inside settings</button></Accordion.Item></Accordion><Collapsible title="Extra" description="Optional details"><p>Some information</p></Collapsible><Progress label="Export" value={amount} valueText={amount+' pages'} milestones={[{value:25,label:'Images'},{value:75,label:'Text'},{value:100,label:'Done'}]}/><Button onClick={()=>setAmount(100)}>Finish</Button><Button onClick={()=>setAmount(0)}>Restart</Button></main>};createRoot(document.getElementById('root')).render(<App/>);const cleanup=installRuntime();Object.assign(window,{cleanupRuntime:cleanup});`;

test.beforeEach(async ({ page }) => {
  const bundle = await build({ stdin:{resolveDir:resolve('.'),loader:'tsx',contents:fixture},bundle:true,format:'esm',write:false,logLevel:'silent' });
  await page.route('**/remaining-fixture',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en" data-theme="light" data-pack="graphite"><head><title>Native feedback</title><link rel="stylesheet" href="/@fs${resolve('packages/react/styles/index.css')}"><link rel="stylesheet" href="/@fs${resolve('packages/packs/generated/graphite.css')}"><style>*{box-sizing:border-box}body{margin:0;background:var(--ur-color-bg);color:var(--ur-color-text);font-family:system-ui}form{display:grid;gap:20px}button{font:inherit}</style></head><body><div id="root"></div><script type="module" src="/remaining-fixture.js"></script></body></html>`}));
  await page.route('**/remaining-fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
  await page.goto('/remaining-fixture');
});

test('textarea follows edits, React updates and native reset without eating composition',async({page})=>{
  const input=page.getByRole('textbox',{name:'Note',exact:true});const count=page.locator('[data-slot="textarea-count"]').first();
  await expect(count).toHaveText('5 / 80');await input.fill('こんにちは🪴');await expect(count).toHaveText('7 / 80');
  await page.getByRole('button',{name:'External value',exact:true}).click();await expect(count).toHaveText('16 / 80');
  await input.fill('A'.repeat(80));await expect(page.locator('[data-slot="textarea-control"]').first()).toHaveAttribute('data-at-limit','');
  const native=page.getByRole('textbox',{name:'Uncontrolled',exact:true});await native.fill('Changed');await page.getByRole('button',{name:'Reset form',exact:true}).click();await expect(native).toHaveValue('Initial');await expect(page.locator('[data-slot="textarea-count"]').nth(1)).toHaveText('7 / 80');
  await input.fill('one\ntwo\nthree\nfour\nfive\nsix\nseven');expect((await input.boundingBox())!.height).toBeGreaterThan(130);
  await input.dispatchEvent('compositionstart');await input.fill('日本語の入力');await input.dispatchEvent('compositionend');await expect(input).toHaveValue('日本語の入力');
});

test('selected files are previewed and removing one changes real FormData and focus',async({page})=>{
  const input=page.locator('#files');
  await input.setInputFiles([{name:'art.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="green"/></svg>')},{name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('A local note')},{name:'<b>literal.txt',mimeType:'text/plain',buffer:Buffer.from('Not markup')}]);
  await expect(page.locator('[data-slot="file-input-item"]')).toHaveCount(3);
  await expect.poll(()=>page.locator('[data-slot="file-input-preview"] img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBe(20);
  await page.getByRole('button',{name:'取り除く: notes.txt',exact:true}).click();
  await expect.poll(()=>page.locator('form').evaluate(form=>new FormData(form as HTMLFormElement).getAll('files').map(f=>(f as File).name))).toEqual(['art.svg','<b>literal.txt']);
  await expect(page.getByRole('button',{name:'取り除く: <b>literal.txt',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Disable files',exact:true}).click();await expect(page.getByRole('button',{name:'取り除く: art.svg',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Disable files',exact:true}).click();await page.getByRole('button',{name:'Reset form',exact:true}).click();await expect(page.locator('[data-slot="file-input-list"]')).toBeHidden();await expect(input).toHaveValue('');await expect(page.locator('[data-file-status]')).toHaveText('0件のファイルを選択');
});

test('segmented selection follows real geometry, keyboard, reset and RTL',async({page})=>{
  const group=page.getByRole('group',{name:'Layout',exact:true}),indicator=group.locator('[data-slot="toggle-group-indicator"]');
  await expect(group).toHaveAttribute('data-sliding','');await group.getByRole('radio',{name:'Comfortable grid',exact:true}).check();
  const aligned=()=>group.evaluate(el=>{const selected=el.querySelector('input:checked')!.parentElement!.getBoundingClientRect(),mark=el.querySelector('[data-slot="toggle-group-indicator"]')!.getBoundingClientRect();return Math.abs(selected.x-mark.x)+Math.abs(selected.width-mark.width);});
  await expect.poll(aligned).toBeLessThan(1);
  await group.getByRole('radio',{name:'Comfortable grid',exact:true}).press('ArrowRight');await expect(group.getByRole('radio',{name:'Compact',exact:true})).toBeChecked();await expect.poll(aligned).toBeLessThan(1);
  await group.evaluate(el=>el.setAttribute('dir','rtl'));await expect.poll(aligned).toBeLessThan(1);
  await page.setViewportSize({width:320,height:900});await expect.poll(aligned).toBeLessThan(1);
  await page.getByRole('button',{name:'Reset form',exact:true}).click();await expect(group.getByRole('radio',{name:'List',exact:true})).toBeChecked();await expect.poll(aligned).toBeLessThan(1);
  await expect(indicator).toBeVisible();await expect(page.getByRole('group',{name:'Days',exact:true})).not.toHaveAttribute('data-sliding','');
});

test('card radios remain native and disclosure summaries retain entered content',async({page})=>{
  const radio=page.getByRole('radio',{name:'Private',exact:true});await radio.check();await radio.press('ArrowDown');await expect(page.getByRole('radio',{name:'Team',exact:true})).toBeChecked();
  await page.getByRole('textbox',{name:'Project',exact:true}).fill('Edited journal');
  await page.locator('summary').filter({hasText:'Advanced'}).click();await expect(page.locator('[data-slot="accordion-item"][open]')).toHaveCount(1);
  await page.locator('summary').filter({hasText:'General'}).press('Enter');await expect(page.getByRole('textbox',{name:'Project',exact:true})).toHaveValue('Edited journal');
  await page.locator('summary').filter({hasText:'Extra'}).press('Space');await expect(page.getByText('Some information',{exact:true})).toBeVisible();
});

test('progress shows true native values, checkpoint completion and a moving fill',async({page})=>{
  const native=page.getByRole('progressbar',{name:'Export',exact:true});
  await expect(native).toHaveJSProperty('value',25);await expect(native).toHaveAttribute('aria-valuetext','25 pages');
  await expect(page.locator('[data-slot="progress-milestones"] [data-reached]')).toHaveCount(1);
  await page.getByRole('button',{name:'Finish',exact:true}).click();await expect(native).toHaveJSProperty('value',100);await expect(page.locator('[data-slot="progress-milestones"] [data-reached]')).toHaveCount(3);
  await expect.poll(()=>page.locator('[data-slot="progress-fill"]').evaluate(el=>el.getBoundingClientRect().width/el.parentElement!.getBoundingClientRect().width)).toBe(1);
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(page.locator('[data-slot="progress-fill"]')).toHaveCSS('transition-duration','0s');
});

test('runtime cleanup preserves native controls and hides stale feedback',async({page})=>{
  await page.evaluate(()=>(window as unknown as {cleanupRuntime:()=>void}).cleanupRuntime());
  await expect(page.locator('[data-slot="textarea-budget"]').first()).toBeHidden();await expect(page.locator('[data-slot="toggle-group-indicator"]').first()).toBeHidden();
  await page.getByRole('textbox',{name:'Note',exact:true}).fill('Works');await page.getByRole('radio',{name:'Compact',exact:true}).check();await expect(page.getByRole('radio',{name:'Compact',exact:true})).toBeChecked();
  await page.locator('summary').filter({hasText:'Extra'}).click();await expect(page.getByText('Some information',{exact:true})).toBeVisible();
});

test('new feedback fits a narrow screen and has no axe violations',async({page})=>{
  await page.setViewportSize({width:320,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});


test('selected segment moves through intermediate positions and respects reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 const radio=page.getByRole('radio',{name:'Comfortable grid',exact:true});
 await expect(page.getByRole('group',{name:'Layout',exact:true})).toHaveAttribute('data-sliding','');
 const motion=await radio.evaluate((input:HTMLInputElement)=>{
   const indicator=input.closest('fieldset')!.querySelector<HTMLElement>('[data-slot="toggle-group-indicator"]')!;
   const before=parseFloat(getComputedStyle(indicator).left);input.click();getComputedStyle(indicator).left;
   const animation=indicator.getAnimations().find(a=>(a as CSSTransition).transitionProperty==='left');
   if(!animation)return {found:false,before,mid:0,target:0};
   animation.pause();animation.currentTime=80;
   return {found:true,before,mid:parseFloat(getComputedStyle(indicator).left),target:parseFloat(indicator.style.left)};
 });
 expect(motion.found).toBe(true);expect(motion.mid).toBeGreaterThan(motion.before);expect(motion.mid).toBeLessThan(motion.target);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('[data-slot="toggle-group-indicator"]').first()).toHaveCSS('transition-duration','0s');
});

test('server-rendered enhanced controls remain usable with JavaScript disabled',async({browser})=>{
 const markup=renderToStaticMarkup(h('main',null,h('h1',null,'Native without scripts'),
   h(Field,{id:'ssr-note',label:'Note',children:h(Textarea,{showCount:true,maxLength:80,defaultValue:'Initial'})}),
   h(Field,{id:'ssr-file',label:'Attachments',children:h(FileInput,{showFiles:true})}),
   h(ToggleGroup,{name:'ssr-layout',legend:'View',defaultValue:'list'},h(ToggleGroup.Item,{value:'list'},'List'),h(ToggleGroup.Item,{value:'grid'},'Grid')),
   h(Accordion,{name:'ssr-sections'},h(Accordion.Item,{title:'More',description:'Details'},'Native disclosure'))));
 const context=await browser.newContext({javaScriptEnabled:false});
 try {const page=await context.newPage();await page.route('**/remaining-ssr',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head><title>Native</title><link rel="stylesheet" href="/@fs${resolve('packages/react/styles/index.css')}"></head><body>${markup}</body></html>`}));
 await page.goto('http://localhost:5173/remaining-ssr');await page.getByRole('textbox',{name:'Note',exact:true}).fill('Still works');await expect(page.getByRole('textbox',{name:'Note',exact:true})).toHaveValue('Still works');await page.getByRole('radio',{name:'Grid',exact:true}).check();await expect(page.getByRole('radio',{name:'Grid',exact:true})).toBeChecked();await page.locator('summary').click();await expect(page.getByText('Native disclosure',{exact:true})).toBeVisible();await expect(page.locator('[data-slot="textarea-budget"]')).toBeHidden();await page.locator('#ssr-file').setInputFiles({name:'note.txt',mimeType:'text/plain',buffer:Buffer.from('Local')});await expect(page.locator('#ssr-file')).not.toHaveValue('');
 } finally {await context.close();}
});
