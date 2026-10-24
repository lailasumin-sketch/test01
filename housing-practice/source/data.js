export const columns=['읍면','주택명','월세_만원','보증금_만원'];
export function parseCSV(text){
 text=text.replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(quoted){
   if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}
   else cell+=ch;
  }else if(ch==='"'){
   if(cell||closed)throw new Error('따옴표 위치를 확인해 주세요.');
   quoted=true;
  }else if(ch===','){row.push(cell);cell='';closed=false;}
  else if(ch==='\n'||ch==='\r'){
   if(ch==='\r'&&text[i+1]==='\n')i++;
   row.push(cell);rows.push(row);row=[];cell='';closed=false;
  }else{
   if(closed)throw new Error('닫는 따옴표 뒤에는 쉼표나 줄바꿈이 필요합니다.');
   cell+=ch;
  }
 }
 if(quoted)throw new Error('닫히지 않은 따옴표가 있습니다.');
 if(cell||row.length||closed){row.push(cell);rows.push(row);}
 return rows.filter(row=>row.some(value=>value.trim()!==''));
}
export function readHousingCSV(text){
 const rows=parseCSV(text);
 if(!rows.length)throw new Error('파일에 머리글이 없습니다.');
 const headers=rows[0].map(x=>x.trim());
 if(new Set(headers).size!==headers.length)throw new Error('열 이름이 중복되어 있습니다.');
 const missing=columns.filter(c=>!headers.includes(c));
 if(missing.length)throw new Error(`필수 열이 없습니다: ${missing.join(', ')}`);
 const indexes=columns.map(c=>headers.indexOf(c));
 const records=rows.slice(1).map((row,index)=>{
  if(row.length!==headers.length)throw new Error(`${index+2}행의 열 개수가 머리글과 다릅니다. 빈칸도 쉼표로 구분해 주세요.`);
  const record={};
  columns.forEach((column,i)=>{
   const raw=row[indexes[i]].trim();
   if(!raw){record[column]=null;return;}
   if(i<2){record[column]=raw;return;}
   if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(raw))throw new Error(`${index+2}행 ${column}: 0 이상의 숫자 또는 빈칸을 입력해 주세요. 단위는 만 원입니다.`);
   const number=Number(raw.replaceAll(',',''));
   if(!Number.isFinite(number)||number>Number.MAX_SAFE_INTEGER)throw new Error(`${index+2}행의 금액이 처리 가능한 범위를 벗어납니다.`);
   record[column]=number;
  });
  return record;
 });
 return {records,headers,ignoredHeaders:headers.filter(c=>!columns.includes(c)),emptyCounts:Object.fromEntries(columns.map(c=>[c,records.filter(r=>r[c]===null).length]))};
}
export function filterHousing(records,{area='',maxRent=null,maxDeposit=null}={}){
 return records.filter(r=>(area===''||r['읍면']===area)&&
  (maxRent===null||r['월세_만원']!==null&&r['월세_만원']<=maxRent)&&
  (maxDeposit===null||r['보증금_만원']!==null&&r['보증금_만원']<=maxDeposit));
}
