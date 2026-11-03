import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{await page.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.fulfill({status:200,contentType:'text/css',body:''}));});

async function open(page: Page, path: string) {
 await page.goto(path);
 await expect(page.locator('.demo-interaction-boundary')).toHaveAttribute('data-ready', 'true');
}

test('file previews remove native attachments and textarea gives usable feedback',async({page})=>{
 await open(page, '/components/file-input/');await page.getByRole('button',{name:'見本のファイルで試す',exact:true}).click();await expect(page.locator('[data-slot="file-input-item"]')).toHaveCount(2);
 await page.getByRole('button',{name:'取り除く: moodboard.svg',exact:true}).click();await expect.poll(()=>page.locator('#study-attachments').evaluate((input:HTMLInputElement)=>Array.from(input.files??[]).map(file=>file.name))).toEqual(['project-notes.txt']);
 await page.getByRole('button',{name:'選択をリセット',exact:true}).click();await expect(page.locator('[data-slot="file-input-list"]')).toBeHidden();
 await open(page, '/components/textarea/');await page.getByRole('button',{name:'見本を入れる',exact:true}).click();await expect(page.locator('[data-slot="textarea-count"]')).not.toHaveText('0 / 160');await page.getByRole('button',{name:'メモを確定',exact:true}).click();await expect(page.getByText('このページのメモに反映しました。',{exact:true})).toBeVisible();
});

test('segmented and card selections change the actual preview',async({page})=>{
 await open(page, '/components/toggle-group/');await page.getByRole('radio',{name:'グリッド',exact:true}).check();await expect(page.locator('.view-study-notes')).toHaveAttribute('data-view','grid');await page.getByRole('radio',{name:'グリッド',exact:true}).press('ArrowRight');await expect(page.locator('.view-study-notes')).toHaveAttribute('data-view','compact');
 await open(page, '/components/radio-group/');await page.getByRole('radio',{name:'自分だけ',exact:true}).check();await expect(page.locator('.audience-preview')).toHaveAttribute('data-scope','private');await expect(page.getByText('自分だけが閲覧できます',{exact:true})).toBeVisible();
});

test('disclosure headers retain and summarize live settings',async({page})=>{
 await open(page, '/components/accordion/');await page.getByRole('textbox',{name:'プロジェクト名',exact:true}).fill('New ideas');await page.locator('summary').filter({hasText:'02　共有する相手'}).click();await page.getByRole('radio',{name:'自分だけ',exact:true}).check();await page.locator('summary').filter({hasText:'01　基本情報'}).click();await expect(page.getByRole('textbox',{name:'プロジェクト名',exact:true})).toHaveValue('New ideas');await expect(page.locator('summary').filter({hasText:'02　共有する相手'})).toContainText('自分だけ');
 await open(page, '/components/collapsible/');await page.locator('.example summary').click();await page.getByRole('checkbox',{name:'メタデータを含める',exact:true}).check();await page.getByRole('slider',{name:'画質',exact:true}).press('ArrowRight');await page.locator('.example summary').click();await expect(page.locator('.example summary')).toContainText('画質 90%・メタデータを含める');
});

test('progress pauses and resumes, while meter responds to the selected quality',async({page})=>{
 await open(page, '/components/progress/');await page.getByRole('button',{name:'書き出しを試す',exact:true}).click();await expect.poll(()=>page.getByRole('progressbar',{name:'ノートの書き出し',exact:true}).evaluate((el:HTMLProgressElement)=>el.value)).toBeGreaterThan(0);await page.getByRole('button',{name:'一時停止',exact:true}).click();const value=await page.getByRole('progressbar',{name:'ノートの書き出し',exact:true}).evaluate((el:HTMLProgressElement)=>el.value);await expect(page.getByText('一時停止中です。進捗は保持しています。',{exact:true})).toBeVisible();await page.waitForTimeout(900);await expect(page.getByRole('progressbar',{name:'ノートの書き出し',exact:true})).toHaveJSProperty('value',value);await page.getByRole('button',{name:'続きから再開',exact:true}).press('Enter');await expect(page.getByText('6ページの準備ができました。',{exact:true})).toBeVisible({timeout:7000});await expect(page.getByRole('button',{name:'完了',exact:true})).toHaveAttribute('aria-disabled','true');await expect(page.getByRole('button',{name:'完了',exact:true})).toBeFocused();
 await open(page, '/components/meter/');await page.getByRole('radio',{name:'元の画質',exact:true}).check();await expect(page.getByRole('meter',{name:'使用容量',exact:true})).toHaveJSProperty('value',9.2);await expect(page.locator('.capacity-study strong')).toHaveText('0.8 GB');
});

test('steps retain input on backtracking and put focus on the next question',async({page})=>{
 await open(page, '/components/steps/');await page.getByRole('textbox',{name:'プロジェクト名',exact:false}).fill('Fresh journal');await page.getByRole('button',{name:'次へ',exact:true}).click();await expect(page.getByRole('heading',{name:'2. 共有',exact:true})).toBeFocused();await page.getByRole('radio',{name:'自分だけ',exact:true}).check();await page.getByRole('button',{name:'前に戻る',exact:true}).click();await expect(page.getByRole('textbox',{name:'プロジェクト名',exact:false})).toHaveValue('Fresh journal');await page.getByRole('button',{name:'次へ',exact:true}).click();await expect(page.getByRole('radio',{name:'自分だけ',exact:true})).toBeChecked();await page.getByRole('button',{name:'次へ',exact:true}).click();await page.getByRole('button',{name:'この内容で確定',exact:true}).click();await expect(page.getByText('「Fresh journal」を自分だけで始める準備ができました。',{exact:true})).toBeVisible();
});

test('empty, alert and toggle examples lead to real visible changes',async({page})=>{
 await open(page, '/components/empty/');await page.getByRole('button',{name:'見本を使う',exact:true}).click();await expect(page.locator('.note-study-list li')).toHaveCount(2);await page.getByRole('textbox',{name:'ノートを検索',exact:true}).fill('見つからない');await page.getByRole('button',{name:'検索を解除',exact:true}).click();await expect(page.locator('.note-study-list li')).toHaveCount(2);
 await open(page, '/components/alert/');await page.getByRole('button',{name:'もう一度試す',exact:true}).press('Enter');await expect(page.getByText('接続が戻りました',{exact:true})).toBeVisible();await expect(page.locator('.alert-study-scene')).toHaveAttribute('data-connected','true');await expect(page.getByRole('button',{name:'もう一度試す前に戻す',exact:true})).toBeFocused();
 await open(page, '/components/toggle/');await page.getByRole('checkbox',{name:'太字',exact:true}).check();await page.getByRole('checkbox',{name:'ハイライト',exact:true}).check();await expect(page.locator('.format-study > span')).toHaveCSS('font-weight','650');await expect(page.locator('.format-study > span')).toHaveAttribute('data-highlight','true');
});

test('all twelve studies fit mobile and desktop with accessible light and dark themes',async({page})=>{
 test.setTimeout(180000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,1280]) for(const theme of ['light','dark']) for(const slug of ['textarea','file-input','radio-group','toggle-group','accordion','collapsible','progress','meter','steps','empty','alert','toggle']) {
  await page.setViewportSize({width,height:900});await open(page, `/components/${slug}/`);await page.getByRole('combobox',{name:'テーマ',exact:true}).selectOption(theme);
  if(slug==='file-input')await page.getByRole('button',{name:'見本のファイルで試す',exact:true}).click();
  if(slug==='toggle-group')await page.getByRole('radio',{name:'グリッド',exact:true}).check();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.waitForFunction(()=>document.getAnimations().every(animation=>animation.playState!=='running'||animation.effect?.getTiming().iterations===Infinity||!((animation.effect as KeyframeEffect)?.target as Element)?.checkVisibility()));
  const {violations}=await new AxeBuilder({page}).include('.example').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),`${slug}/${width}/${theme}`).toEqual([]);
 }
});
