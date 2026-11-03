import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
const fixtures=JSON.parse(readFileSync(new URL('./runs/design-v1/index.json',import.meta.url),'utf8'));
for(const fixture of fixtures)for(const pack of ['graphite','lucent'])for(const theme of ['light','dark'])for(const width of [320,1000])test(`${fixture.name} ${pack} ${theme} ${width}`,async({page},info)=>{
  await page.setViewportSize({width,height:800});
  await page.route('**/design-v1/*.html',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('data-pack="graphite" data-theme="light"',`data-pack="${pack}" data-theme="${theme}"`)});});
  await page.goto(`/design-v1/${fixture.name}.html`);
  if(['dialog','alert-dialog','sheet','popover','menu','hover-card','tooltip'].includes(fixture.name))await page.evaluate(()=>{
    const dialog=document.querySelector('dialog');if(dialog)dialog.showModal();else document.querySelector<HTMLElement>('[popover]')?.showPopover();
  });
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getTiming().iterations===Infinity));
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await info.attach('axe',{body:JSON.stringify(result.violations),contentType:'application/json'});
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  await page.screenshot({path:`evals/navigation/runs/design-v1/${fixture.name}-${pack}-${theme}-${width}.png`});
});
