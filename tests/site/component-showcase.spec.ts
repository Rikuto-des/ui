import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({page}) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({status:200,contentType:'text/css',body:''}));
  await page.goto('/');
});

test('composed components preserve state through search, tabs, add and remove', async ({page}) => {
  const studio = page.getByRole('region', {name:'コンポーネントの使用例'});
  await studio.getByRole('checkbox',{name:'コンポーネントを整えるの完了状態'}).check();
  await expect(studio.getByRole('progressbar')).toHaveAttribute('value','3');
  await studio.getByRole('textbox',{name:'見本のタスクを検索'}).fill('コンポーネント');
  await expect(studio.locator('.studio-tasks > li')).toHaveCount(1);
  await studio.getByRole('tab',{name:'概要',exact:true}).click();
  await studio.getByRole('tab',{name:'タスク',exact:true}).click();
  await expect(studio.getByRole('textbox',{name:'見本のタスクを検索'})).toHaveValue('コンポーネント');
  await studio.getByRole('button',{name:'タスクを追加',exact:true}).click();
  const dialog = page.getByRole('dialog',{name:'タスクを追加',exact:true});
  await expect(dialog.getByRole('textbox',{name:'タスク名',exact:true})).toBeFocused();
  await dialog.getByRole('textbox',{name:'タスク名',exact:true}).fill('アクセシビリティを確認する');
  await dialog.getByRole('button',{name:'追加する',exact:true}).click();
  await expect(dialog).toBeHidden();await expect(studio.locator('.studio-tasks > li')).toHaveCount(5);
  await expect(studio.getByRole('status')).toHaveText('「アクセシビリティを確認する」を追加しました');
  await studio.getByRole('button',{name:'アクセシビリティを確認するの操作',exact:true}).click();
  await page.getByRole('menuitem',{name:'削除する',exact:true}).click();
  await expect(studio.locator('.studio-tasks > li')).toHaveCount(4);
  await expect(studio.getByRole('progressbar')).toHaveAttribute('value','3');
  await expect(studio.getByRole('checkbox',{name:'コンポーネントを整えるの完了状態'})).toBeChecked();
});

test('both packs and themes fit narrow layouts and keep readable controls', async ({page}, info) => {
  for (const width of [1280, 320]) for (const pack of ['graphite','lucent']) for (const theme of ['light','dark']) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(({pack,theme})=>Object.assign(document.documentElement.dataset,{pack,theme}),{pack,theme});
    await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getTiming().iterations===Infinity));
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole('button',{name:'タスクを追加',exact:true})).toBeVisible();
    const result = await new AxeBuilder({page}).include('.studio').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(result.violations).toEqual([]);
    await info.attach(`showcase-${pack}-${theme}-${width}`, {body:await page.getByRole('region',{name:'コンポーネントの使用例'}).screenshot(),contentType:'image/png'});
  }
});
