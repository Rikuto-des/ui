import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
});

test('checklist communicates partial selection, completion and reset', async ({ page }) => {
  await page.goto('/components/checkbox/');
  const all = page.getByRole('checkbox', { name: 'すべて確認する', exact: true });
  await expect(all).toHaveJSProperty('indeterminate', true);
  await page.getByRole('checkbox', { name: '小さな画面で見る', exact: true }).check();
  await expect(page.locator('.selection-study-footer')).toContainText('残り1項目');
  await all.check(); await expect(page.getByRole('progressbar', { name: '公開前チェック' })).toHaveJSProperty('value', 100);
  await expect(page.getByText('準備が整いました。', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'すべて解除', exact: true }).click();
  await expect(all).not.toBeChecked(); await expect(all).toHaveJSProperty('indeterminate', false);
});

test('slider presets, arrows and reset update the typography preview', async ({ page }) => {
  await page.goto('/components/slider/');
  await page.getByRole('button', { name: '大きく', exact: true }).click();
  const slider = page.getByRole('slider', { name: '文字サイズ', exact: true });
  await expect(slider).toHaveValue('22'); await expect(page.locator('.type-specimen p')).toHaveCSS('font-size', '22px');
  await slider.press('ArrowLeft'); await expect(slider).toHaveValue('21');
  await page.getByRole('button', { name: 'ゆったり', exact: true }).click();
  await expect(page.getByRole('slider', { name: '余白', exact: true })).toHaveValue('100');
  await expect(page.locator('.type-specimen')).toHaveCSS('padding-top', '30px');
  await page.getByRole('button', { name: '初期値に戻す', exact: true }).click();
  await expect(slider).toHaveValue('18'); await expect(page.locator('.type-specimen p')).toHaveCSS('font-size', '18px');
});

test('focus switch changes the preview and carousel positions control the actual scroll', async ({ page }) => {
  await page.goto('/components/switch/');
  const control = page.getByRole('switch', { name: '集中モード', exact: true });
  await control.check(); await expect(page.locator('.focus-workspace')).toHaveAttribute('data-focus', 'true');
  await expect(page.locator('.focus-setting').getByRole('status')).toHaveText('オン');
  await control.press('Space'); await expect(control).not.toBeChecked();
  await page.goto('/components/carousel/');
  const carousel = page.getByRole('region', { name: 'デザインノート', exact: true });
  await carousel.getByRole('button', { name: '3 / 4', exact: true }).click();
  await expect(carousel.getByRole('status')).toHaveText('3 / 4');
  await expect.poll(() => carousel.locator('[data-slot="carousel-viewport"]').evaluate(el => el.scrollLeft)).toBeGreaterThan(200);
  await carousel.getByRole('button', { name: '次のスライド', exact: true }).click();
  await expect(carousel.getByRole('status')).toHaveText('4 / 4');
});

test('new detail previews fit mobile and desktop with accessible light and dark themes', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 1280]) for (const theme of ['light', 'dark']) for (const slug of ['checkbox', 'switch', 'slider', 'carousel']) {
    await page.setViewportSize({ width, height: 900 }); await page.goto(`/components/${slug}/`);
    await page.getByRole('combobox', { name: 'テーマ', exact: true }).selectOption(theme);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running' || animation.effect?.getTiming().iterations === Infinity || !((animation.effect as KeyframeEffect)?.target as Element)?.checkVisibility()));
    const { violations } = await new AxeBuilder({ page }).include('.example').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), `${slug}/${width}/${theme}`).toEqual([]);
  }
});
