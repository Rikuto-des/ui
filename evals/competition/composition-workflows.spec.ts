import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
type Project={id:string;name:string;ownerId:string;email:string;reviewed:boolean};
const entries=JSON.parse(readFileSync(new URL('./composition-current.json',import.meta.url),'utf8')) as {id:string;stage:string;url:string;compound:boolean}[];
const editor=(page:Page)=>page.getByRole('dialog',{name:'Edit project',exact:true});
const owner=(page:Page)=>editor(page).getByRole('combobox',{name:'Owner',exact:true});
for(const entry of entries)test.describe(entry.id,()=>{
 let writes:Project[],failSave:boolean,pending:Promise<void>|undefined;
 test.beforeEach(async({page})=>{
  writes=[];failSave=false;pending=undefined;
  await page.route('**/api/projects/*',async route=>{writes.push(route.request().postDataJSON());await pending;await route.fulfill(failSave?{status:503,json:{error:'offline'}}:{json:route.request().postDataJSON()});});
  await page.route('**/api/owners?*',route=>{const q=new URL(route.request().url()).searchParams.get('q')?.toLowerCase()??'';const all=[{value:'mika',label:'Mika Sato'},{value:'kai',label:'Kai Ito'},{value:'ren',label:'Ren Aoki',disabled:true}];return route.fulfill({json:all.filter(x=>x.label.toLowerCase().includes(q))});});
  await page.goto(entry.url);await expect(page.getByRole('heading',{name:'Project settings',exact:true})).toBeVisible();
 });
 async function open(page:Page,name='Atlas'){await page.getByRole('button',{name:`Edit ${name}`,exact:true}).click();await expect(editor(page)).toBeVisible();await expect(editor(page).getByRole('textbox',{name:'Project name',exact:true})).toBeFocused();}
 async function cancel(page:Page){await editor(page).getByRole('button',{name:'Cancel',exact:true}).click();if(entry.compound){const confirmation=page.getByRole('dialog',{name:'Discard changes?',exact:true});await expect(confirmation).toBeVisible();await confirmation.getByRole('button',{name:'Discard changes',exact:true}).click();}await expect(editor(page)).not.toBeVisible();}
 test(`${entry.id} | row isolation and discard`,async({page})=>{
  await open(page);await expect(owner(page)).toHaveValue('Mika Sato');await editor(page).getByRole('textbox',{name:'Project name',exact:true}).fill('Uncommitted');await cancel(page);
  await expect(page.getByRole('button',{name:'Edit Atlas',exact:true})).toBeFocused();await open(page,'Beacon');await expect(editor(page).getByRole('textbox',{name:'Project name',exact:true})).toHaveValue('Beacon');await expect(owner(page)).toHaveValue('Kai Ito');expect(writes).toHaveLength(0);
 });
 test(`${entry.id} | tabs preserve draft and save all fields`,async({page})=>{
  await open(page);await editor(page).getByRole('textbox',{name:'Project name',exact:true}).fill('Atlas release');
  await editor(page).getByRole('tab',{name:'General',exact:true}).press('ArrowRight');await page.keyboard.press('Enter');await expect(editor(page).getByRole('tab',{name:'Notifications',exact:true})).toHaveAttribute('aria-selected','true');
  await editor(page).getByRole('textbox',{name:'Notification email',exact:true}).fill('release@example.com');await editor(page).getByRole('tab',{name:'General',exact:true}).click();
  await expect(editor(page).getByRole('textbox',{name:'Project name',exact:true})).toHaveValue('Atlas release');await expect(owner(page)).toHaveValue('Mika Sato');
  await editor(page).getByRole('button',{name:'Save changes',exact:true}).click();await expect(editor(page)).not.toBeVisible();await expect(page.getByRole('button',{name:'Edit Atlas release',exact:true})).toBeFocused();
  expect(writes).toEqual([{id:'atlas',name:'Atlas release',ownerId:'mika',email:'release@example.com',reviewed:false}]);await expect(page.getByRole('button',{name:'Edit Beacon',exact:true})).toBeVisible();await expect(page.getByText('Project saved',{exact:true})).toBeVisible();
 });
 test(`${entry.id} | combobox disabled selection and nested Escape`,async({page})=>{
  await open(page);const box=owner(page);await box.fill('Ren');await expect(page.getByRole('option',{name:'Ren Aoki',exact:true})).toHaveAttribute('aria-disabled','true');
  await box.press('Escape');await expect(box).toHaveValue('Mika Sato');await expect(editor(page)).toBeVisible();
  await box.fill('Kai');await expect(page.getByRole('option',{name:'Kai Ito',exact:true})).toBeVisible();const candidate=page.getByRole('option',{name:'Kai Ito',exact:true});const candidateId=await candidate.getAttribute('id');if(await box.getAttribute('aria-activedescendant')!==candidateId)await box.press('ArrowDown');await expect(box).toHaveAttribute('aria-activedescendant',candidateId!);await box.press('Enter');await expect(box).toHaveValue('Kai Ito');expect(writes).toHaveLength(0);
  await editor(page).getByRole('button',{name:'Save changes',exact:true}).click();await expect(editor(page)).not.toBeVisible();expect(writes[0].ownerId).toBe('kai');
 });
 test(`${entry.id} | menu keyboard action restores focus`,async({page})=>{
  const trigger=page.getByRole('button',{name:'Actions Atlas',exact:true});await trigger.press('ArrowDown');await expect(page.getByRole('menuitem',{name:'Mark reviewed',exact:true})).toBeFocused();
  await page.getByRole('menuitem',{name:'Mark reviewed',exact:true}).press('Enter');await expect(page.getByText('Reviewed',{exact:true})).toHaveCount(1);await expect(trigger).toBeFocused();await expect(page.getByRole('menu')).not.toBeVisible();expect(writes).toHaveLength(0);
 });
 test(`${entry.id} | validation pending protection and failure retry`,async({page})=>{
  await open(page);const name=editor(page).getByRole('textbox',{name:'Project name',exact:true});await name.fill('   ');await editor(page).getByRole('button',{name:'Save changes',exact:true}).click();await expect(editor(page).getByText('Enter a project name',{exact:true})).toBeVisible();expect(writes).toHaveLength(0);
  await name.fill('Retry name');await editor(page).getByRole('tab',{name:'Notifications',exact:true}).click();const email=editor(page).getByRole('textbox',{name:'Notification email',exact:true});await email.fill('invalid');await editor(page).getByRole('button',{name:'Save changes',exact:true}).click();await expect(editor(page).getByText('Enter a valid email',{exact:true})).toBeVisible();expect(writes).toHaveLength(0);await email.fill('atlas@example.com');await editor(page).getByRole('tab',{name:'General',exact:true}).click();
  let release!:()=>void;pending=new Promise<void>(resolve=>{release=resolve;});failSave=true;
  try{await editor(page).getByRole('button',{name:'Save changes',exact:true}).click();await expect.poll(()=>writes.length).toBe(1);await expect(editor(page).getByRole('button',{name:/^(Save changes|Saving(?:…|\.\.\.)?)$/})).toBeDisabled();await expect(editor(page).getByRole('button',{name:'Cancel',exact:true})).toBeDisabled();await page.keyboard.press('Escape');await expect(editor(page)).toBeVisible();await name.press('Enter');expect(writes).toHaveLength(1);}finally{release();}
  await expect(editor(page).getByText('Could not save project',{exact:true})).toBeVisible();await expect(name).toHaveValue('Retry name');pending=undefined;failSave=false;await editor(page).getByRole('button',{name:'Save changes',exact:true}).click();await expect(editor(page)).not.toBeVisible();await expect(page.getByRole('button',{name:'Edit Retry name',exact:true})).toBeFocused();expect(writes).toHaveLength(2);
 });
 test(`${entry.id} | accessibility and narrow layout`,async({page})=>{
  await page.setViewportSize({width:390,height:844});await open(page);
  await editor(page).evaluate(async el=>{await Promise.all(el.getAnimations({subtree:true}).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished));});
  const raw=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
  await test.info().attach('raw-axe',{body:JSON.stringify(raw,null,2),contentType:'application/json'});
  expect(raw.filter(v=>v.id!=='aria-hidden-focus'||!v.nodes.every(n=>/data-(radix|base-ui)-focus/.test(n.html)))).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);const bounds=await editor(page).boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(391);
 });
 if(entry.compound){
 test(`${entry.id} | a closed editor cannot deliver results into the next editor`,async({page})=>{
  let seen!:()=>void,release!:()=>void;const oldSeen=new Promise<void>(r=>{seen=r;});const held=new Promise<void>(r=>{release=r;});
  await page.route('**/api/owners?*',async route=>{const q=new URL(route.request().url()).searchParams.get('q');if(q==='former'){seen();await held;}return route.fulfill({json:q==='former'?[{value:'mika',label:'Mika Sato'}]:[{value:'kai',label:'Kai Ito'}]}).catch(()=>{});});
  try{await open(page);await owner(page).fill('former');await oldSeen;await owner(page).press('Escape');await editor(page).getByRole('button',{name:'Cancel',exact:true}).click();await expect(editor(page)).not.toBeVisible();await open(page,'Beacon');await owner(page).fill('new');await expect(page.getByRole('option',{name:'Kai Ito',exact:true})).toBeVisible();release();await page.waitForTimeout(250);await expect(page.getByRole('option',{name:'Mika Sato',exact:true})).not.toBeVisible();}finally{release();}
 });
 test(`${entry.id} | server ranking races retry and selection retention`,async({page})=>{
  let seen!:()=>void,release!:()=>void;const oldSeen=new Promise<void>(r=>{seen=r;});const held=new Promise<void>(r=>{release=r;});let failed=true,successfulRetry=false;
  await page.route('**/api/owners?*',async route=>{const q=new URL(route.request().url()).searchParams.get('q');if(q==='mi'){seen();await held;}if(q==='designer'&&failed)return route.fulfill({status:503,json:{error:'offline'}});if(q==='designer')successfulRetry=true;return route.fulfill({json:q==='mi'?[{value:'mika',label:'Mika Sato'}]:q==='designer'?[{value:'kai',label:'Kai Ito'}]:[]}).catch(()=>{});});
  await open(page);const box=owner(page);
  try{await box.fill('mi');await oldSeen;await expect(page.getByText('Loading owners',{exact:true})).toBeVisible();await box.fill('designer');await expect(page.getByText('Could not load owners',{exact:true})).toBeVisible();failed=false;await page.getByRole('button',{name:'Retry owners',exact:true}).click();await expect.poll(()=>successfulRetry).toBe(true);await box.fill('designer');await box.press('ArrowDown');await expect(page.getByRole('option',{name:'Kai Ito',exact:true})).toBeVisible();release();await page.waitForTimeout(250);await expect(page.getByRole('option',{name:'Mika Sato',exact:true})).not.toBeVisible();await page.getByRole('option',{name:'Kai Ito',exact:true}).click();await expect(box).toHaveValue('Kai Ito');await box.fill('missing');await expect(page.getByText('No owners found',{exact:true})).toBeVisible();await box.press('Escape');await expect(box).toHaveValue('Kai Ito');}finally{release();}
 });
 test(`${entry.id} | dirty confirmation preserves tabs and isolates Escape`,async({page})=>{
  await open(page);await editor(page).getByRole('tab',{name:'Notifications',exact:true}).click();await editor(page).getByRole('textbox',{name:'Notification email',exact:true}).fill('draft@example.com');await editor(page).getByRole('button',{name:'Cancel',exact:true}).click();
  const confirm=page.getByRole('dialog',{name:'Discard changes?',exact:true});await expect(confirm).toBeVisible();await expect(confirm.getByRole('button',{name:'Keep editing',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(confirm).not.toBeVisible();await expect(editor(page)).toBeVisible();await expect(editor(page).getByRole('button',{name:'Cancel',exact:true})).toBeFocused();await expect(editor(page).getByRole('textbox',{name:'Notification email',exact:true})).toHaveValue('draft@example.com');
  await page.keyboard.press('Escape');await expect(confirm).toBeVisible();await confirm.getByRole('button',{name:'Discard changes',exact:true}).click();await expect(editor(page)).not.toBeVisible();await expect(page.getByRole('button',{name:'Edit Atlas',exact:true})).toBeFocused();expect(writes).toHaveLength(0);await open(page);await expect(editor(page).getByRole('tab',{name:'General',exact:true})).toHaveAttribute('aria-selected','true');await editor(page).getByRole('tab',{name:'Notifications',exact:true}).click();await expect(editor(page).getByRole('textbox',{name:'Notification email',exact:true})).toHaveValue('atlas@example.com');
 });
 }
});
