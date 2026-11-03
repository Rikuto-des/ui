import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
  await page.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.fulfill({status:200,contentType:'text/css',body:''}));
  await page.emulateMedia({reducedMotion:'reduce'});
});
test('Combobox skips a disabled search result and restores committed selection',async({page})=>{
  await page.goto('/components/combobox/');const box=page.getByRole('combobox',{name:'担当者',exact:true});
  await box.fill('Ren');await expect(page.getByRole('option',{name:'Ren Aoki 休暇中'})).toHaveAttribute('aria-disabled','true');
  await box.press('ArrowDown');await box.press('Enter');await expect(box).toHaveAttribute('aria-expanded','true');
  await box.press('Escape');await expect(box).toHaveValue('Mika Sato');
});
test('DatePicker detail supports keyboard selection and focus restoration',async({page})=>{
  await page.goto('/components/date-picker/');await page.getByRole('button',{name:'公開日: 2026-10-30'}).click();
  await expect(page.getByRole('button',{name:/2026年10月30日\s*金曜日/})).toBeFocused();
  await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');
  await expect(page.getByLabel('公開日',{exact:true})).toHaveValue('2026-10-31');
  await expect(page.getByRole('button',{name:'公開日: 2026-10-31'})).toBeFocused();
});
test('DataTable detail supports mixed selection, sorting and pagination',async({page})=>{
  await page.goto('/components/data-table/');await page.getByRole('checkbox',{name:'Websiteを選択',exact:true}).check();
  await expect(page.getByRole('checkbox',{name:'このページを選択'})).toHaveJSProperty('indeterminate',true);
  await page.getByRole('button',{name:'次のページ',exact:true}).click();await expect(page.getByRole('cell',{name:'Onboarding',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'名前',exact:true}).click();await expect(page.locator('th[aria-sort="ascending"]')).toContainText('名前');
});
test('Command detail runs an item, closes to its trigger and has no axe violations',async({page})=>{
  await page.goto('/components/command/');const trigger=page.getByRole('button',{name:'コマンドを開く',exact:true});await trigger.click();
  const dialog=page.getByRole('dialog',{name:'コマンドを検索',exact:true});await expect(dialog).toBeVisible();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  const box=page.getByRole('combobox',{name:'コマンドを検索',exact:true});await box.fill('settings');await box.press('Enter');
  await expect(page.getByRole('status').filter({hasText:'設定を選択しました。'})).toBeVisible();await expect(trigger).toBeFocused();
  await trigger.click();await box.press('Escape');await expect(trigger).toBeFocused();
});
test('copy control does not cover code at 320px',async({page})=>{
  await page.setViewportSize({width:320,height:900});await page.goto('/components/combobox/');
  const block=page.locator('#install').locator('..').locator('.code-block');
  const pre=await block.locator('pre').boundingBox();const button=await block.getByRole('button',{name:'コピー'}).boundingBox();
  expect(pre).not.toBeNull();expect(button).not.toBeNull();expect(button!.y+button!.height).toBeLessThanOrEqual(pre!.y);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
