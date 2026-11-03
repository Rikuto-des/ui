import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {resolve} from 'node:path';

test.beforeEach(async({page})=>{
 const result=await build({stdin:{resolveDir:resolve('.'),loader:'tsx',contents:`
 import React,{useLayoutEffect,useRef,useState}from'react';import{createRoot}from'react-dom/client';import{Dialog}from'./packages/react/src/dialog.tsx';import{installDialogInvokers}from'./packages/core/src/dialog.ts';
 const uninstall=installDialogInvokers();
 function Editor({remove}){const ref=useRef(null),nested=useRef(null);useLayoutEffect(()=>{ref.current.showModal();},[]);return <Dialog ref={ref} id="editor" title="Editor" initialFocus="name" returnFocus="edit"><button>First control</button><label>Name<input id="name" autoFocus/></label><button id="cancel" onClick={()=>nested.current.showModal()}>Confirm</button><button onClick={()=>ref.current.close()}>Close</button><button onClick={remove}>Remove</button><button onClick={()=>{ref.current.close();document.getElementById('next').showModal();}}>Next dialog</button><Dialog ref={nested} id="confirm" title="Confirm" initialFocus="safe" returnFocus="cancel"><button>Danger</button><button id="safe" onClick={()=>nested.current.close()}>Keep</button></Dialog></Dialog>;}
 function App(){const [mounted,setMounted]=useState(false);return <main><button id="edit" onClick={()=>setMounted(true)}>Edit</button>{mounted&&<Editor remove={()=>setMounted(false)}/>}<Dialog id="next" title="Next" initialFocus="next-input"><label>Next name<input id="next-input"/></label></Dialog><button onClick={uninstall}>Uninstall</button><button onClick={()=>document.getElementById('outside-target').showModal()}>Open invalid target</button><Dialog id="outside-target" title="Invalid target" initialFocus="edit"><button>Inside</button></Dialog></main>;}createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,format:'esm',write:false,logLevel:'silent'});
 await page.route('**/dialog-focus-test',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><title>Dialog focus</title><body><div id="root"></div><script type="module" src="/dialog-focus.js"></script></body></html>'}));
 await page.route('**/dialog-focus.js',r=>r.fulfill({contentType:'text/javascript',body:result.outputFiles[0].text}));
 await page.goto('/dialog-focus-test');
});
test('dynamic initial focus and nested close restore the specified targets',async({page})=>{
 await page.getByRole('button',{name:'Edit',exact:true}).click();await expect(page.getByRole('textbox',{name:'Name',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Confirm',exact:true}).click();await expect(page.getByRole('button',{name:'Keep',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Confirm',exact:true})).toBeFocused();await expect(page.getByRole('dialog',{name:'Editor',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.getByRole('button',{name:'Edit',exact:true})).toBeFocused();
});
test('removing an open dialog restores its surviving trigger',async({page})=>{
 await page.getByRole('button',{name:'Edit',exact:true}).click();await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.getByRole('button',{name:'Edit',exact:true})).toBeFocused();
});
test('focus targets cannot escape a modal or steal focus from the next dialog',async({page})=>{
 await page.getByRole('button',{name:'Open invalid target',exact:true}).click();await expect(page.getByRole('button',{name:'Inside',exact:true})).toBeFocused();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Edit',exact:true}).click();await page.getByRole('button',{name:'Next dialog',exact:true}).click();await expect(page.getByRole('textbox',{name:'Next name',exact:true})).toBeFocused();await expect(page.getByRole('dialog',{name:'Editor',exact:true})).not.toBeVisible();
});
