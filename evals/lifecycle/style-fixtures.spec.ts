import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const testRequire = createRequire(require.resolve('@playwright/test'));
const playwrightRequire = createRequire(testRequire.resolve('playwright'));
const { PNG } = require(playwrightRequire.resolve('playwright-core').replace(/index\.js$/, 'lib/utilsBundle.js')); 
const fixtures=JSON.parse(readFileSync(new URL('./runs/style-fixtures/index.json',import.meta.url),'utf8'));
for(const fixture of fixtures)for(const pack of ['graphite','lucent'])for(const theme of ['light','dark'])for(const width of [320,1000])test(`${fixture.name} ${pack} ${theme} ${width}`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  // Set the theme before first paint, including native controls and hidden details content.
  await page.route('**/style-fixtures/*.html', async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('data-pack="graphite" data-theme="light"',`data-pack="${pack}" data-theme="${theme}"`)});});
  await page.goto(`/style-fixtures/${fixture.name}.html`);
  for(const active of [false,true]) {
    if(active)await page.evaluate(()=>{
      document.querySelectorAll('details').forEach(el=>{el.open=true;});
      const dialog=document.querySelector('dialog');if(dialog)dialog.showModal();
      else {const pop=document.querySelector<HTMLElement>('[popover]');try{pop?.showPopover();}catch{ /* empty toaster is valid */ }}
      document.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),summary,a[href]')?.focus();
    });
    const change=async(file:string)=>page.locator('#css').evaluate((el,path)=>new Promise<void>((done,fail)=>{if((el as HTMLLinkElement).href===new URL(path,document.baseURI).href){done();return;}el.addEventListener('load',()=>done(),{once:true});el.addEventListener('error',()=>fail(Error('CSS load')),{once:true});(el as HTMLLinkElement).href=path;}),file);
    const settle=async()=>{
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getTiming().iterations===Infinity||!((a.effect as KeyframeEffect)?.target as Element)?.checkVisibility()));
      await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.getTiming().iterations===Infinity).forEach(a=>{a.pause();a.currentTime=0;}));
    };
    const motion=()=>page.locator('[data-slot]').evaluateAll(elements=>elements.map(el=>{const s=getComputedStyle(el);return [s.animationName,s.animationDuration,s.transitionProperty,s.transitionDuration];}));
    const computed=()=>page.locator('body, body *').evaluateAll(elements=>elements.filter(el=>el.checkVisibility()).map(el=>{
      const box=el.getBoundingClientRect();
      const properties=['display','position','visibility','color','backgroundColor','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','padding','margin','border','borderRadius','cornerShape','boxShadow','outline','outlineOffset','clipPath','clip','overflow','opacity','transform','filter','backdropFilter','content','width','height','gap','alignItems','justifyContent','textDecoration','whiteSpace'];
      return {box:[box.x,box.y,box.width,box.height],styles:[null,'::before','::after'].map(pseudo=>{const s=getComputedStyle(el,pseudo);return properties.map(p=>s[p as keyof CSSStyleDeclaration]);})};
    }));
    await change('./full.css');await settle();const fullComputed=await computed();const fullMotion=await motion();const full=await page.screenshot();
    await change('./'+fixture.name+'.css');await settle();const selected=await page.screenshot();
    expect(await computed(),`${fixture.name} computed layout and paint`).toEqual(fullComputed);
    expect(await motion(),`${fixture.name} motion definitions`).toEqual(fullMotion);
    if(!full.equals(selected)){await info.attach('full',{body:full,contentType:'image/png'});await info.attach('selected',{body:selected,contentType:'image/png'});}
    const a=PNG.sync.read(full),b=PNG.sync.read(selected);
    expect([a.width,a.height]).toEqual([b.width,b.height]);
    let different=0;
    for(let i=0;i<a.data.length;i+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(a.data[i+c]-b.data[i+c])))>4)different++;
    expect(different,`${fixture.name} active=${active}: pixels differing by more than 4/255; computed styles must match exactly`).toBeLessThanOrEqual(16);
  }
});
