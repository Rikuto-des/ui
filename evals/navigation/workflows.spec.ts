import {readFileSync} from 'node:fs';
import {test,expect,type Page,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const trigger=(scope:Page|Locator,name:string)=>scope.getByRole('button',{name,exact:true}).or(scope.locator('summary').filter({hasText:new RegExp('^'+name+'$')}));
const open=(scope:Page|Locator,name:string)=>trigger(scope,name).press('Enter');
const entries=JSON.parse(readFileSync(new URL('./current.json',import.meta.url),'utf8'));
for(const e of entries){
  const updated=e.stage.startsWith('update'), title=(s:string)=>`${e.id} | ${s}`;
  test(title('keyboard and dismissal'),async({page})=>{
    await page.goto(e.url);
    const nav=page.getByRole('navigation',{name:'Main navigation',exact:true}); await expect(nav).toBeVisible();
    const products=trigger(nav,'Products'), resources=trigger(nav,'Resources');
    await expect(page.getByRole('link',{name:'Overview',exact:true})).toBeHidden();
    await products.focus(); await page.keyboard.press('Enter'); await expect(page.getByRole('link',{name:'Overview',exact:true})).toBeVisible(); await products.press('Tab');
    await expect(page.getByRole('link',{name:'Overview',exact:true})).toBeFocused();
    await page.keyboard.press('Escape'); await expect(page.getByRole('link',{name:'Overview',exact:true})).toBeHidden();await expect(products).toBeFocused();
    await page.keyboard.press('Enter');await expect(page.getByRole('link',{name:'Overview',exact:true})).toBeVisible();
    await resources.press('Enter');await expect(page.getByRole('link',{name:updated?'Guides':'Documentation',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Overview',exact:true})).toBeHidden();
    await page.getByRole('textbox',{name:'Search site',exact:true}).focus();await expect(page.getByRole('link',{name:updated?'Guides':'Documentation',exact:true})).toBeHidden();
  });
  test(title('links and update'),async({page})=>{
    await page.goto(e.url);const nav=page.getByRole('navigation',{name:'Main navigation',exact:true});
    const products=trigger(nav,'Products'),resources=trigger(nav,'Resources');
    await products.press('Enter');const current=page.getByRole('link',{name:updated?'Integrations':'Overview',exact:true});
    await expect(current).toHaveAttribute('aria-current','page');await expect(page.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(page.getByRole('link',{name:'Overview',exact:true})).toHaveAttribute('href','#overview');
    await page.getByRole('link',{name:'Integrations',exact:true}).click();await expect(page).toHaveURL(/#integrations$/);await expect(page.getByRole('link',{name:'Integrations',exact:true})).toBeHidden();
    await page.getByRole('textbox',{name:'Search site',exact:true}).fill('Keep this query');await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.getByText('Refresh count: 1',{exact:true})).toBeVisible();
    if(updated)for(let i=0;i<2;i++){
      await page.getByRole('button',{name:'Toggle support',exact:true}).click();await resources.press('Enter');await expect(page.getByRole('link',{name:'Support',exact:true})).toBeHidden();await expect(page.getByRole('link',{name:'Changelog',exact:true})).toHaveAttribute('href','#changelog');
      await page.getByRole('button',{name:'Toggle support',exact:true}).click();await resources.press('Enter');await expect(page.getByRole('link',{name:'Support',exact:true})).toBeVisible();await page.getByRole('textbox',{name:'Search site',exact:true}).focus();
    }
    await expect(page.getByRole('textbox',{name:'Search site',exact:true})).toHaveValue('Keep this query');
    await resources.press('Enter');await page.getByRole('link',{name:updated?'Guides':'Documentation',exact:true}).click();await expect(page).toHaveURL(/#docs$/);
    await nav.getByRole('link',{name:'Pricing',exact:true}).click();await expect(page).toHaveURL(/#pricing$/);
    await expect(page.getByRole('menu')).toHaveCount(0);await expect(page.getByRole('menuitem')).toHaveCount(0);
  });
  test(title('accessibility'),async({page})=>{
    await page.goto(e.url);
    for(const group of ['Products','Resources']){
      await open(page,group);
      await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
      const raw=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations;
      // Invisible focus sentinels are not user controls. Exempt only empty, clipped
      // spans from the primitives are reported separately; retain every raw finding.
      // Their conditional redirect behavior is probed, not used as a success claim.
      const guards=page.locator('span[aria-hidden="true"][tabindex="0"]');let verified=0;
      for(let i=0;i<await guards.count();i++){
        const guard=guards.nth(i);
        const sentinel=await guard.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return !el.textContent?.trim()&&r.width<=1&&r.height<=1&&(s.clipPath==='inset(50%)'||s.clip!=='auto');});
        if(!sentinel)continue;
        await trigger(page,group).focus(); await guard.focus();
        try{await expect(guard).not.toBeFocused({timeout:500});verified++;}catch{ /* A focus stop remains an accessibility failure. */ }
      }
      const sentinelOnly=(v:typeof raw[number])=>v.id==='aria-hidden-focus'&&v.nodes.every(n=>n.html.startsWith('<span ')&&n.html.includes('aria-hidden="true"')&&n.html.includes('tabindex="0"')&&/width: 1px/.test(n.html)&&/height: 1px/.test(n.html)&&(/clip: rect/.test(n.html)||/clip-path: inset\(50%\)/.test(n.html))&&n.html.endsWith('></span>'));
      await test.info().attach('axe-raw-'+group,{body:JSON.stringify({violations:raw,verifiedRedirectingSentinels:verified}),contentType:'application/json'});
      expect(raw.filter(v=>!sentinelOnly(v))).toEqual([]);
      await page.getByRole('textbox',{name:'Search site',exact:true}).focus();
    }
  });
  test(title('320px layout'),async({page})=>{
    await page.setViewportSize({width:320,height:760});await page.goto(e.url);
    for(const group of [null,'Products','Resources']){
      if(group){await page.getByRole('textbox',{name:'Search site',exact:true}).focus();await trigger(page,group).tap();}
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      if(group)await expect(page.getByRole('link',{name:group==='Products'?'Overview':updated?'Guides':'Documentation',exact:true})).toBeVisible();
    }
  });
}
