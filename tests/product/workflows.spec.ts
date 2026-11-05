import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { initialProjects, initialSettings } from "../../apps/studio/src/model.ts";
test.beforeEach(async({page})=>{await page.route('**/api/workspace',route=>route.fulfill({json:{projects:initialProjects,settings:initialSettings}}));await page.goto('/');await expect(page.getByRole('button',{name:'Website redesign PRJ-001',exact:true})).toBeVisible();});
test('search, empty, reset, sort, pagination and mixed selection',async({page})=>{
 const search=page.getByRole('searchbox',{name:'プロジェクトを検索'});await search.fill('no matching project');await expect(page.getByText('該当するプロジェクトがありません',{exact:true})).toBeVisible();await page.getByRole('button',{name:'絞り込みを解除',exact:true}).click();
 await page.getByRole('button',{name:'次のページ',exact:true}).click();await expect(page.getByRole('button',{name:'Search experience PRJ-010',exact:true})).toBeVisible();await page.getByRole('button',{name:'前のページ',exact:true}).click();
 await page.getByRole('checkbox',{name:'Website redesignを選択',exact:true}).check();await expect(page.getByRole('checkbox',{name:'このページを選択'})).toHaveJSProperty('indeterminate',true);
 await page.getByRole('checkbox',{name:'このページを選択'}).check();await expect(page.getByText('8件を選択中')).toBeVisible();await page.getByRole('button',{name:'選択解除',exact:true}).click();
 await page.getByRole('button',{name:'プロジェクト',exact:true}).click();await expect(page.locator('th[aria-sort="ascending"]')).toHaveText(/プロジェクト/);
});
test('combobox selection, Escape rollback, no results and IME',async({page})=>{
 await page.getByRole('button',{name:'Website redesign PRJ-001',exact:true}).click();const box=page.getByRole('combobox',{name:'担当者',exact:true});await box.fill('Kai');await box.press('ArrowDown');await box.press('Enter');await expect(box).toHaveValue('Kai Ito');
 await box.fill('Mika');await box.press('Escape');await expect(box).toHaveValue('Kai Ito');await expect(page.getByRole('dialog',{name:'プロジェクトを編集',exact:true})).toBeVisible();
 await box.fill('nothing');await expect(page.getByText('該当する担当者がいません。')).toBeVisible();await box.press('Tab');await expect(box).toHaveValue('Kai Ito');
 await box.fill('Mika');await box.press('ArrowDown');await box.dispatchEvent('keydown',{key:'Enter',isComposing:true,bubbles:true});await expect(box).toHaveAttribute('aria-expanded','true');await box.press('Escape');
 await page.getByRole('button',{name:'キャンセル',exact:true}).click();await expect(page.getByRole('button',{name:'Website redesign PRJ-001',exact:true})).toBeFocused();
});
test('calendar keyboard navigation, month boundary, nested modal restoration',async({page})=>{
 await page.getByRole('button',{name:'Website redesign PRJ-001',exact:true}).click();const trigger=page.getByRole('button',{name:'期限: 2026-11-06',exact:true});await trigger.click();const calendar=page.getByRole('dialog',{name:'期限: カレンダー',exact:true});await expect(calendar).toBeVisible();
 await expect(page.getByRole('button',{name:/2026年11月6日\s*金曜日/})).toBeFocused();await page.keyboard.press('PageDown');await expect(page.getByRole('button',{name:/2026年12月6日\s*日曜日/})).toBeFocused();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');
 await expect(calendar).not.toBeVisible();await expect(page.getByLabel('期限',{exact:true})).toHaveValue('2026-12-07');await expect(page.getByRole('button',{name:'期限: 2026-12-07',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'期限: 2026-12-07',exact:true}).click();await page.keyboard.press('Escape');await expect(calendar).not.toBeVisible();await expect(page.getByRole('dialog',{name:'プロジェクトを編集',exact:true})).toBeVisible();
});
test('command search opens editor and restores modal navigation',async({page})=>{
 await page.getByRole('button',{name:'検索・コマンド ⌘ K',exact:true}).click();const command=page.getByRole('combobox',{name:'コマンドを検索',exact:true});await command.fill('Accessibility');await command.press('Enter');await expect(page.getByRole('textbox',{name:'プロジェクト名',exact:true})).toHaveValue('Accessibility audit');await page.getByRole('button',{name:'キャンセル',exact:true}).click();
 await page.getByRole('button',{name:'検索・コマンド ⌘ K',exact:true}).click();await command.fill('no matching command');await expect(page.getByText('該当する項目がありません。')).toBeVisible();await command.press('Escape');await expect(page.getByRole('button',{name:'検索・コマンド ⌘ K',exact:true})).toBeFocused();
});
test('save failure keeps input, retry succeeds and settings persist in returned state',async({page})=>{
 let attempts=0;await page.route('**/api/projects/PRJ-001',async route=>{attempts++;if(attempts===1)await route.fulfill({status:503,json:{error:'一時的に保存できません。再試行してください。'}});else await route.fulfill({json:{projects:initialProjects.map(row=>row.id==='PRJ-001'?{...row,...route.request().postDataJSON()}:row),settings:initialSettings}});});
 await page.getByRole('button',{name:'Website redesign PRJ-001',exact:true}).click();await page.getByRole('textbox',{name:'プロジェクト名',exact:true}).fill('Updated website');await page.getByRole('button',{name:'変更を保存',exact:true}).click();await expect(page.getByRole('alert')).toHaveText('一時的に保存できません。再試行してください。');await expect(page.getByRole('textbox',{name:'プロジェクト名',exact:true})).toHaveValue('Updated website');await page.getByRole('button',{name:'変更を保存',exact:true}).click();await expect(page.getByRole('button',{name:'Updated website PRJ-001',exact:true})).toBeVisible();
 await page.route('**/api/settings',async route=>route.fulfill({json:{projects:initialProjects,settings:route.request().postDataJSON()}}));await page.getByRole('button',{name:'設定',exact:true}).click();await page.getByLabel('テーマ',{exact:true}).selectOption('dark');await page.getByRole('button',{name:'設定を保存',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('load failure and retry',async({page})=>{
 let fail=true;await page.route('**/api/workspace',route=>fail?route.fulfill({status:503,json:{error:'offline'}}):route.fulfill({json:{projects:initialProjects,settings:initialSettings}}));await page.reload();await expect(page.getByRole('alert')).toContainText('読み込みを再試行');fail=false;await page.getByRole('button',{name:'再試行',exact:true}).click();await expect(page.getByRole('button',{name:'Website redesign PRJ-001',exact:true})).toBeVisible();
});
test('create validates required name and bulk completion updates only selected rows',async({page})=>{
 let creates=0;
 await page.route('**/api/projects',async route=>{creates++;await route.fulfill({json:{projects:[{...route.request().postDataJSON(),id:'PRJ-CREATED',revision:0},...initialProjects],settings:initialSettings}});});
 await page.getByRole('button',{name:'新規プロジェクト',exact:true}).click();
 await page.getByRole('button',{name:'作成する',exact:true}).click();expect(creates).toBe(0);
 await expect(page.getByRole('textbox',{name:'プロジェクト名',exact:true})).toBeFocused();
 await page.getByRole('textbox',{name:'プロジェクト名',exact:true}).fill('New release');
 await page.getByRole('button',{name:'作成する',exact:true}).click();
 await expect(page.getByRole('button',{name:'New release PRJ-CREATED',exact:true})).toBeVisible();expect(creates).toBe(1);
 await expect(page.getByRole('button',{name:'新規プロジェクト',exact:true})).toBeFocused();
 await page.route('**/api/projects/bulk',async route=>{const payload=route.request().postDataJSON();expect(payload).toEqual({ids:['PRJ-001'],status:'done'});await route.fulfill({json:{projects:initialProjects.map(row=>row.id==='PRJ-001'?{...row,status:'done'}:row),settings:initialSettings}});});
 await page.getByRole('checkbox',{name:'Website redesignを選択',exact:true}).check();
 await page.getByRole('button',{name:'選択した項目を完了にする',exact:true}).click();
 await page.getByRole('button',{name:'完了にする',exact:true}).click();
 await expect(page.getByRole('row').filter({has:page.getByRole('button',{name:'Website redesign PRJ-001',exact:true})})).toContainText('完了');
 await expect(page.getByRole('row').filter({has:page.getByRole('button',{name:'Mobile experience PRJ-002',exact:true})})).toContainText('レビュー');
 await expect(page.getByRole('searchbox',{name:'プロジェクトを検索'})).toBeFocused();
});
test('loading announces progress and prevents create until data arrives',async({page})=>{
 let release!:()=>void;const ready=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/workspace',async route=>{await ready;await route.fulfill({json:{projects:initialProjects,settings:initialSettings}});});
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.getByRole('status').filter({hasText:'読み込み中…'})).toBeVisible();
 await expect(page.getByRole('button',{name:'新規プロジェクト',exact:true})).toBeDisabled();
 release();await expect(page.getByRole('button',{name:'新規プロジェクト',exact:true})).toBeEnabled();
});
test('inline errors focus the invalid field and dirty Escape preserves the draft',async({page})=>{
 await page.getByRole('button',{name:'新規プロジェクト',exact:true}).click();
 const name=page.getByRole('textbox',{name:'プロジェクト名',exact:true});await name.fill('   ');await page.getByRole('button',{name:'作成する',exact:true}).click();
 await expect(name).toBeFocused();await expect(name).toHaveAttribute('aria-invalid','true');await expect(page.getByText('プロジェクト名を入力してください。空白だけでは保存できません。',{exact:true})).toBeVisible();
 await name.fill('Keep this draft');await name.press('Escape');
 const confirm=page.getByRole('dialog',{name:'変更を破棄しますか？',exact:true});await expect(confirm).toBeVisible();await expect(confirm.getByRole('button',{name:'編集を続ける',exact:true})).toBeFocused();
 await confirm.getByRole('button',{name:'編集を続ける',exact:true}).click();await expect(name).toHaveValue('Keep this draft');
 await name.press('Escape');await confirm.getByRole('button',{name:'変更を破棄',exact:true}).click();await expect(page.getByRole('button',{name:'新規プロジェクト',exact:true})).toBeFocused();
});
test('pending save locks the draft and long names fit a narrow viewport',async({page})=>{
 let release!:()=>void;const ready=new Promise<void>(resolve=>{release=resolve;});
 const long='Long project name '.repeat(5);await page.route('**/api/projects/PRJ-001',async route=>{await ready;await route.fulfill({json:{projects:initialProjects.map(row=>row.id==='PRJ-001'?{...row,...route.request().postDataJSON()}:row),settings:initialSettings}});});
 await page.setViewportSize({width:390,height:430});await page.getByRole('button',{name:'Website redesign PRJ-001',exact:true}).click();const name=page.getByRole('textbox',{name:'プロジェクト名',exact:true});await name.fill(long);await page.getByRole('button',{name:'変更を保存',exact:true}).click();await expect(name).toBeDisabled();await expect(page.getByRole('button',{name:'キャンセル',exact:true})).toBeDisabled();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'プロジェクトを編集',exact:true})).toBeVisible();
 release();await expect(page.getByRole('dialog',{name:'プロジェクトを編集',exact:true})).not.toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('button',{name:long.trim()+' PRJ-001',exact:true})).toBeVisible();
});
for(const theme of ['light','dark'])test(`axe and responsive layout: ${theme}`,async({page})=>{
 // Colors transition to the new theme: measure contrast once they have settled (spinners loop forever).
 await page.evaluate(async theme=>{document.documentElement.dataset.theme=theme;await Promise.allSettled(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished));},theme);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 await page.getByRole('button',{name:'Website redesign PRJ-001',exact:true}).click();await page.locator('dialog[open]').last().evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(animation=>animation.finished));});expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 await page.getByRole('button',{name:'期限: 2026-11-06',exact:true}).click();await page.locator('dialog[open]').last().evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).map(animation=>animation.finished));});expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:'プロジェクト',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
