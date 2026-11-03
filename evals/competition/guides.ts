import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { context } from '../../packages/cli/src/catalog.ts';
const here = import.meta.dirname;
const root = resolve(here,'../..');
export type Library = 'urushi'|'base'|'radix'|'shadcn';
export const examples = {
  urushi: {
    dialog: `import { Dialog, Button } from "@urushi/react";
<Dialog.Trigger dialog="confirm">Open</Dialog.Trigger>
<Dialog id="confirm" title="Title" description="Description"><Dialog.Actions><Dialog.Close dialog="confirm" autoFocus>Cancel</Dialog.Close><Button>Action</Button></Dialog.Actions></Dialog>
Native modal dialog. Trigger uses command="show-modal". Close uses command="close". Root accepts native dialog props/ref/onClose/onCancel, but not open/onOpenChange. dismissible="any" | "closerequest" | "none". Imperative ref.current.close() is available for async completion. Browser command handlers can be cancelled via preventDefault on click.`,
    tabs: `import { Tabs, Input, Button } from "@urushi/react";
<Tabs id="account" label="Account sections" defaultValue="profile"><Tabs.List><Tabs.Tab value="profile">Profile</Tabs.Tab><Tabs.Tab value="security">Security</Tabs.Tab></Tabs.List><Tabs.Panel value="profile">Profile</Tabs.Panel><Tabs.Panel value="security">Security</Tabs.Panel></Tabs>
Tabs.List and Tabs.Panel are direct children of Tabs. Tabs.Tab is a direct child of Tabs.List. Native disabled prop is supported. Runtime handles arrows/selection. Panels remain mounted.`,
    menu: `import { Menu, Button } from "@urushi/react";
<Menu.Trigger menu="actions">Actions</Menu.Trigger><Menu id="actions" label="Task actions"><Menu.Item disabled>Rename</Menu.Item><Menu.Item onClick={()=>{}}>Archive</Menu.Item></Menu>
Native popover menu; runtime handles arrows, focus and item dismissal. Menu.Item accepts native button props and onClick, not onSelect. Give every menu a unique id.`,
  },
  base: {
    dialog: `import { Dialog } from "@base-ui/react/dialog";
<Dialog.Root><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop className="backdrop"/><Dialog.Popup className="modal"><Dialog.Title>Title</Dialog.Title><Dialog.Description>Description</Dialog.Description><Dialog.Close>Cancel</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>
Root supports open/defaultOpen/onOpenChange(open,eventDetails). eventDetails.cancel() can cancel a dismissal. Popup initialFocus accepts a ref or (interactionType)=>element|boolean, finalFocus controls return focus. disablePointerDismissal on Root prevents backdrop dismissal. Close is a button. Use ordinary HTML buttons/inputs for controls.`,
    tabs: `import { Tabs } from "@base-ui/react/tabs";
<Tabs.Root defaultValue="profile"><Tabs.List aria-label="Account sections"><Tabs.Tab value="profile">Profile</Tabs.Tab><Tabs.Tab value="security">Security</Tabs.Tab></Tabs.List><Tabs.Panel value="profile">Profile</Tabs.Panel><Tabs.Panel value="security">Security</Tabs.Panel></Tabs.Root>
Root supports value/onValueChange(value,eventDetails), defaultValue, orientation. Tab disabled is supported. List activateOnFocus activates while arrowing. Panel keepMounted preserves DOM; hidden panels need [hidden]{display:none}. Use controlled React state to preserve input values across unmounts.`,
    menu: `import { Menu } from "@base-ui/react/menu";
<Menu.Root><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup className="menu"><Menu.Item disabled>Rename</Menu.Item><Menu.Item onClick={()=>{}}>Archive</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>
Root supports open/defaultOpen/onOpenChange. Item disabled and onClick are supported; closeOnClick defaults true. Use ordinary HTML buttons/inputs for controls.`,
  },
  radix: {
    dialog: `import { Dialog } from "radix-ui";
<Dialog.Root><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="backdrop"/><Dialog.Content className="modal"><Dialog.Title>Title</Dialog.Title><Dialog.Description>Description</Dialog.Description><Dialog.Close>Cancel</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
Root supports open/defaultOpen/onOpenChange(boolean), modal=true. Content onOpenAutoFocus/onCloseAutoFocus can preventDefault then focus a ref. onEscapeKeyDown and onPointerDownOutside/onInteractOutside can preventDefault. Parts support asChild for composition. Use ordinary HTML buttons/inputs.`,
    tabs: `import { Tabs } from "radix-ui";
<Tabs.Root defaultValue="profile"><Tabs.List aria-label="Account sections"><Tabs.Trigger value="profile">Profile</Tabs.Trigger><Tabs.Trigger value="security">Security</Tabs.Trigger></Tabs.List><Tabs.Content value="profile">Profile</Tabs.Content><Tabs.Content value="security">Security</Tabs.Content></Tabs.Root>
Root supports value/onValueChange(string), defaultValue, activationMode="automatic"|"manual" (automatic default). Trigger disabled supported. Content forceMount optional; normally inactive panels unmount. Store input values in React state to preserve them.`,
    menu: `import { DropdownMenu } from "radix-ui";
<DropdownMenu.Root><DropdownMenu.Trigger>Actions</DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="menu"><DropdownMenu.Item disabled>Rename</DropdownMenu.Item><DropdownMenu.Item onSelect={()=>{}}>Archive</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
Root supports open/defaultOpen/onOpenChange. Item onSelect and disabled supported; onSelect event.preventDefault() keeps menu open. Trigger supports asChild.`,
  },
  shadcn: {
    dialog: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
<Dialog><DialogTrigger asChild><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle><DialogDescription>Description</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button>Cancel</Button></DialogClose></DialogFooter></DialogContent></Dialog>
These official new-york-v4 registry components wrap Radix Dialog. Dialog supports open/defaultOpen/onOpenChange. DialogContent supports showCloseButton=false, onOpenAutoFocus/onCloseAutoFocus/onEscapeKeyDown/onPointerDownOutside/onInteractOutside with preventDefault.`,
    tabs: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
<Tabs defaultValue="profile"><TabsList aria-label="Account sections"><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList><TabsContent value="profile">Profile</TabsContent><TabsContent value="security">Security</TabsContent></Tabs>
These official registry components wrap Radix Tabs. Tabs supports value/onValueChange(string), defaultValue, activationMode="automatic"|"manual". TabsTrigger disabled supported. Inactive content normally unmounts: preserve input state in React.`,
    menu: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
<DropdownMenu><DropdownMenuTrigger>Actions</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem disabled>Rename</DropdownMenuItem><DropdownMenuItem onSelect={()=>{}}>Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
Official new-york-v4 registry components wrap Radix DropdownMenu. DropdownMenu supports open/defaultOpen/onOpenChange. DropdownMenuItem onSelect and disabled supported.`,
  },
};
export async function guide(library:Library, task: keyof typeof examples.urushi) {
  let extra = '';
  if (library==='urushi') {
    const value=context([task,'button','input']);
    const formatted=JSON.stringify(value,null,2);
    return formatted.length<=30000?formatted:JSON.stringify(value);
  } else if (library==='shadcn') {
    extra = '\nInstalled official wrapper source:\n'+await readFile(join(here,'ui',task==='menu'?'dropdown-menu.tsx':task+'.tsx'),'utf8');
  } else if (library==='base') {
    const docs = await readFile(join(here,'sources',`base-${task}.md`),'utf8');
    const api = docs.indexOf('## API reference');
    extra = '\nOfficial API reference:\n'+(api>=0?docs.slice(api):docs.slice(-22000));
  } else {
    const name=task==='menu'?'dropdown-menu':task;
    extra='\nInstalled official types:\n'+await readFile(join(here,`node_modules/.pnpm/node_modules/@radix-ui/react-${name}/dist/index.d.ts`),'utf8');
  }
  return (examples[library][task] + '\n' + extra).slice(0,30000);
}
