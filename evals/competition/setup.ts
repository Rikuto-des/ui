import { mkdir, readFile, writeFile, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const here = import.meta.dirname;
const root = resolve(here, '../..');
await mkdir(join(here, 'ui'), {recursive:true});
await mkdir(join(here, 'sources'), {recursive:true});
const sources = [];
for (const name of ['button', 'dialog', 'tabs', 'dropdown-menu', 'input', 'label', 'checkbox']) {
  const url = `https://ui.shadcn.com/r/styles/new-york-v4/${name}.json`;
  const response = await fetch(url);
  if (!response.ok) throw Error(`${url}: ${response.status}`);
  const raw = await response.text();
  const item = JSON.parse(raw);
  await writeFile(join(here, 'sources', `shadcn-${name}.json`), raw);
  for (const file of item.files) {
    if (!file.path.endsWith(`/${name}.tsx`)) continue;
    // Only the registry installation path changes. Component code is otherwise unchanged.
    await writeFile(join(here, 'ui', `${name}.tsx`), file.content.replaceAll('@/registry/new-york-v4/ui/', '@/components/ui/'));
  }
  sources.push({library:'shadcn',url,sha256:createHash('sha256').update(raw).digest('hex')});
}
for (const name of ['dialog','tabs','menu']) {
  const url = `https://base-ui.com/react/components/${name}.md`;
  const response = await fetch(url);
  if (!response.ok) throw Error(`${url}: ${response.status}`);
  const raw = await response.text();
  await writeFile(join(here,'sources',`base-${name}.md`), raw);
  sources.push({library:'base',url,sha256:createHash('sha256').update(raw).digest('hex')});
}
await mkdir(join(here,'node_modules/@urushi'),{recursive:true});
for (const name of ['react','core','packs']) {
  await symlink(join(root,'packages',name),join(here,'node_modules/@urushi',name)).catch((e)=>{if(e.code!=='EEXIST')throw e;});
}
await writeFile(join(here,'sources/manifest.json'),JSON.stringify({retrievedAt:new Date().toISOString(),sources,packages:JSON.parse(await readFile(join(here,'package.json'),'utf8')).dependencies},null,2)+'\n');
console.log('Saved official sources and exact package versions.');
