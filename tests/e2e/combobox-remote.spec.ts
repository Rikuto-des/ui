import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';

let script: string;
test.beforeAll(async () => {
  const result = await build({ stdin: { contents: `
    import React, {useState} from 'react';
    import {createRoot} from 'react-dom/client';
    import {Combobox} from './packages/react/src/combobox.tsx';
    function App(){
      const [options,setOptions]=useState([{value:'mika',label:'Mika Sato'},{value:'kai',label:'Kai Ito'}]);
      const [query,setQuery]=useState('');const [value,setValue]=useState('mika');
      return <main><h1>Remote owners</h1><form>
        <Combobox label="Owner" name="owner" required options={options} value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} filter="manual"/>
        <output aria-label="Query">{query}</output>
        <button type="button" onClick={()=>setOptions([{value:'kai',label:'Kai Ito'}])}>Replace results</button>
        <button type="button" onClick={()=>setOptions([])}>Clear results</button>
        <button type="button" onClick={()=>setValue('mika')}>Restore original</button>
        <button type="button" onClick={()=>setValue('unknown')}>Unknown value</button>
      </form></main>;
    }createRoot(document.getElementById('root')).render(<App/>);`, resolveDir: resolve('.'), loader: 'tsx' },
    bundle: true, format: 'esm', write: false, logLevel: 'silent' });
  script = result.outputFiles[0].text;
});
test.beforeEach(async ({ page }) => {
  await page.route('**/combobox-remote-test', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Remote owners</title><body><div id="root"></div><script type="module" src="/combobox-remote-test.js"></script></body></html>' }));
  await page.route('**/combobox-remote-test.js', route => route.fulfill({ contentType: 'text/javascript', body: script }));
  await page.goto('/combobox-remote-test');
});
test('committed label and validity survive replacement of remote results', async ({ page }) => {
  const box = page.getByRole('combobox', { name: 'Owner' });
  await expect(box).toHaveValue('Mika Sato');
  await page.getByRole('button', { name: 'Replace results' }).click();
  await expect(box).toHaveValue('Mika Sato');
  expect(await box.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
  await box.click();await box.press('ArrowDown');await box.press('Enter');
  await expect(box).toHaveValue('Kai Ito');
  await page.getByRole('button', { name: 'Clear results' }).click();
  await expect(box).toHaveValue('Kai Ito');
  await expect(page.locator('input[type="hidden"][name="owner"]')).toHaveValue('kai');
  await page.getByRole('button', { name: 'Restore original' }).click();
  await expect(box).toHaveValue('Mika Sato');
  await page.getByRole('button', { name: 'Unknown value' }).click();
  await expect(box).toHaveValue('');
  expect(await box.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
});
test('manual filtering exposes queries and accepts a server-ranked non-substring result', async ({ page }) => {
  const box = page.getByRole('combobox', { name: 'Owner' });
  await box.fill('designer');
  await expect(page.getByLabel('Query')).toHaveText('designer');
  await expect(page.getByRole('option', { name: 'Kai Ito' })).toBeVisible();
  await box.press('Escape');await expect(box).toHaveValue('Mika Sato');
  await box.click();await expect(page.getByLabel('Query')).toHaveText('');
  await box.fill('designer');await box.press('ArrowDown');await box.press('ArrowDown');await box.press('Enter');
  await expect(box).toHaveValue('Kai Ito');
  await expect(page.getByLabel('Query')).toHaveText('');
});
