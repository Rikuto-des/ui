import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
});

test('profile comparison keeps confirmation visible on narrow and desktop screens', async ({ page }) => {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/components/combobox/');
    const input = page.getByRole('combobox', { name: '担当者', exact: true });
    await input.click();
    await input.press('ArrowDown');
    await expect(page.getByRole('region', { name: '担当者のプロフィール' })).toContainText('Kai Ito');
    await expect(page.locator('.choice-committed')).toContainText('Mika Sato');
    const action = page.getByRole('button', { name: 'この人を担当者にする' });
    await expect.poll(async () => {
      const popup = await page.locator('[data-slot="combobox-popup"]').boundingBox();
      const button = await action.boundingBox();
      return !!popup && !!button && button.y >= popup.y && button.y + button.height <= Math.min(720, popup.y + popup.height) + 1;
    }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await action.click();
    await expect(input).toHaveValue('Kai Ito');
    await expect(page.locator('.choice-committed')).toContainText('Kai Ito');
    await input.fill('リサーチ');
    await input.press('Tab');
    await expect(page.locator('[data-slot="combobox-preview-content"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Alex Morgan');
  }
});

test('open profile preview has no axe violations in either theme', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/combobox/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'テーマ', exact: true }).selectOption(theme);
    await page.getByRole('combobox', { name: '担当者', exact: true }).click();
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), theme).toEqual([]);
    await page.keyboard.press('Escape');
  }
  const table = page.getByRole('region', { name: 'ComboboxのAPI' });
  await table.scrollIntoViewIfNeeded();
  await table.focus();
  await expect(table).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const dimensions = await table.evaluate(el => ({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth }));
  if (dimensions.max > 0) await expect.poll(() => table.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
});

test('project tabs preserve edits and external navigation uses the same transition', async ({ page }) => {
  await page.goto('/components/tabs/');
  await expect(page.locator('html')).toHaveAttribute('data-urushi-runtime', 'ready');
  const name = page.getByRole('textbox', { name: 'プロジェクト名' });
  await name.fill('Spring launch');
  await page.getByRole('button', { name: '残りのタスクを見る' }).click();
  await expect(page.getByRole('tab', { name: 'タスク 4' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('告知ページのレビュー', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'メンバー', exact: true }).click();
  await expect(page.locator('#project').getByRole('tabpanel')).toContainText('Alex Morgan');
  await page.getByRole('tab', { name: '概要', exact: true }).click();
  await expect(name).toHaveValue('Spring launch');
  await expect(page.locator('#project').getByRole('tabpanel')).toHaveCount(1);
});

test('export notice updates in place, undoes the result and retries a failure', async ({ page }) => {
  await page.goto('/components/toast/');
  await page.getByRole('button', { name: 'ファイルを書き出す', exact: true }).click();
  const pending = page.locator('[data-slot="toast"]').filter({ hasText: 'ファイルを書き出しています' });
  await expect(pending).toBeVisible();
  const id = await pending.getAttribute('id');
  await expect(page.getByRole('progressbar', { name: '書き出しの進捗' })).toBeVisible();
  await expect(page.locator('#' + id)).toContainText('3件のファイルを書き出しました');
  await expect(page.locator('.export-file')).toContainText('書き出し済み');
  await page.locator('#' + id).getByRole('button', { name: '元に戻す', exact: true }).click();
  await expect(page.locator('.export-file')).toContainText('準備完了');
  await page.getByRole('button', { name: '失敗と再試行を試す' }).click();
  await expect(page.getByText('書き出せませんでした', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '再試行', exact: true }).click();
  await expect(page.locator('.export-file')).toContainText('書き出し済み');
  await expect(page.locator('[data-slot="toast"]')).toHaveCount(1);
});
