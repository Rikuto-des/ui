import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
  await page.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.fulfill({status:200,contentType:'text/css',body:''}));
  await page.goto('/components/');
});
const item=(page:import('@playwright/test').Page,slug:string)=>page.locator(`.catalog-grid > li[data-component="${slug}"]`);

test('all 52 entries contain real previews without nested interactive links or duplicate IDs',async({page})=>{
  await expect(page.locator('.catalog-grid > li')).toHaveCount(52);
  const result=await page.locator('.catalog-grid').evaluate(el=>({
    missing:[...el.querySelectorAll(':scope > li')].filter(li=>!li.querySelector('.catalog-preview [data-slot]')).map(li=>li.getAttribute('data-component')),
    nested:el.querySelectorAll('.catalog-details :is(button,input,select,textarea,a)').length,
    duplicate:[...document.querySelectorAll('[id]')].map(el=>el.id).filter((id,i,ids)=>ids.indexOf(id)!==i),
  }));
  expect(result).toEqual({missing:[],nested:0,duplicate:[]});
  await expect(item(page,'button').getByRole('link',{name:/Button/})).toHaveAttribute('href','/components/button/');
});

test('inputs, buttons, switches and tabs operate in place and keep state across filtering',async({page})=>{
  await item(page,'button').getByRole('button',{name:'変更を保存'}).click();
  await expect(item(page,'button').getByRole('status')).toHaveText('変更が反映されました。');
  await item(page,'input').getByRole('textbox',{name:'名前'}).fill('Studio North');
  const toggle=item(page,'switch').getByRole('switch',{name:'フォーカスモード'});await toggle.check();await expect(toggle).toBeChecked();
  await item(page,'tabs').getByRole('tab',{name:'Security'}).click();await expect(item(page,'tabs').getByLabel('パスワード')).toBeVisible();
  const search=page.getByRole('searchbox',{name:'コンポーネントを検索'});await search.fill('Dialog');await expect(item(page,'input')).toBeHidden();await search.fill('');
  await expect(item(page,'input').getByRole('textbox',{name:'名前'})).toHaveValue('Studio North');
  await expect(toggle).toBeChecked();await expect(item(page,'tabs').getByLabel('パスワード')).toBeVisible();
  await expect(page).toHaveURL(/\/components\/$/);
});

test('overlay previews escape the card, close and restore focus; catalog navigation can morph',async({page})=>{
  await expect(page.locator('html')).toHaveAttribute('data-urushi-runtime','ready');
  const dialog=item(page,'dialog').getByRole('button',{name:/プロジェクトを作成/});await expect(dialog).toBeEnabled();await dialog.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:'新しいプロジェクト'})).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).toBeFocused();
  await dialog.click();
  const form=page.getByRole('dialog',{name:'新しいプロジェクト'});
  await form.getByRole('button',{name:'作成する'}).click();await expect(form).toBeVisible();await expect(form.getByLabel('プロジェクト名')).toBeFocused();
  await form.getByLabel('プロジェクト名').fill('Preview project');await form.getByRole('button',{name:'作成する'}).click();await expect(form).toBeHidden();await expect(dialog).toBeFocused();
  await item(page,'popover').getByRole('button',{name:/表示設定/}).click();await expect(page.locator('#catalog-popover')).toBeVisible();
  await page.locator('#catalog-popover').getByRole('switch',{name:'ガイドを表示'}).check();await page.keyboard.press('Escape');await expect(page.locator('#catalog-popover')).toBeHidden();
  const nav=item(page,'navigation-menu').getByRole('navigation',{name:'一覧のNavigation Menu'});
  await nav.locator('summary').filter({hasText:'Product'}).press('ArrowDown');await expect(nav.getByRole('link',{name:/Button/})).toBeVisible();
  await nav.locator('summary').filter({hasText:'Explore'}).press('ArrowDown');await expect(nav.getByRole('link',{name:'Dialog',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(nav.locator('details[open]')).toHaveCount(0);
  await item(page,'toast').getByRole('button',{name:'通知を表示'}).click();await expect(page.getByRole('region',{name:'通知'})).toContainText('変更を保存しました');
});

test('range, progress, pagination and empty state have meaningful local changes',async({page})=>{
  const slider=item(page,'slider').getByRole('slider');await expect(slider).toBeEnabled();await slider.focus();await page.keyboard.press('ArrowRight');await expect(slider).toHaveValue('65');
  await item(page,'progress').getByRole('button',{name:'進める'}).click();await expect(item(page,'progress').getByRole('progressbar')).toHaveAttribute('value','60');
  await item(page,'pagination').getByRole('link',{name:'次へ'}).click();await expect(item(page,'pagination').getByRole('status')).toHaveText('ページ 2 / 3');
  await item(page,'empty').getByRole('button',{name:'プロジェクトを作成'}).click();await expect(item(page,'empty').getByRole('status')).toHaveText('最初のプロジェクトができました。');
  await expect(page).toHaveURL(/\/components\/$/);
});

test('every preview fits at 320px and desktop in both packs and themes, with no axe violations',async({page},info)=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const pack of ['graphite','lucent'])for(const theme of ['light','dark']){
    await page.getByRole('combobox',{name:'パック'}).selectOption(pack);await page.getByRole('combobox',{name:'テーマ'}).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-pack',pack);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    for(const width of [320,1440]){
      await page.setViewportSize({width,height:1000});
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overflow=await page.locator('.catalog-preview').evaluateAll(elements=>elements.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.closest('[data-component]')!.getAttribute('data-component')));
      expect(overflow,`${pack}/${theme}/${width}`).toEqual([]);
    }
    await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running' || a.effect?.getTiming().iterations===Infinity || !((a.effect as KeyframeEffect)?.target as Element)?.checkVisibility()));
    const {violations}=await new AxeBuilder({page}).include('.component-catalog').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))})),`${pack}/${theme}`).toEqual([]);
    await info.attach(`catalog-${pack}-${theme}`,{body:await page.screenshot(),contentType:'image/png'});
  }
});
