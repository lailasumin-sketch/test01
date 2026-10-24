import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../housing-practice/',import.meta.url);
const read=file=>readFile(new URL(file,root),'utf8');
const [page,style,data,app,csv]=await Promise.all(['source/page.html','source/style.css','source/data.js','source/app.js','data/주거연습.csv'].map(read));
const js=data.replaceAll('export const ','const ').replaceAll('export function ','function ')+'\n'+app.replace(/^import .*?;\s*/,'');
const json=JSON.stringify(csv).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
const html=page.replace('/* INLINE_STYLE */',()=>style).replace('/* INLINE_DATA */',()=>json).replace('/* INLINE_SCRIPT */',()=>js);
await writeFile(new URL('index.html',root),html);
console.log('Built housing-practice/index.html with the provided CSV embedded; no server required.');
