import {useRef,useState} from 'react';
import {Dialog,Button,Input,Field} from '@urushi/react';
export default function App(){
 const editor=useRef<HTMLDialogElement>(null);const nameInput=useRef<HTMLInputElement>(null);const [name,setName]=useState('Atlas'),[saved,setSaved]=useState('Atlas'),[error,setError]=useState('');
 return <main><h1>Project settings</h1><p>Saved project: {saved}</p><Button onClick={()=>{setName(saved);setError('');editor.current?.showModal();}}>Edit project</Button><Dialog ref={editor} id="edit" title="Edit project" description="Change the project name"><form noValidate onSubmit={event=>{event.preventDefault();const trimmed=name.trim();if(!trimmed){setError('Enter a project name');requestAnimationFrame(()=>nameInput.current?.focus());return;}setError('');setSaved(trimmed);editor.current?.close();}}><Field id="name" label="Project name"><Input ref={nameInput} autoFocus value={name} onChange={event=>{setName(event.target.value);if(error)setError('');}}/></Field>{error&&<p role="alert">{error}</p>}<Button type="button" onClick={()=>editor.current?.close()}>Cancel</Button><Button type="submit">Save</Button></form></Dialog></main>;
}
