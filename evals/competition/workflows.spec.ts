import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const entries=JSON.parse(readFileSync(new URL('./current.json',import.meta.url),'utf8'));
for(const e of entries){
  const updated=e.stage==='update'||e.stage==='update-repair';
  const title=(s:string)=>`${e.id} | ${s}`;
  test(title('keyboard'),async({page})=>{
    await page.goto(e.url);
    if(e.task==='dialog'){
      const trigger=page.getByRole('button',{name:'Delete Atlas',exact:true});await trigger.click();
      const dialog=page.getByRole('dialog',{name:'Delete project',exact:true});await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button',{name:'Cancel',exact:true})).toBeFocused();
      await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
      await trigger.click();await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await expect(dialog).toBeHidden();await expect(page.getByText('Atlas project',{exact:true})).toBeVisible();await expect(trigger).toBeFocused();
    }else if(e.task==='tabs'){
      const profile=page.getByRole('tab',{name:'Profile',exact:true}), security=page.getByRole('tab',{name:'Security',exact:true});
      await expect(page.getByRole('tablist',{name:'Account sections'})).toBeVisible();await expect(profile).toHaveAttribute('aria-selected','true');
      await profile.focus();await page.keyboard.press('ArrowRight');await expect(security).toHaveAttribute('aria-selected','true');
      await page.keyboard.press('ArrowRight');await expect(profile).toHaveAttribute('aria-selected','true');
      await expect(page.getByRole('tab',{name:'Billing',exact:true})).toBeDisabled();
    }else{
      const trigger=page.getByRole('button',{name:'Actions for Atlas',exact:true});await trigger.focus();await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('menu')).toBeVisible();
      const rename=page.getByRole('menuitem',{name:'Rename',exact:true});await expect(rename).toBeDisabled();
      await expect(page.getByRole('menuitem',{name:'Archive',exact:true})).toBeFocused();
      await page.keyboard.press('ArrowDown');
      // Allow deferred focus effects to run before a negative assertion can pass.
      await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
      await expect(rename).not.toBeFocused();
      await page.keyboard.press('Escape');await expect(page.getByRole('menu')).toBeHidden();await expect(trigger).toBeFocused();
    }
  });
  test(title('state and update'),async({page})=>{
    await page.goto(e.url);
    if(e.task==='dialog'){
      await page.getByRole('button',{name:'Delete Atlas',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Delete project',exact:true});
      await dialog.getByRole('button',{name:'Confirm delete',exact:true}).click();
      if(updated){
        await expect(dialog.getByText('Deleting…',{exact:true})).toBeVisible();await expect(dialog.getByRole('button',{name:'Cancel',exact:true})).toBeDisabled();
        await page.keyboard.press('Escape');await expect(dialog).toBeVisible();
        await expect(page.getByRole('alert')).toHaveText('Deletion failed');await expect(page.getByText('Atlas project',{exact:true})).toBeAttached();
        await dialog.getByRole('button',{name:'Confirm delete',exact:true}).click();
      }
      await expect(dialog).toBeHidden();await expect(page.getByText('Atlas project',{exact:true})).toBeHidden();await expect(page.getByRole('status')).toHaveText('Project deleted');
    }else if(e.task==='tabs'){
      await page.getByRole('textbox',{name:'Display name',exact:true}).fill('Mika');
      const security=page.getByRole('tab',{name:'Security',exact:true}),profile=page.getByRole('tab',{name:'Profile',exact:true});
      await security.click();await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(security).toHaveAttribute('aria-selected','true');await expect(page.getByText('Refresh count: 1',{exact:true})).toBeVisible();
      await profile.click();await expect(page.getByRole('textbox',{name:'Display name',exact:true})).toHaveValue('Mika');
      if(updated){
        for(let i=0;i<2;i++){
          await page.getByRole('button',{name:'Open security',exact:true}).click();await expect(security).toHaveAttribute('aria-selected','true');
          await profile.click();await page.getByRole('button',{name:'Open security',exact:true}).click();await expect(security).toHaveAttribute('aria-selected','true');
          await page.getByRole('button',{name:'Open profile',exact:true}).click();await expect(profile).toHaveAttribute('aria-selected','true');
          await profile.focus();await page.keyboard.press('ArrowRight');await expect(security).toHaveAttribute('aria-selected','true');
          await page.getByRole('button',{name:'Open profile',exact:true}).click();await expect(profile).toHaveAttribute('aria-selected','true');
        }
        await page.getByRole('button',{name:'Save name',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Saved: Mika'})).toHaveText('Saved: Mika');
      }
    }else{
      const trigger=()=>page.getByRole('button',{name:'Actions for Atlas',exact:true});
      const cycles=updated?2:1;
      for(let i=0;i<cycles;i++){
        if(i===0)await trigger().click();else{await trigger().focus();await page.keyboard.press('ArrowDown');}
        await page.getByRole('menuitem',{name:'Archive',exact:true}).click();await expect(page.getByText('Atlas task',{exact:true})).toBeHidden();await expect(page.getByText('Boreal task',{exact:true})).toBeVisible();await expect(page.getByRole('status')).toHaveText('Archived Atlas');await expect(page.getByRole('menu')).toBeHidden();
        if(updated){await page.getByRole('button',{name:'Undo archive',exact:true}).click();await expect(page.getByText('Atlas task',{exact:true})).toBeVisible();await expect(page.getByRole('status')).toHaveText('Restored Atlas');await expect(page.getByRole('button',{name:'Undo archive',exact:true})).toBeHidden();await expect(page.getByRole('button',{name:/Actions for (Atlas|Boreal)/}).nth(0)).toHaveAccessibleName('Actions for Atlas');await expect(page.getByRole('button',{name:/Actions for (Atlas|Boreal)/}).nth(1)).toHaveAccessibleName('Actions for Boreal');}
      }
    }
  });
  test(title('accessibility'),async({page})=>{
    const errors:string[]=[];page.on('pageerror',(e)=>errors.push(e.message));await page.goto(e.url);
    await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
    if(e.task==='dialog')await page.getByRole('button',{name:'Delete Atlas',exact:true}).click();
    if(e.task==='menu')await page.getByRole('button',{name:'Actions for Atlas',exact:true}).click();
    await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity));
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}))).toEqual([]);expect(errors).toEqual([]);
  });
  test(title('mobile'),async({page})=>{
    await page.setViewportSize({width:320,height:740});await page.goto(e.url);
    if(e.task==='dialog')await page.getByRole('button',{name:'Delete Atlas',exact:true}).click();
    if(e.task==='menu')await page.getByRole('button',{name:'Actions for Atlas',exact:true}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(e.task==='dialog'){
      const box=await page.getByRole('dialog').boundingBox();expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(321);
    }
  });
}
