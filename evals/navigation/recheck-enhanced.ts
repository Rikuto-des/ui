import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { gzipSync } from 'node:zlib';

// Rebuild saved AI outputs with the current library. This makes no model calls.
const { values } = parseArgs({ options: { id: { type: 'string', default: 'enhanced-v2' } } });
const id = values.id!;
assert.match(id, /^[a-z0-9-]+$/);
const here = import.meta.dirname, root = resolve(here, '../..');
const sourceRun = 'measured-v3', destination = join(here, 'runs', id);
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const range = (values: number[]) => [Math.min(...values), Math.max(...values)];
const rows = await read(join(here, 'runs', sourceRun, 'results.json'));
await mkdir(destination); // Refuse to overwrite an earlier measurement.
for (const sample of rows) {
  const stage = sample['update-repair'] ? 'update-repair' : 'update';
  assert.equal(sample[stage].pass, true);
  const source = join(here, 'runs', sourceRun, sample.id, stage, 'App.tsx');
  const code = await readFile(source);
  assert.equal(hash(code), sample[stage].sourceSha256);
  const target = join(destination, sample.id, 'update');
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'App.tsx'), code);
  await writeFile(join(target, 'source.json'), JSON.stringify({ sourceRun, sourceStage: stage, sourceSha256: hash(code), modelCalls: 0, humanEdits: false }, null, 2));
}
const result = spawnSync(process.execPath, ['--import', 'tsx', join(here, 'run.ts'), '--id', id, '--libraries', 'urushi,base,radix,shadcn', '--trials', '2', '--stage', 'update', '--rescore', '--shared-css', join(here, 'runs', sourceRun, 'shared.css')], { cwd: root, stdio: 'inherit' });
assert.equal(result.status, 0, 'Recheck harness failed');
const protocolPath = join(destination, 'protocol.json');
await writeFile(protocolPath, JSON.stringify({ ...await read(protocolPath), experiment: 'Saved AI outputs rebuilt with current Urushi; competitors remain at their recorded versions.', sourceRun, modelCalls: 0, humanEdits: false }, null, 2));
const rescored = await read(join(destination, 'results.json'));
const previous = await read(join(root, 'generated/navigation-summary.json'));
const shared = await readFile(join(destination, 'shared.css'));
assert.equal(hash(shared), previous.commonCssSha256, 'Keep the common CSS byte-identical to the original measurement');
const libraries = [];
assert.equal(rescored.length, 8);
for (const library of previous.libraries) {
  const samples = [];
  for (const row of rescored.filter((r: { library: string }) => r.library === library.id)) {
    const score = row.update, folder = join(destination, row.id, 'update');
    assert.equal(score.pass, true, row.id);
    const provenance = await read(join(folder, 'source.json'));
    assert.equal(score.sourceSha256, provenance.sourceSha256);
    assert.equal(hash(await readFile(join(folder, 'App.tsx'))), provenance.sourceSha256);
    const css = await readFile(join(folder, 'dist/entry.css')).catch(() => Buffer.alloc(0));
    const cssGzip = css.length ? gzipSync(css).length : 0;
    samples.push({ id: row.id, sourceSha256: score.sourceSha256, sourceBytes: score.sourceBytes, jsGzip: score.bundleGzip, withoutReactGzip: score.withoutReactGzip, cssGzip, totalGzip: score.bundleGzip + cssGzip + gzipSync(shared).length });
  }
  assert.equal(samples.length, 2);
  libraries.push({ id: library.id, label: library.label, passed: 2, n: 2, withoutReactGzip: range(samples.map(s => s.withoutReactGzip)), cssGzip: range(samples.map(s => s.cssGzip)), totalGzip: range(samples.map(s => s.totalGzip)), sourceBytes: range(samples.map(s => s.sourceBytes)), samples });
}
const summary = {
  measuredAt: new Date().toISOString(), run: id, sourceRun, modelCalls: 0, humanEdits: false,
  commonCssGzip: gzipSync(shared).length, commonCssSha256: hash(shared),
  sameCommonCssAsOriginal: hash(shared) === previous.commonCssSha256,
  libraries,
  previousUrushi: previous.libraries.find((r: { id: string }) => r.id === 'urushi'),
  limitations: [
    'Rebuild of eight saved, previously passing AI outputs. No new generation, repair or model success-rate comparison.',
    'The common workflow suite covers keyboard, links, updates, axe and 320px. These apps do not exercise nested flyouts or hover; those have separate three-browser regression tests.',
    'Same versions, bundler settings and shared CSS for all four libraries. Full optional Urushi runtime, selected component CSS and complete Graphite pack included.',
    'Sum of gzip of each JS/CSS asset; no HTML, images, fonts or startup timing. One small scenario and two saved apps per library.',
  ],
};
await writeFile(join(destination, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
await writeFile(join(root, 'generated/navigation-enhanced-summary.json'), JSON.stringify(summary, null, 2) + '\n');
await writeFile(join(root, 'apps/site/public/evals/navigation-enhanced-summary.json'), JSON.stringify(summary, null, 2) + '\n');
const evidence: Record<string, string> = {};
await writeFile(join(destination, 'harness/recheck-enhanced.ts'), await readFile(import.meta.filename));
async function track(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await track(path);
    else if (entry.isFile() && /\.(?:tsx?|json|css|yaml)$/.test(path)) evidence[relative(destination, path)] = hash(await readFile(path));
  }
}
await track(destination);
await writeFile(join(destination, 'evidence-manifest.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), evidence }, null, 2) + '\n');
console.log(JSON.stringify({ libraries, sameCommonCssAsOriginal: summary.sameCommonCssAsOriginal, verifiedFiles: Object.keys(evidence).length }, null, 2));
