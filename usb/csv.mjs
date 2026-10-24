// RFC-style CSV reader shared by the USB build and offline browser.
export function readUSBTable(text){
 text=text.replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
  else if(c==='"'){if(cell||closed)throw Error('CSV 따옴표 위치 오류');quoted=true;}
  else if(c===','){row.push(cell);cell='';closed=false;}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';closed=false;}
  else{if(closed)throw Error('CSV 닫는 따옴표 뒤의 문자 오류');cell+=c;}
 }
 if(quoted)throw Error('CSV 따옴표가 닫히지 않았습니다.');
 if(cell||row.length||closed){row.push(cell);rows.push(row);}
 return rows.filter(r=>r.some(c=>c.trim()));
}
export function parseUSBRecords(text){
 const rows=readUSBTable(text);if(!rows.length)throw Error('CSV 머리글 없음');
 const headers=rows.shift().map(c=>c.trim());
 if(new Set(headers).size!==headers.length)throw Error('CSV 중복 열 이름');
 const required=['id','area','category','title','tag','description','features','source_name','source_url','sample'];
 for(const name of required)if(!headers.includes(name))throw Error(`CSV 필수 열 없음: ${name}`);
 const ids=new Set();
 return rows.map((cells,i)=>{
  if(cells.length!==headers.length)throw Error(`CSV ${i+2}행 열 개수 오류`);
  const raw=Object.fromEntries(headers.map((key,j)=>[key,cells[j].trim()]));
  if(!/^[a-zA-Z0-9_-]+$/.test(raw.id)||ids.has(raw.id))throw Error(`CSV ${i+2}행 ID 오류 또는 중복`);
  ids.add(raw.id);
  if(!['home','farm','support','job'].includes(raw.category))throw Error(`CSV ${i+2}행 분야 오류`);
  if(!raw.area||!raw.title)throw Error(`CSV ${i+2}행 지역 또는 제목 없음`);
  let source;
  try{source=new URL(raw.source_url);if(source.protocol!=='https:'||source.username||source.password)throw Error();}catch{throw Error(`CSV ${i+2}행 공식 링크 오류`);}
  const r={id:raw.id,area:raw.area,category:raw.category,title:raw.title,tag:raw.tag,description:raw.description,features:raw.features?raw.features.split(' | '):[],source:{name:raw.source_name,url:source.href},sample:true};
  for(const key of ['crop','level','method','season','target','kind','schedule'])r[key]=raw[key]||'';
  for(const key of ['rent','deposit','size','pay']){
   const value=raw[key]||'';
   if(value&&!/^\d+(?:\.\d+)?$/.test(value))throw Error(`CSV ${i+2}행 ${key} 금액·수치 오류`);
   r[key]=value===''?null:Number(value);
   if(r[key]!==null&&!Number.isSafeInteger(Math.trunc(r[key])))throw Error(`CSV ${i+2}행 수치 범위 오류`);
  }
  return r;
 });
}
