/** Post-study investigation of the exact loading state behind the Sol failures. */
import {test,expect} from '@playwright/test';
for(const library of ['urushi','base'])for(let trial=1;trial<=3;trial++)for(const stage of library==='base'&&trial>1?['update','update-repair']:['update']){
 test(`${library}-${trial}-${stage}: Escape during loading preserves its parent dialog`,async({page})=>{
  let release!:()=>void,seen=false;const held=new Promise<void>(r=>release=r);
  await page.route('**/api/owners?*',async route=>{const q=new URL(route.request().url()).searchParams.get('q');if(q==='former'){seen=true;await held;}return route.fulfill({json:q==='former'?[{value:'mika',label:'Mika Sato'}]:[{value:'kai',label:'Kai Ito'}]}).catch(()=>{});});
  try{
   await page.goto(`/composition-sol-v2/${library}-settings-${trial}/${stage}/dist/`);await page.getByRole('button',{name:'Edit Atlas',exact:true}).click();const box=page.getByRole('combobox',{name:'Owner',exact:true});await box.fill('former');await expect.poll(()=>seen).toBe(true);
   await test.info().attach('loading-state',{body:JSON.stringify({expanded:await box.getAttribute('aria-expanded'),loadingVisible:await page.getByText('Loading owners',{exact:true}).isVisible()}),contentType:'application/json'});
   await expect(page.getByText('Loading owners',{exact:true})).toBeVisible();await expect(box).toHaveAttribute('aria-expanded','true');await box.press('Escape');await expect(page.getByRole('dialog',{name:'Edit project',exact:true})).toBeVisible();
  }finally{release();}
 });
}
