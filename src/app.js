import {areas,categories,records,filterRecords,parseRequest,preferenceLabels} from './data.js';
const $=s=>document.querySelector(s);
let saved=[];
try {
 const data=JSON.parse(localStorage.getItem('uiseong-saved')||'[]');
 if(Array.isArray(data))saved=data.filter(id=>records.some(r=>r.id===id));
}catch{}
const state={area:'',category:'',query:'',savedOnly:false,saved,preferences:null};
let limit=8;
const categoryFor=id=>categories.find(c=>c.id===id);
// Never interpolate user input into HTML. Dynamic search labels use textContent.
function facts(r){
 if(r.category==='home')return [`월세 ${r.rent}만 원/월`,`보증금 ${r.deposit}만 원`,`${r.size}㎡`];
 if(r.category==='farm')return [r.crop,r.level,r.method];
 if(r.category==='support')return [`대상: ${r.target}`,r.kind];
 return [`시급 ${r.pay.toLocaleString()}원`,`${r.schedule} 근무`];
}
function render(){
 $('#area-grid').innerHTML=areas.map(area=>`<button data-area="${area}" class="${state.area===area?'selected':''}" aria-pressed="${state.area===area}">${area}</button>`).join('');
 $('.all-area').classList.toggle('selected',!state.area);
 $('.all-area').setAttribute('aria-pressed',String(!state.area));
 $('#area-title').textContent=state.area?`${state.area}에서 그려보는 새로운 일상`:'의성의 다양한 삶을 만나보세요';
 $('#area-description').textContent=state.area?`${state.area}의 주거·농산물·지원·취업 가상데이터를 확인하세요.`:'집, 농사, 정착, 일자리. 네 가지 주제로 시작하는 지역 탐색.';
 $('#category-cards').innerHTML=categories.map(c=>`<button data-category="${c.id}" class="category-card ${state.category===c.id?'chosen':''}"><span class="category-icon" style="background:${c.color}">${c.icon}</span><strong>${c.name}</strong><small>${c.description}</small><span class="category-arrow">↗</span></button>`).join('');
 $('#tabs').innerHTML=[{id:'',name:'전체'},...categories].map(c=>`<button data-category="${c.id}" class="${state.category===c.id?'selected':''}" aria-pressed="${state.category===c.id}">${c.name}</button>`).join('');
 $('#applied-preferences').hidden=!state.preferences;
 $('#preference-chips').replaceChildren();
 if(state.preferences){
  for(const label of preferenceLabels(state.preferences)){
   const chip=document.createElement('span');chip.textContent=label;$('#preference-chips').append(chip);
  }
 }
 const filtered=filterRecords(records,state);
 const summary=categories.map(c=>`${c.name} ${filtered.filter(r=>r.category===c.id).length}`).join(' · ');
 $('#result-count').textContent=`${state.area||state.preferences?.area||'의성군 전체'} · ${state.savedOnly?'관심 ':''}가상 정보 ${filtered.length}건 (${summary})`;
 $('#results').innerHTML=filtered.length?filtered.slice(0,limit).map(r=>{
  const c=categoryFor(r.category);
  return `<article class="result-card"><div class="card-top"><span class="tag" style="background:${c.color}">${c.name}</span><button data-save="${r.id}" class="save ${saved.includes(r.id)?'is-saved':''}" aria-label="${r.area} ${r.title} 관심 정보 ${saved.includes(r.id)?'해제':'저장'}" aria-pressed="${saved.includes(r.id)}">${saved.includes(r.id)?'♥':'♡'}</button></div><div class="card-location">${r.area} <span>· ${r.tag}</span></div><h3><button data-detail="${r.id}">${r.title}</button></h3><div class="record-facts">${facts(r).map(f=>`<span>${f}</span>`).join('')}</div><p>${r.description}</p><div class="card-bottom"><span>가상 · 실제 공고 아님</span><button data-detail="${r.id}" aria-label="${r.area} ${r.title} 자세히 보기">자세히 보기 ↗</button></div></article>`;
 }).join(''):'<div class="empty"><span>⌕</span><h3>조건에 맞는 정보가 없어요</h3><p>희망 금액이나 검색어를 조정해 보세요. 지역·분야 필터와 맞춤 조건이 모두 함께 적용됩니다.</p><button id="empty-reset">모든 조건 초기화</button></div>';
 $('#load-more').hidden=filtered.length<=limit;
 $('#saved-count').textContent=saved.length;
 $('#saved-toggle').setAttribute('aria-pressed',String(state.savedOnly));
 $('#saved-toggle').classList.toggle('selected',state.savedOnly);
}
function reset(){
 Object.assign(state,{area:'',category:'',query:'',savedOnly:false,preferences:null});
 $('#search').value='';clearPreferenceForm();limit=8;render();
}
function toast(message){
 $('#toast').textContent=message;$('#toast').classList.add('show');
 clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2400);
}
function clearPreferenceForm(){
 $('#preferences-form').reset();$('#request-text').value='';$('#request-status').textContent='';
}
function populatePreferences(p){
 $('#pref-area').value=p.area;
 $('#pref-rent').value=p.maxRent??'';$('#pref-deposit').value=p.maxDeposit??'';
 $('#pref-crop').value=p.crop;$('#pref-target').value=p.target;
 $('#pref-schedule').value=p.schedule;$('#pref-pay').value=p.minPay??'';
 document.querySelectorAll('[name="pref-category"]').forEach(el=>el.checked=p.categories.includes(el.value));
}
function readRequest(){
 const text=$('#request-text').value.trim();
 if(!text){$('#request-status').textContent='희망 생활을 먼저 입력해 주세요.';return;}
 const parsed=parseRequest(text);
 if(parsed.error){$('#request-status').textContent=parsed.error;return;}
 if(!parsed.recognized){$('#request-status').textContent='인식할 수 있는 조건을 찾지 못했어요. 아래 항목을 직접 선택하거나 예시 문장을 사용해 주세요.';return;}
 populatePreferences(parsed.preferences);
 $('#request-status').textContent=`가져온 조건: ${preferenceLabels(parsed.preferences).join(' / ')}. 아래 항목을 확인·수정한 뒤 ‘내 조건으로 검색하기’를 눌러 주세요. 그 외 표현은 적용되지 않았습니다.`;
}
function applyPreferences(e){
 e.preventDefault();
 const number=id=>$(id).value===''?null:Number($(id).value);
 const p={area:$('#pref-area').value,categories:[...document.querySelectorAll('[name="pref-category"]:checked')].map(el=>el.value),maxRent:number('#pref-rent'),maxDeposit:number('#pref-deposit'),crop:$('#pref-crop').value,target:$('#pref-target').value,schedule:$('#pref-schedule').value,minPay:number('#pref-pay')};
 if(!p.categories.length){
  if(p.maxRent!==null||p.maxDeposit!==null)p.categories.push('home');
  if(p.crop)p.categories.push('farm');
  if(p.target)p.categories.push('support');
  if(p.schedule||p.minPay!==null)p.categories.push('job');
 }
 const active=(id,hasValue)=>hasValue&&p.categories.length&&!p.categories.includes(id);
 if(active('home',p.maxRent!==null||p.maxDeposit!==null)||active('farm',p.crop)||active('support',p.target)||active('job',p.schedule||p.minPay!==null)){
  $('#request-status').textContent='입력한 조건의 분야가 선택에서 빠져 있어요. 해당 분야도 체크하거나 사용하지 않을 조건을 지워 주세요.';
  $('#request-status').scrollIntoView({behavior:'smooth',block:'center'});return;
 }
 Object.assign(state,{area:p.area,category:'',query:$('#pref-keyword').value.trim(),savedOnly:false,preferences:p});
 $('#search').value=state.query;limit=8;render();
 $('#request-status').textContent='맞춤 조건을 적용했어요. 결과 위에서 적용 조건을 확인할 수 있습니다.';
 $('#information').scrollIntoView({behavior:'smooth'});
}
document.addEventListener('click',e=>{
 const area=e.target.closest('[data-area]');
 if(area){
  state.area=area.dataset.area;
  if(state.preferences){state.preferences={...state.preferences,area:state.area};$('#pref-area').value=state.area;}
  limit=8;render();return;
 }
 const category=e.target.closest('[data-category]');
 if(category){
  const fromCards=Boolean(category.closest('#category-cards'));
  state.category=category.dataset.category;limit=8;render();
  if(fromCards)$('#information').scrollIntoView({behavior:'smooth'});return;
 }
 const prompt=e.target.closest('[data-prompt]');
 if(prompt){$('#request-text').value=prompt.dataset.prompt;readRequest();return;}
 const save=e.target.closest('[data-save]');
 if(save){
  const id=save.dataset.save;const existed=saved.includes(id);
  saved=existed?saved.filter(x=>x!==id):[...saved,id];state.saved=saved;
  let persisted=true;try{localStorage.setItem('uiseong-saved',JSON.stringify(saved));}catch{persisted=false;}
  render();toast(persisted?(existed?'관심 정보에서 해제했어요.':'이 브라우저에 관심 정보를 저장했어요.'):'현재 화면에 반영했어요. 저장소를 사용할 수 없어 새로고침하면 유지되지 않습니다.');return;
 }
 const detail=e.target.closest('[data-detail]');
 if(detail){
  const r=records.find(x=>x.id===detail.dataset.detail);const c=categoryFor(r.category);
  $('#detail-content').innerHTML=`<span class="pill">${r.area} · ${c.name}</span><h2>${r.title}</h2><div class="record-facts">${facts(r).map(f=>`<span>${f}</span>`).join('')}</div><p>${r.description}</p><p>특징: ${r.features.join(' · ')}${r.season?`<br>가상 재배 일정: ${r.season}`:''}</p><div class="detail-notice"><strong>모든 조건과 금액은 가상입니다.</strong><p>실제 매물·채용·지원사업이 아닙니다. 주거비·시급·지원 대상·지역 배치는 시연용이며 실제 제공 여부나 시세를 뜻하지 않습니다.</p></div><h3>다음 단계</h3><p>${r.source.name}에서 지역을 ‘경상북도 의성군’으로 설정하고 실제 정보를 확인하세요. 아래 링크는 개별 공고가 아닌 공식 사이트 첫 화면입니다.</p><a class="source-link" href="${r.source.url}" target="_blank" rel="noopener noreferrer">${r.source.name} 열기 ↗</a>`;
  $('#detail').showModal();return;
 }
 if(e.target.closest('#reset,#empty-reset'))reset();
});
$('#search-form').addEventListener('submit',e=>{e.preventDefault();state.query=$('#search').value;limit=8;render();});
$('#search').addEventListener('input',()=>{state.query=$('#search').value;limit=8;render();});
$('#saved-toggle').onclick=()=>{state.savedOnly=!state.savedOnly;limit=8;render();};
$('#saved-nav').onclick=()=>{
 Object.assign(state,{savedOnly:true,area:'',category:'',query:'',preferences:null});
 $('#search').value='';limit=8;render();$('#information').scrollIntoView({behavior:'smooth'});
};
$('#load-more').onclick=()=>{limit+=8;render();};
$('#close-detail').onclick=()=>$('#detail').close();
$('#detail').addEventListener('click',e=>{
 if(e.target===$('#detail')){
  const r=e.target.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();
 }
});
$('#pref-area').append(...areas.map(area=>{const option=document.createElement('option');option.value=area;option.textContent=area;return option;}));
$('#read-request').onclick=readRequest;
$('#preferences-form').addEventListener('submit',applyPreferences);
$('#clear-preferences').onclick=()=>{clearPreferenceForm();$('#request-status').textContent='입력칸을 비웠어요. 이미 적용한 검색은 결과 위의 ‘맞춤 조건 해제’로 해제할 수 있습니다.';};
$('#remove-preferences').onclick=()=>{state.preferences=null;limit=8;render();};
render();
