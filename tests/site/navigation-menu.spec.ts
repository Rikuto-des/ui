import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({status:200,contentType:'text/css',body:''}));
  await page.goto('/components/navigation-menu/');
  await expect(page.locator('html')).toHaveAttribute('data-urushi-runtime', 'ready');
});
const root = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: '製品サイト' });

test('nested disclosure keyboard, focus restoration and sibling exclusivity', async ({page}) => {
  const nav=root(page), product=nav.locator('summary').filter({hasText:'プロダクト'}), developers=nav.locator('summary').filter({hasText:'開発者向け'}), components=nav.locator('summary').filter({hasText:'コンポーネント'});
  await product.focus();await page.keyboard.press('ArrowDown');
  await expect(nav.getByRole('link',{name:'Navigation Menu',exact:false})).toBeFocused();
  await page.keyboard.press('ArrowDown');await expect(developers).toBeFocused();
  await page.keyboard.press('ArrowDown');await expect(nav.getByRole('link',{name:/AIでつくる/})).toBeFocused();
  await page.keyboard.press('End');await expect(nav.getByRole('link',{name:'競合との実測比較'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(developers).toBeFocused();await expect(nav.getByRole('link',{name:'競合との実測比較'})).toBeHidden();
  await page.keyboard.press('Escape');await expect(product).toBeFocused();await expect(developers).toBeHidden();
  await page.keyboard.press('ArrowRight');await expect(components).toBeFocused();
  await page.keyboard.press('Enter');await expect(nav.getByRole('link',{name:'操作用のMenu'})).toBeVisible();
  await product.click();await expect(nav.getByRole('link',{name:'操作用のMenu'})).toBeHidden();
  await developers.click();await page.getByRole('heading',{level:1}).click();
  await expect(nav.locator('details[open]')).toHaveCount(0);
});

test('Tab can enter and leave; leaving closes; RTL arrows follow direction', async ({page, browserName}) => {
  const nav=root(page), product=nav.locator('summary').filter({hasText:'プロダクト'});
  // macOS WebKit follows the system keyboard setting; Option+Tab includes native links.
  const tab=browserName==='webkit'?'Alt+Tab':'Tab', back=browserName==='webkit'?'Alt+Shift+Tab':'Shift+Tab';
  await product.focus();await page.keyboard.press('Space');await page.keyboard.press(tab);
  await expect(nav.getByRole('link',{name:/Navigation Menu/})).toBeFocused();
  await page.keyboard.press(back);await expect(product).toBeFocused();
  await page.keyboard.press(back);await expect(nav.locator('details[open]')).toHaveCount(0);
  await nav.evaluate(el=>{el.setAttribute('dir','rtl');});
  await product.focus();await page.keyboard.press('ArrowLeft');await expect(nav.locator('summary').filter({hasText:'コンポーネント'})).toBeFocused();
});

test('rapid native activation leaves only the last requested sibling open', async ({page}) => {
  const nav = root(page);
  await nav.evaluate(el => {
    const triggers = el.querySelectorAll<HTMLElement>(':scope > ul > li > details > summary');
    triggers[0].click(); triggers[1].click();
  });
  await expect(nav.getByRole('link', {name:'操作用のMenu'})).toBeVisible();
  await expect(nav.getByRole('link', {name:/Navigation Menu/})).toBeHidden();
  await expect(nav.locator(':scope > ul > li > details[open]')).toHaveCount(1);
});

test('320px nested navigation stays in flow and passes axe in both packs/themes', async ({page}) => {
  await page.setViewportSize({width:320,height:800});const nav=root(page);
  for(const pack of ['graphite','lucent'])for(const theme of ['light','dark']) {
    await page.evaluate(({pack,theme})=>{document.documentElement.dataset.pack=pack;document.documentElement.dataset.theme=theme;},{pack,theme});
    const product=nav.locator('summary').filter({hasText:'プロダクト'}), developers=nav.locator('summary').filter({hasText:'開発者向け'});
    await product.click();await developers.click();
    const nested=await nav.getByRole('link',{name:'競合との実測比較'}).boundingBox(), sibling=await nav.locator('summary').filter({hasText:'コンポーネント'}).boundingBox();
    expect(nested!.x).toBeGreaterThanOrEqual(0);expect(nested!.x+nested!.width).toBeLessThanOrEqual(320);
    expect(sibling!.y).toBeGreaterThanOrEqual(nested!.y+nested!.height);
    await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getTiming().iterations===Infinity));
    const results=await new AxeBuilder({page}).include('[aria-label="製品サイト"]').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    await product.click();
  }
});

test('native disclosures and links work with JavaScript disabled', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});
  const page=await context.newPage();await page.goto('http://localhost:3201/components/navigation-menu/');
  const nav=root(page);await nav.locator('summary').filter({hasText:'プロダクト'}).click();
  await nav.locator('summary').filter({hasText:'開発者向け'}).click();
  await nav.getByRole('link',{name:'競合との実測比較'}).click();await expect(page).toHaveURL(/\/docs\/comparison\/$/);
  await context.close();
});

test('hover intent switches groups without moving focus, survives the gap, and Escape dismisses', async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  const nav=root(page), product=nav.locator('summary').filter({hasText:'プロダクト'}), components=nav.locator('summary').filter({hasText:'コンポーネント'});
  await page.getByRole('combobox',{name:'パック'}).focus();
  await product.hover(); await expect(product.locator('..')).toHaveAttribute('open','');
  await expect(page.getByRole('combobox',{name:'パック'})).toBeFocused();
  // A first click after hover keeps the panel available; another explicit click closes it.
  await product.click(); await expect(product.locator('..')).toHaveAttribute('open','');
  await product.click(); await expect(product.locator('..')).not.toHaveAttribute('open');
  await page.mouse.move(20,20);await product.hover();
  await expect(nav.getByRole('link',{name:/Navigation Menu/})).toBeVisible();
  const trigger=await product.boundingBox(), content=await product.locator('..').locator(':scope > ul').boundingBox();
  await page.mouse.move(trigger!.x+20,trigger!.y+trigger!.height+3);await page.waitForTimeout(120);
  await page.mouse.move(content!.x+30,content!.y+25);await page.waitForTimeout(350);
  await expect(nav.getByRole('link',{name:/Navigation Menu/})).toBeVisible();
  await components.hover();await expect(nav.getByRole('link',{name:'操作用のMenu'})).toBeVisible();
  await expect(nav.getByRole('link',{name:/Navigation Menu/})).toBeHidden();
  await page.keyboard.press('Escape');await expect(nav.locator('details[open]')).toHaveCount(0);
  await page.waitForTimeout(250);await expect(nav.locator('details[open]')).toHaveCount(0);
  await page.mouse.move(20,20);await product.hover();await expect(product.locator('..')).toHaveAttribute('open','');
  await page.mouse.move(20,20);await expect(nav.locator('details[open]')).toHaveCount(0);
});

test('flyout supports diagonal pointer travel and forward/backward keyboard navigation', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});
  const nav=root(page), product=nav.locator('summary').filter({hasText:'プロダクト'}), developers=nav.locator('summary').filter({hasText:'開発者向け'});
  await product.hover();await expect(developers).toBeVisible();await developers.hover();
  const child=developers.locator('..').locator(':scope > ul'), parentPanel=product.locator('..').locator(':scope > ul');
  await expect(child).toHaveAttribute('data-floating','submenu');
  const p=await parentPanel.boundingBox(),c=await child.boundingBox(),t=await developers.boundingBox();
  expect(c!.x).toBeGreaterThanOrEqual(p!.x+p!.width+6);
  // Pause across the gap while aiming at the child, longer than an ordinary close delay.
  await page.mouse.move(t!.x+t!.width-4,t!.y+t!.height/2);
  await page.mouse.move(p!.x+p!.width+3,c!.y+c!.height*.6,{steps:4});await page.waitForTimeout(400);
  await expect(child).toBeVisible();
  await page.mouse.move(c!.x+30,c!.y+c!.height*.6,{steps:4});await page.waitForTimeout(400);await expect(child).toBeVisible();
  await developers.focus();await developers.press('ArrowRight');await expect(nav.getByRole('link',{name:/AIでつくる/})).toBeFocused();
  await page.keyboard.press('ArrowLeft');await expect(developers).toBeFocused();await expect(child).toBeHidden();
  await nav.evaluate(el=>el.setAttribute('dir','rtl'));
  await developers.press('ArrowLeft');await expect(nav.getByRole('link',{name:/AIでつくる/})).toBeFocused();
  await page.keyboard.press('ArrowRight');await expect(developers).toBeFocused();
});

test('floating panels escape clipping, flip at the edge, reposition on scroll and become inline on resize', async ({page}) => {
  await page.setViewportSize({width:1100,height:800});
  const nav=root(page), product=nav.locator('summary').filter({hasText:'プロダクト'}), developers=nav.locator('summary').filter({hasText:'開発者向け'});
  await nav.evaluate(el=>{el.style.position='relative';el.style.marginLeft='auto';el.style.width='280px';el.parentElement!.style.overflow='hidden';});
  await product.focus();await product.press('ArrowDown');await developers.focus();await developers.press('ArrowRight');
  const child=developers.locator('..').locator(':scope > ul');await expect(child).toHaveAttribute('data-floating','submenu');
  await expect(developers.locator('..')).toHaveAttribute('data-side','left');
  const box=await child.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(12);expect(box!.x+box!.width).toBeLessThanOrEqual(1088);
  await expect(nav.getByRole('link',{name:/AIでつくる/})).toBeInViewport();
  await page.evaluate(()=>window.scrollBy(0,100));
  await expect.poll(async()=>{const t=await developers.boundingBox(),p=await child.boundingBox();return Math.abs((t!.y-8)-p!.y);}).toBeLessThan(5);
  await page.setViewportSize({width:320,height:800});
  await nav.evaluate(el=>{el.style.removeProperty('width');el.style.removeProperty('margin-left');});
  await expect(child).not.toHaveAttribute('popover');await expect(child).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('keyboard focus is not hidden by pointer departure or switching', async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  const nav=root(page), product=nav.locator('summary').filter({hasText:'プロダクト'}), components=nav.locator('summary').filter({hasText:'コンポーネント'});
  await product.focus();await product.press('ArrowDown');const link=nav.getByRole('link',{name:/Navigation Menu/});
  await components.hover();await page.waitForTimeout(350);await expect(link).toBeFocused();await expect(link).toBeVisible();
  await page.mouse.move(0,0);await page.waitForTimeout(400);await expect(link).toBeVisible();
  await page.keyboard.press('Escape');await expect(product).toBeFocused();await expect(link).toBeHidden();
});

test('touch opens and closes with explicit activation', async ({browser}) => {
  const context=await browser.newContext({hasTouch:true,viewport:{width:1100,height:800}});
  const page=await context.newPage();await page.goto('http://localhost:3201/components/navigation-menu/');
  const nav=root(page),product=nav.locator('summary').filter({hasText:'プロダクト'}),developers=nav.locator('summary').filter({hasText:'開発者向け'});
  await product.tap();await expect(developers).toBeVisible();await developers.tap();await expect(nav.getByRole('link',{name:/AIでつくる/})).toBeVisible();
  await product.tap();await expect(developers).toBeHidden();await context.close();
});

test('inline submenus and navigation without Popover API keep native links usable', async ({page}) => {
  await page.setViewportSize({width:1280,height:900});
  const nav=root(page),product=nav.locator('summary').filter({hasText:'プロダクト'}),developers=nav.locator('summary').filter({hasText:'開発者向け'});
  await developers.locator('..').evaluate(el=>el.setAttribute('data-submenu','inline'));
  await product.focus();await product.press('ArrowDown');await developers.focus();await developers.press('ArrowRight');
  const child=developers.locator('..').locator(':scope > ul');await expect(child).not.toHaveAttribute('popover');await expect(child).toBeVisible();
  await product.focus();await product.press('Escape');
  await nav.evaluate(el=>{for(const p of el.querySelectorAll('ul'))Object.defineProperty(p,'showPopover',{value:undefined});});
  await product.press('ArrowDown');await developers.focus();await developers.press('ArrowRight');
  await expect(nav.locator('[popover]')).toHaveCount(0);await expect(nav.getByRole('link',{name:/AIでつくる/})).toBeFocused();
});

test('scrolling the trigger away closes floating panels without leaving focus hidden', async ({page}) => {
  const nav=root(page),product=nav.locator('summary').filter({hasText:'プロダクト'});
  await product.focus();await product.press('ArrowDown');await expect(nav.locator('[data-slot="navigation-menu-panel"]:popover-open')).toHaveCount(1);
  await page.evaluate(()=>window.scrollTo(0,1600));
  await expect(nav.locator('details[open]')).toHaveCount(0);await expect(product).toBeFocused();
});

test('opt-out, reduced motion, open floating panels and both themes are accessible', async ({page},info) => {
  await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  const nav=root(page),product=nav.locator('summary').filter({hasText:'プロダクト'}),developers=nav.locator('summary').filter({hasText:'開発者向け'});
  await nav.evaluate(el=>el.setAttribute('data-hover','false'));await product.hover();await page.waitForTimeout(250);await expect(product.locator('..')).not.toHaveAttribute('open');
  for(const pack of ['graphite','lucent'])for(const theme of ['light','dark']) {
    await page.evaluate(({pack,theme})=>Object.assign(document.documentElement.dataset,{pack,theme}),{pack,theme});
    await product.focus();await product.press('ArrowDown');await developers.focus();await developers.press('ArrowRight');
    const violations=(await new AxeBuilder({page}).include('[aria-label="製品サイト"]').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations;
    expect(violations).toEqual([]);
    expect(await nav.locator('[data-floating="submenu"]').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
    await info.attach(`flyout-${pack}-${theme}`,{body:await page.screenshot(),contentType:'image/png'});
    await product.focus();await product.press('Escape');
  }
});

test('runtime disposal cancels delayed opens, restores native markup and supports reinstall', async ({page}) => {
  const script=await build({entryPoints:['packages/core/src/navigation-menu.ts'],bundle:true,format:'iife',globalName:'NavigationRuntimeTest',write:false});
  const css=await readFile('packages/react/styles/index.css','utf8');
  await page.goto('about:blank');await page.setViewportSize({width:1000,height:800});
  await page.setContent(`<style>${css}</style><nav data-slot="navigation-menu" aria-label="Lifecycle"><ul data-slot="navigation-menu-list"><li data-slot="navigation-menu-entry"><details data-slot="navigation-menu-group"><summary data-slot="navigation-menu-trigger">Product</summary><ul data-slot="navigation-menu-panel"><li><a data-slot="navigation-menu-link" href="#target">Overview</a></li></ul></details></li></ul></nav>`);
  await page.addScriptTag({content:script.outputFiles[0].text});
  type HarnessWindow = Window & {NavigationRuntimeTest:{installNavigationMenus:(doc:Document)=>()=>void};disposeNavigation:()=>void};
  const install=()=>page.evaluate(()=>{const w=window as unknown as HarnessWindow;w.disposeNavigation=w.NavigationRuntimeTest.installNavigationMenus(document);});
  const dispose=()=>page.evaluate(()=>{(window as unknown as HarnessWindow).disposeNavigation();});
  await install();const trigger=page.locator('summary');await trigger.hover();await dispose();await page.waitForTimeout(250);
  await expect(page.locator('details')).not.toHaveAttribute('open');
  await trigger.click();await expect(page.locator('details')).toHaveAttribute('open','');await expect(page.locator('[popover]')).toHaveCount(0);
  await install();await expect(page.locator('[data-slot="navigation-menu-panel"]:popover-open')).toHaveCount(1);
  await dispose();await expect(page.locator('[popover]')).toHaveCount(0);await expect(page.getByRole('link',{name:'Overview'})).toBeVisible();
  await install();await expect(page.locator('[data-slot="navigation-menu-panel"]:popover-open')).toHaveCount(1);
  await page.locator('details').evaluate(el=>el.remove());await expect(page.locator(':popover-open')).toHaveCount(0);
  await dispose();
});

test('shared surface morphs continuously, retargets during motion and keeps a single accessible panel', async ({page},info) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  const nav=root(page),product=nav.locator('summary').filter({hasText:'プロダクト'}),components=nav.locator('summary').filter({hasText:'コンポーネント'});
  const surface=nav.locator('[data-slot="navigation-menu-surface"]');
  await product.press('Enter');await expect(surface).toHaveCount(1);
  const before=await surface.boundingBox();
  await components.press('Enter');
  const middle=await surface.evaluate(el=>{
    const a=el.getAnimations()[0]; if(!a)throw Error('No morph animation');
    a.pause();a.currentTime=60;
    const box=el.getBoundingClientRect();return {width:box.width,x:box.x,targetWidth:parseFloat((el as HTMLElement).style.width)};
  });
  expect(middle.width).toBeGreaterThan(before!.width+4);expect(middle.width).toBeLessThan(middle.targetWidth-2);
  await expect(nav.locator(':scope > ul > li > details[open]')).toHaveCount(1);
  await expect(nav.getByRole('list',{name:'プロダクト',exact:true})).toHaveCount(0);
  await expect(surface).toHaveAttribute('aria-hidden','true');await expect(surface).toHaveAttribute('inert','');
  await info.attach('morph-middle',{body:await page.screenshot(),contentType:'image/png'});
  // Interrupt the animation at a known frame. The next motion starts there.
  const interrupted=await nav.evaluate(el=>{
    const s=el.querySelector<HTMLElement>('[data-slot="navigation-menu-surface"]')!;
    const before=s.getBoundingClientRect();el.querySelector<HTMLElement>('summary')!.click();
    const animation=s.getAnimations()[0];animation.pause();animation.currentTime=0;
    const after=s.getBoundingClientRect();return {before:{x:before.x,width:before.width},after:{x:after.x,width:after.width}};
  });
  expect(Math.abs(interrupted.before.x-interrupted.after.x)).toBeLessThan(1);
  expect(Math.abs(interrupted.before.width-interrupted.after.width)).toBeLessThan(1);
  await surface.evaluate(el=>el.getAnimations().forEach(a=>a.finish()));
  await expect(surface).toHaveCount(1);
  await product.press('Escape');await expect(surface).toHaveCount(0);
});

test('keyboard switching morphs, live reduced-motion stops motion, and resizing removes the surface', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
  const nav=root(page),product=nav.locator('summary').filter({hasText:'プロダクト'}),components=nav.locator('summary').filter({hasText:'コンポーネント'});
  await product.press('Enter');await product.press('ArrowRight');await expect(components).toBeFocused();
  await expect(nav.getByRole('link',{name:'操作用のMenu'})).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  // WebKit applies emulated preferences asynchronously. Observe the actual
  // preference before checking the runtime's response or switching again.
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await expect.poll(()=>nav.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  await components.press('ArrowLeft');await expect(product).toBeFocused();
  expect(await nav.locator('[data-slot="navigation-menu-surface"]').evaluate(el=>el.getAnimations().length)).toBe(0);
  await page.setViewportSize({width:320,height:800});
  await expect(nav.locator('[data-slot="navigation-menu-surface"]')).toHaveCount(0);
  await expect(nav.getByRole('link',{name:/Navigation Menu/})).toBeVisible();
});
