import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { build } from 'esbuild';
import { resolve } from 'node:path';

test.beforeEach(async ({ page }) => {
  const bundle = await build({ stdin: { resolveDir: resolve('.'), loader: 'tsx', contents: `
import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{Checkbox,Switch}from'./packages/react/src/checkbox.tsx';import{Slider}from'./packages/react/src/slider.tsx';import{Carousel}from'./packages/react/src/carousel.tsx';import{installRuntime}from'./packages/core/src/runtime.ts';
function App(){const[value,setValue]=useState(18);const[disabled,setDisabled]=useState(false);return <main style={{maxWidth:460,padding:24}}><h1>Interaction studies</h1><Checkbox id="check">Review</Checkbox><Checkbox disabled>Locked</Checkbox><Switch showState>Focus</Switch><form><label htmlFor="volume">Type size</label><Slider id="volume" style={{maxWidth:260}} min={14} max={22} value={value} onChange={e=>setValue(Number(e.target.value))} showValue valueSuffix="px" marks={[{value:14,label:'Small'},{value:18,label:'Standard'},{value:22,label:'Large'}]}/><output id="selected">{value}</output><button type="button" onClick={()=>setValue(18)}>Restore</button><fieldset disabled={disabled}><legend>Uncontrolled</legend><label htmlFor="native">Native value</label><Slider id="native" min={10} max={95} step={10} defaultValue={40} showValue marks={[{value:20,label:'Twenty'},{value:80,label:'Eighty'}]}/></fieldset><button type="reset">Reset form</button><button type="button" onClick={()=>setDisabled(!disabled)}>Toggle disabled</button></form><Carousel label="Editions" previousLabel="Previous" nextLabel="Next">{['One','Two','Three','Four'].map(name=><Carousel.Item key={name}><div style={{height:180,padding:20}}><h2>{name}</h2><p>A card with real text.</p></div></Carousel.Item>)}</Carousel></main>};createRoot(document.getElementById('root')).render(<App/>);const cleanup=installRuntime();Object.assign(window,{cleanupRuntime:cleanup});` }, bundle: true, format: 'esm', write: false, logLevel: 'silent' });
  await page.route('**/tactile-fixture', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="en" data-pack="graphite" data-theme="light"><head><title>Interaction studies</title><link rel="stylesheet" href="/@fs${resolve('packages/react/styles/index.css')}"><link rel="stylesheet" href="/@fs${resolve('packages/packs/generated/graphite.css')}"><style>[data-slot=carousel-item]{flex-basis:86%}button{font:inherit}</style></head><body><div id="root"></div><script type="module" src="/tactile-fixture.js"></script></body></html>` }));
  await page.route('**/tactile-fixture.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle.outputFiles[0].text }));
  await page.goto('/tactile-fixture');
});

test('checkbox actually draws a stroke over time and retains native form behavior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const checkbox = page.getByRole('checkbox', { name: 'Review', exact: true });
  await checkbox.focus();
  const frame = await checkbox.evaluate((input: HTMLInputElement) => {
    const path = input.nextElementSibling!.querySelector('[data-slot="checkbox-mark"]')!;
    getComputedStyle(path).strokeDashoffset;
    input.click();
    const animation = path.getAnimations().find(a => (a as CSSTransition).transitionProperty === 'stroke-dashoffset')!;
    if (!animation) return { found: false, checked: input.checked, offset: 0, duration: 0 };
    animation.pause(); animation.currentTime = 100;
    return { found: true, checked: input.checked, offset: parseFloat(getComputedStyle(path).strokeDashoffset), duration: Number(animation.effect!.getTiming().duration) };
  });
  expect(frame.found).toBe(true); expect(frame.checked).toBe(true);
  expect(frame.duration).toBeGreaterThanOrEqual(240); expect(frame.offset).toBeGreaterThan(0); expect(frame.offset).toBeLessThan(1);
  await checkbox.press('Space'); await expect(checkbox).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Locked' })).toBeDisabled();
  await checkbox.evaluate((input: HTMLInputElement) => { input.indeterminate = true; });
  await expect.poll(() => checkbox.evaluate(input => getComputedStyle(input.nextElementSibling!.querySelector('[data-slot="checkbox-mixed"]')!).strokeDashoffset)).toBe('0px');
});

test('slider marks update controlled React values; arrows and external updates agree', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Type size' });
  const geometry = await slider.evaluate(el => ({ input: el.getBoundingClientRect().width, control: el.parentElement!.getBoundingClientRect().width }));
  expect(geometry.control).toBe(260); expect(geometry.input).toBe(260);
  await slider.press('ArrowRight'); await expect(slider).toHaveValue('19');
  await expect(page.locator('#selected')).toHaveText('19');
  await page.getByRole('button', { name: 'Large', exact: true }).click();
  await expect(slider).toHaveValue('22'); await expect(page.locator('#selected')).toHaveText('22');
  await expect(page.locator('[data-slot="slider-value"]').first()).toHaveText('22px');
  await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(slider).toHaveValue('18'); await expect(page.locator('[data-slot="slider-value"]').first()).toHaveText('18px');
  await expect(page.getByRole('button', { name: 'Standard', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('native reset and disabled fieldsets synchronize slider feedback and marks', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Native value' });
  await page.getByRole('button', { name: 'Eighty', exact: true }).click(); await expect(slider).toHaveValue('80');
  await page.getByRole('button', { name: 'Reset form' }).click(); await expect(slider).toHaveValue('40');
  await expect(page.locator('[data-slot="slider-value"]').nth(1)).toHaveText('40');
  await page.getByRole('button', { name: 'Toggle disabled' }).click();
  await expect(slider).toBeDisabled(); await expect(page.getByRole('button', { name: 'Eighty', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Toggle disabled' }).click();
  await expect(page.getByRole('button', { name: 'Twenty', exact: true })).toBeEnabled();
  await slider.press('End'); await expect(slider).toHaveValue('90');
  await expect(page.locator('[data-slot="slider-value"]').nth(1)).toHaveText('90');
});

test('carousel supports rapid navigation, direct positions, and keeps focus at an edge', async ({ page }) => {
  const carousel = page.getByRole('region', { name: 'Editions' });
  await expect(carousel).toHaveAttribute('data-enhanced', '');
  const next = carousel.getByRole('button', { name: 'Next', exact: true });
  await next.scrollIntoViewIfNeeded(); const y = await page.evaluate(() => scrollY);
  await next.click(); await next.click(); await next.click();
  await expect(carousel.getByRole('status')).toHaveText('4 / 4');
  await next.focus(); await expect(next).toBeFocused(); await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect.poll(() => carousel.locator('[data-slot="carousel-viewport"]').evaluate(el => Math.abs(el.scrollLeft) - (el.scrollWidth - el.clientWidth))).toBeGreaterThan(-3);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await carousel.getByRole('button', { name: '2 / 4', exact: true }).click();
  await expect(carousel.getByRole('status')).toHaveText('2 / 4');
  await expect(carousel.getByRole('button', { name: '2 / 4', exact: true })).toHaveAttribute('aria-current', 'true');
});

test('reduced motion, RTL keyboard navigation and runtime cleanup remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const checkbox = page.getByRole('checkbox', { name: 'Review', exact: true }); await checkbox.check();
  expect(await page.locator('[data-slot="checkbox-mark"]').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  const carousel = page.getByRole('region', { name: 'Editions' });
  await carousel.evaluate(el => el.setAttribute('dir', 'rtl'));
  const viewport = carousel.locator('[data-slot="carousel-viewport"]');
  await viewport.press('End'); await expect(carousel.getByRole('status')).toHaveText('4 / 4');
  await viewport.press('ArrowRight'); await expect(carousel.getByRole('status')).toHaveText('3 / 4');
  await viewport.press('Home'); await expect(carousel.getByRole('status')).toHaveText('1 / 4');
  await page.evaluate(() => (window as unknown as { cleanupRuntime: () => void }).cleanupRuntime());
  await expect(carousel.locator('[data-slot="carousel-controls"]')).toBeHidden();
  await page.getByRole('slider', { name: 'Type size' }).press('ArrowRight');
  await expect(page.getByRole('slider', { name: 'Type size' })).toHaveValue('19');
});

test('enhanced controls have no axe violations at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('switch', { name: 'Focus', exact: true }).check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
