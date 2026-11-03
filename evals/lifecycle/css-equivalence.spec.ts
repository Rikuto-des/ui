import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const rows=JSON.parse(readFileSync(new URL('./runs/dependency-v2/build-results.json',import.meta.url),'utf8')).rows.filter((r:any)=>r.arm==='selected');
const lucent=readFileSync(new URL('../../packages/packs/generated/lucent.css',import.meta.url),'utf8');
for(const row of rows)for(const pack of ['graphite','lucent'])for(const theme of ['light','dark'])for(const width of [320,1000])test(`${row.id} ${pack} ${theme} ${width}`,async({page}, testInfo)=>{
  const id=row.id.slice('selected-'.length);await page.setViewportSize({width,height:800});
  await page.goto(`/dependency-v2/after/${id}/dist/`);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await page.addStyleTag({content:lucent});await page.evaluate(({pack,theme})=>{document.documentElement.dataset.pack=pack;document.documentElement.dataset.theme=theme;},{pack,theme});
  for(const state of ['closed','active']) {
    if(state==='active') {
      if(row.task==='dialog')await page.getByRole('button',{name:'Delete Atlas',exact:true}).click();
      else if(row.task==='menu')await page.getByRole('button',{name:'Actions for Atlas',exact:true}).click();
      else await page.getByRole('tab',{name:'Security',exact:true}).click();
    }
    // Compare exactly the same mounted DOM and state, changing only the stylesheet.
    await page.locator('#library-css').evaluate((el,path)=>new Promise<void>((done,fail)=>{el.addEventListener('load',()=>done(),{once:true});el.addEventListener('error',()=>fail(Error('CSS load failed')),{once:true});(el as HTMLLinkElement).href=path;}),`/dependency-v2/after/${id}/dist/entry.css`);
    await page.waitForFunction(()=>!!(document.querySelector('#library-css') as HTMLLinkElement).sheet);
    const full=await page.screenshot({animations:'disabled'});
    await page.locator('#library-css').evaluate((el,path)=>new Promise<void>((done,fail)=>{el.addEventListener('load',()=>done(),{once:true});el.addEventListener('error',()=>fail(Error('CSS load failed')),{once:true});(el as HTMLLinkElement).href=path;}),`/dependency-v2/selected/${id}/dist/entry.css`);
    await page.waitForFunction(()=>!!(document.querySelector('#library-css') as HTMLLinkElement).sheet);
    const selected=await page.screenshot({animations:'disabled'});
    if(!selected.equals(full)) { await testInfo.attach(state+'-full',{body:full,contentType:'image/png'});await testInfo.attach(state+'-selected',{body:selected,contentType:'image/png'}); }
    expect(createHash('sha256').update(selected).digest('hex'),state).toEqual(createHash('sha256').update(full).digest('hex'));
  }
});
