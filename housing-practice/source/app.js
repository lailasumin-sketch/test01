import {columns,readHousingCSV,filterHousing} from './data.js';
const $=selector=>document.querySelector(selector);
const initialCSV=JSON.parse($('#embedded-csv').textContent);
let dataset=readHousingCSV(initialCSV);
let active={area:'',maxRent:null,maxDeposit:null};
let visible=12;
let uploadSequence=0;
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
const money=value=>value===null?'정보 없음':`${value.toLocaleString('ko-KR',{maximumFractionDigits:10})}만 원`;
const text=value=>value===null?'정보 없음':value;
function resetInputs(){
 $('#housing-form').reset();active={area:'',maxRent:null,maxDeposit:null};visible=12;
}
function renderSource(filename){
 $('#filename').textContent=filename;
 $('#row-count').textContent=`${dataset.records.length.toLocaleString()}건`;
 const tr=$('#empty-counts');tr.replaceChildren();
 const th=node('th','빈값 수');th.scope='row';tr.append(th);
 columns.forEach(c=>tr.append(node('td',`${dataset.emptyCounts[c]}개`)));
 $('#extra-columns').hidden=!dataset.ignoredHeaders.length;
 $('#extra-columns').textContent=`추가 열은 검색에 사용하지 않습니다: ${dataset.ignoredHeaders.join(', ')}`;
 const select=$('#area');select.replaceChildren();
 const all=node('option','모든 읍·면');all.value='';select.append(all);
 const places=[...new Set(dataset.records.map(r=>r['읍면']))].sort((a,b)=>(a??'').localeCompare(b??'','ko'));
 places.forEach(area=>{const option=node('option',text(area));option.value=JSON.stringify(area);select.append(option);});
}
function showDetail(record){
 $('#detail-title').textContent=text(record['주택명']);
 $('#detail-fields').replaceChildren();
 for(const column of columns){
  const row=node('div');row.append(node('dt',column),node('dd',column.endsWith('_만원')?money(record[column]):text(record[column])));
  $('#detail-fields').append(row);
 }
 $('#detail').showModal();
}
function renderResults(){
 const matches=filterHousing(dataset.records,active);
 $('#result-status').textContent=`전체 ${dataset.records.length.toLocaleString()}건 중 ${matches.length.toLocaleString()}건`;
 $('#active-filters').textContent=[`지역: ${active.area===''?'전체':text(active.area)}`,`월세: ${active.maxRent===null?'제한 없음':money(active.maxRent)+' 이하'}`,`보증금: ${active.maxDeposit===null?'제한 없음':money(active.maxDeposit)+' 이하'}`].join(' / ');
 const container=$('#results');container.replaceChildren();
 if(!matches.length){
  const empty=node('div',undefined,'empty');
  empty.append(node('h3',dataset.records.length?'조건에 맞는 주거 정보가 없어요':'파일에 자료가 없습니다'),node('p',dataset.records.length?'상한 금액을 높이거나 지역 선택을 바꿔 보세요. 금액이 없는 자료는 해당 금액 상한 검색에서 제외됩니다.':'머리글 아래에 자료를 입력한 CSV 파일을 불러와 주세요.'));
  const reset=node('button','검색 조건 초기화','primary');reset.type='button';reset.onclick=resetSearch;empty.append(reset);container.append(empty);
 }else{
  matches.slice(0,visible).forEach(record=>{
   const card=node('article',undefined,'card');
   card.append(node('span',text(record['읍면']),'card-area'),node('h3',text(record['주택명'])));
   const dl=node('dl');
   for(const [label,key] of [['월세','월세_만원'],['보증금','보증금_만원']]){
    const pair=node('div');pair.append(node('dt',label),node('dd',money(record[key])));dl.append(pair);
   }
   card.append(dl);
   const bottom=node('div',undefined,'card-bottom');
   const button=node('button','상세보기 ↗','detail-button');button.type='button';
   button.setAttribute('aria-label',`${text(record['읍면'])} ${text(record['주택명'])} 상세보기`);
   button.onclick=()=>showDetail(record);
   bottom.append(node('span','가상데이터 · 실제 매물 아님'),button);card.append(bottom);container.append(card);
  });
  if(matches.length>visible){
   const more=node('button',`더 보기 (${Math.min(visible,matches.length)} / ${matches.length})`,'primary');more.id='load-more';more.type='button';more.onclick=()=>{visible+=12;renderResults();};container.append(more);
  }
 }
}
function resetSearch(){resetInputs();renderResults();}
function applySearch(event){
 if(event)event.preventDefault();
 if(!$('#housing-form').reportValidity())return;
 const amount=id=>$(id).value===''?null:Number($(id).value);
 active={area:$('#area').value===''?'':JSON.parse($('#area').value),maxRent:amount('#rent'),maxDeposit:amount('#deposit')};
 visible=12;renderResults();
}
function setError(message){$('#file-error').hidden=!message;$('#file-error').textContent=message;}
$('#housing-form').addEventListener('submit',applySearch);
$('#reset').onclick=resetSearch;
$('#example-budget').onclick=()=>{resetInputs();$('#rent').value='45';applySearch();};
$('#example-empty').onclick=()=>{
 resetInputs();
 const areaOption=[...$('#area').options].find(o=>o.value===JSON.stringify('안계면'));
 if(!areaOption){setError('현재 파일에는 안계면 자료가 없습니다. 기본 파일로 돌아가면 이 예시를 연습할 수 있습니다.');return;}
 $('#area').value=areaOption.value;$('#rent').value='30';applySearch();
};
$('#close-detail').onclick=()=>$('#detail').close();
$('#detail').addEventListener('click',e=>{
 if(e.target!==$('#detail'))return;
 const r=e.target.getBoundingClientRect();
 if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();
});
$('#csv-file').addEventListener('change',async e=>{
 const sequence=++uploadSequence;
 const file=e.target.files[0];if(!file)return;
 try{
  if(!/\.csv$/i.test(file.name))throw new Error('CSV 파일을 선택해 주세요. 엑셀 파일은 ‘CSV UTF-8’로 저장한 뒤 불러오세요.');
  if(file.size>5*1024*1024)throw new Error('5MB 이하의 CSV 파일을 선택해 주세요.');
  let content;
  try{content=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}
  catch{throw new Error('UTF-8 파일을 읽을 수 없습니다. 엑셀에서 ‘CSV UTF-8’로 저장한 뒤 다시 선택해 주세요.');}
  if(sequence!==uploadSequence)return;
  const parsed=readHousingCSV(content);
  if(parsed.records.length>10000)throw new Error('연습용 서비스는 자료 10,000건까지 지원합니다.');
  dataset=parsed;resetInputs();renderSource(file.name);renderResults();setError('');
 }catch(error){
  if(sequence===uploadSequence)setError(`${error.message} 기존 파일과 검색 결과는 유지됩니다.`);
 }finally{if(sequence===uploadSequence)$('#csv-file').value='';}
});
$('#restore').onclick=()=>{
 uploadSequence++;dataset=readHousingCSV(initialCSV);resetInputs();$('#csv-file').value='';setError('');renderSource('주거연습.csv');renderResults();
};
renderSource('주거연습.csv');renderResults();
