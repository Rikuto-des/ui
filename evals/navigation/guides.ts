import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {context} from '../../packages/cli/src/catalog.ts';
export type Library='urushi'|'base'|'radix'|'shadcn';
const here=import.meta.dirname;
export async function guide(library:Library,_task:string){
  if(library==='urushi')return JSON.stringify(context(['navigation-menu'],{compact:true}));
  if(library==='shadcn')return 'Official new-york-v4 Navigation Menu (Radix edition), installed unchanged except import paths. Use aria-label on root, active on Link. Root supports value/onValueChange, viewport=false optional. Source:\n'+await readFile(join(here,'ui/navigation-menu.tsx'),'utf8');
  if(library==='base'){
    const doc=await readFile(join(here,'sources/base-navigation-menu.md'),'utf8');
    return `import {NavigationMenu} from '@base-ui/react/navigation-menu';\nUse Root > List > Item > Trigger + Content, followed by Portal > Positioner > Popup > Viewport. Link is an anchor, supports active. Give Root aria-label. Official demo and API:\n`+doc.slice(0,doc.indexOf('function CaretDownIcon'))+'\n'+doc.slice(doc.indexOf('## API reference'));
  }
  return `import {NavigationMenu} from 'radix-ui';\n<NavigationMenu.Root aria-label="Main"><NavigationMenu.List className="nav-list"><NavigationMenu.Item value="learn"><NavigationMenu.Trigger>Learn</NavigationMenu.Trigger><NavigationMenu.Content className="nav-panel"><NavigationMenu.Link href="#intro" active>Intro</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item><NavigationMenu.Item><NavigationMenu.Link href="#about">About</NavigationMenu.Link></NavigationMenu.Item></NavigationMenu.List></NavigationMenu.Root>\nViewport is optional. Root accepts value/onValueChange, delayDuration, dir. Link accepts active, href, onSelect, asChild. Official installed types:\n`+await readFile(join(here,'node_modules/.pnpm/node_modules/@radix-ui/react-navigation-menu/dist/index.d.ts'),'utf8');
}
