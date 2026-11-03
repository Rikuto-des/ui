import {describe,it} from 'node:test';
import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import {noDeferredEventCurrentTarget} from '../src/deferred-event.ts';
RuleTester.describe=describe;RuleTester.it=it;RuleTester.itOnly=it.only;
const tester=new RuleTester({languageOptions:{parser:tseslint.parser,parserOptions:{ecmaFeatures:{jsx:true}}}});
tester.run('capture React event values before deferred state updates',noDeferredEventCurrentTarget,{
 valid:[
  `import {useState} from 'react';function App(){const [draft,setDraft]=useState({});return <input onChange={e=>{const value=e.currentTarget.value;setDraft(p=>({...p,value}));}}/>;}`,
  `import {useState} from 'react';function App(){const [draft,setDraft]=useState('');return <input onChange={e=>setDraft(e.currentTarget.value)}/>;}`,
  `import {useState} from 'react';function App(){const [draft,setDraft]=useState('');return <input onChange={e=>{const value=[1].map(()=>e.currentTarget.value);setDraft(value);}}/>;}`,
  `function App({setDraft}){return <input onChange={e=>setDraft(p=>({...p,value:e.currentTarget.value}))}/>;}`,
  `import {useState} from 'other';function App(){const [draft,setDraft]=useState('');return <input onChange={e=>setDraft(p=>({...p,value:e.currentTarget.value}))}/>;}`,
  `import {useState} from 'react';function App(){const [draft,setDraft]=useState('');return <input onChange={e=>{function local(setDraft){setDraft(p=>({...p,value:e.currentTarget.value}));}}}/>;}`,
  `import {useState} from 'react';function App(){const [draft,setDraft]=useState('');return <input onChange={e=>setDraft(e=>({value:e.currentTarget.value}))}/>;}`,
 ],
 invalid:[
  {code:`import {useState} from 'react';function App(){const [draft,setDraft]=useState({});return <input onChange={event=>setDraft(current=>({...current,value:event.currentTarget.value}))}/>;}`,errors:[{messageId:'deferred'}]},
  {code:`import {useState as state} from 'react';function App(){const [draft,update]=state({});return <input onChange={e=>update(function(previous){return {...previous,checked:e.currentTarget.checked};})}/>;}`,errors:[{messageId:'deferred'}]},
  {code:`import * as React from 'react';function App(){const [draft,update]=React.useState({});return <input onChange={e=>update(previous=>({...previous,value:e.currentTarget.value}))}/>;}`,errors:[{messageId:'deferred'}]},
  {code:`import React from 'react';function App(){const [draft,update]=React.useState({});return <input onChange={(e:React.ChangeEvent<HTMLInputElement>)=>update(previous=>({...previous,value:e.currentTarget.value}))}/>;}`,errors:[{messageId:'deferred'}]},
 ],
});
