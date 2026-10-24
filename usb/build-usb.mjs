import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {records} from '../src/data.js';
import {parseUSBRecords} from './csv.mjs';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const target=new URL('usb-submission/dist/',root);
await mkdir(new URL('data/',target),{recursive:true});
const fields=['id','area','category','title','tag','description','rent','deposit','size','crop','level','method','season','target','kind','schedule','pay','features','source_name','source_url','sample'];
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const csv='\uFEFF'+[fields,...records.map(r=>fields.map(key=>key==='features'?r.features.join(' | '):key==='source_name'?r.source.name:key==='source_url'?r.source.url:r[key]))].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
if(parseUSBRecords(csv).length!==432)throw Error('USB CSV validation failed');
const [template,style,data,app,parser]=await Promise.all(['src/page.html','src/style.css','src/data.js','src/app.js','usb/csv.mjs'].map(read));
const strip=s=>s.replaceAll('export const ','const ').replaceAll('export function ','function ');
const shared=strip(data).replace('const records =','let records =');
const appCode=app.replace(/^import .*?;\s*/,'');
const bootstrap=`\nasync function startUSB(){
 const banner=document.getElementById('usb-status');
 try{
  const response=await fetch('./data/records.csv',{cache:'no-store'});
  if(!response.ok)throw Error('CSV HTTP '+response.status);
  records=parseUSBRecords(await response.text());
  banner.textContent='USB 오프라인 모드 · 로컬 CSV '+records.length+'건';
 }catch(error){
  banner.textContent='CSV를 읽을 수 없어 내장 가상데이터 432건으로 실행합니다. '+error.message;
  banner.classList.add('usb-warning');
 }
 ${appCode}
}\nstartUSB().catch(error=>{document.getElementById('usb-status').textContent='시작 오류: '+error.message;});`;
let html=template.replace('<link rel="stylesheet" href="/src/style.css">',()=>`<style>${style.replace(/^@import[^\n]*\n/,'')}\n.usb-status{max-width:1216px;margin:14px auto 0;padding:8px 12px;background:#edf3e7;border:1px solid #dae6cf;color:#698057;font-size:10px;line-height:1.8;border-radius:5px}.usb-warning{background:#f7efdb;color:#806f42}@media(max-width:1320px){.usb-status{margin-left:44px;margin-right:44px}}@media(max-width:700px){.usb-status{margin-left:20px;margin-right:20px}}</style>`);
html=html.replace('<main>','<p id="usb-status" class="usb-status" role="status" aria-live="polite">로컬 CSV를 불러오고 있습니다.</p><main>');
html=html.replace('<script type="module" src="/src/app.js"></script>',()=>`<script>${shared}\n${strip(parser)}\n${bootstrap}</script>`);
await writeFile(new URL('index.html',target),html);
await writeFile(new URL('data/records.csv',target),csv);
await writeFile(new URL('data/records.json',target),JSON.stringify(records,null,2));
console.log('USB dist built: same design/features; 432 local CSV records + embedded fallback.');
