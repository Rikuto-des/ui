import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route=>route.fulfill({status:200,contentType:'text/css',body:''}));
});

  test.use({video:{mode:'on',size:{width:1280,height:900}},viewport:{width:1280,height:900}});
  test('the live study switches after resize, supports hover and remains accessible with the dark local pack',async({page},info)=>{
    await page.setViewportSize({width:595,height:900});await page.goto('/');
    await page.setViewportSize({width:1280,height:900});
    const nav=page.getByRole('navigation',{name:'Urushiの機能'});
    const first=nav.locator('summary').filter({hasText:'つくる'}),second=nav.locator('summary').filter({hasText:'確かめる'}),third=nav.locator('summary').filter({hasText:'育てる'});
    // Firefox can leave CSS transitions in closed details pending indefinitely.
    // Only painted targets participate; shared surface animations remain checked.
    const settled=()=>expect.poll(()=>nav.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running' && ((a.effect as KeyframeEffect)?.target as Element)?.checkVisibility()).length)).toBe(0);
    for(const trigger of [first,second,third,second,first]){
      await trigger.hover();await expect(trigger.locator('..')).toHaveAttribute('open','');await settled();
    }
    await nav.locator('summary').filter({hasText:'デザインを選ぶ'}).hover();
    await expect(nav.getByRole('link',{name:/日本語組版/})).toBeVisible();
    await expect(nav.locator('[data-slot="navigation-menu-surface"]')).toHaveCount(2);
    const axe=await new AxeBuilder({page}).include('[aria-label="Urushiの機能"]').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(axe.violations).toEqual([]);
    await info.attach('homepage-open-flyout',{body:await page.screenshot(),contentType:'image/png'});
    await page.keyboard.press('Escape');await expect(nav.locator('details[open]')).toHaveCount(0);
  });
