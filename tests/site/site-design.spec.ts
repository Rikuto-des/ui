import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route=>route.fulfill({status:200,contentType:'text/css',body:''}));
});

test('catalog searches by name and purpose, filters categories and resets empty results',async({page})=>{
  await page.goto('/components/');
  const search=page.getByRole('searchbox',{name:'コンポーネントを検索'});
  await search.fill('NavigationMenu');
  await expect(page.locator('.catalog-grid > li:visible')).toHaveCount(1);
  await expect(page.locator('.catalog-grid')).toContainText('NavigationMenu');
  await search.fill('');await page.getByRole('group',{name:'コンポーネントの分類'}).getByRole('button',{name:'入力',exact:true}).click();
  await expect(page.locator('.catalog-grid')).toContainText('Input');
  await expect(page.locator('[data-component="navigation-menu"]')).toBeHidden();
  await search.fill('存在しないコンポーネント');await page.getByRole('button',{name:'条件をリセット'}).click();
  await expect(search).toHaveValue('');await expect(page.locator('.catalog-grid > li:visible')).toHaveCount(60);
});

test('component site and interactive study fit narrow viewports in both themes',async({page})=>{
  for(const width of [320,768])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    for(const path of ['/','/components/','/components/navigation-menu/','/docs/comparison/']){
      await page.goto(path);await page.getByRole('combobox',{name:'テーマ'}).selectOption(theme);
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
    }
  }
});

