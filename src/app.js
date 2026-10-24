import {areas,categories,records,filterRecords} from './data.js';
const $=s=>document.querySelector(s);
let saved=[];
try { const data=JSON.parse(localStorage.getItem('uiseong-saved')||'[]'); if(Array.isArray(data)) saved=data.filter(id=>records.some(r=>r.id===id)); } catch {}
const state={area:'',category:'',query:'',savedOnly:false,saved};
let limit=8;
const categoryFor=id=>categories.find(c=>c.id===id);
function render(){
 $('#area-grid').innerHTML=areas.map(area=>`<button data-area="${area}" class="${state.area===area?'selected':''}" aria-pressed="${state.area===area}">${area}</button>`).join('');
 $('.all-area').classList.toggle('selected',!state.area);
 $('.all-area').setAttribute('aria-pressed',String(!state.area));
 $('#area-title').textContent=state.area?`${state.area}에서 그려보는 새로운 일상`:'의성의 다양한 삶을 만나보세요';
 $('#area-description').textContent=state.area?`${state.area}의 주거·농산물·지원·취업 탐색 예시를 확인하세요.`:'집, 농사, 정착, 일자리. 네 가지 주제로 시작하는 지역 탐색.';
 $('#category-cards').innerHTML=categories.map(c=>`<button data-category="${c.id}" class="category-card ${state.category===c.id?'chosen':''}"><span class="category-icon" style="background:${c.color}">${c.icon}</span><strong>${c.name}</strong><small>${c.description}</small><span class="category-arrow">↗</span></button>`).join('');
 $('#tabs').innerHTML=[{id:'',name:'전체'},...categories].map(c=>`<button data-category="${c.id}" class="${state.category===c.id?'selected':''}" aria-pressed="${state.category===c.id}">${c.name}</button>`).join('');
 const filtered=filterRecords(records,state);
 $('#result-count').textContent=`${state.area||'의성군 전체'} · ${state.savedOnly?'관심 ':''}예시 정보 ${filtered.length}건`;
 $('#results').innerHTML=filtered.length?filtered.slice(0,limit).map(r=>{const c=categoryFor(r.category);return `<article class="result-card"><div class="card-top"><span class="tag" style="background:${c.color}">${c.name}</span><button data-save="${r.id}" class="save ${saved.includes(r.id)?'is-saved':''}" aria-label="${r.area} ${r.title} 관심 정보 ${saved.includes(r.id)?'해제':'저장'}" aria-pressed="${saved.includes(r.id)}">${saved.includes(r.id)?'♥':'♡'}</button></div><div class="card-location">${r.area} <span>· ${r.tag}</span></div><h3><button data-detail="${r.id}">${r.title}</button></h3><p>${r.description}</p><div class="card-bottom"><span>예시 · 실제 공고 아님</span><button data-detail="${r.id}" aria-label="${r.area} ${r.title} 자세히 보기">자세히 보기 ↗</button></div></article>`}).join(''):'<div class="empty"><span>⌕</span><h3>조건에 맞는 정보가 없어요</h3><p>검색어나 필터를 바꾸거나, 관심 정보를 먼저 저장해 보세요.</p><button id="empty-reset">전체 정보 보기</button></div>';
 $('#load-more').hidden=filtered.length<=limit;
 $('#saved-count').textContent=saved.length;
 $('#saved-toggle').setAttribute('aria-pressed',String(state.savedOnly));
 $('#saved-toggle').classList.toggle('selected',state.savedOnly);
}
function reset(){Object.assign(state,{area:'',category:'',query:'',savedOnly:false});$('#search').value='';limit=8;render();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2400);}
document.addEventListener('click',e=>{
 const area=e.target.closest('[data-area]');if(area){state.area=area.dataset.area;limit=8;render();}
 const category=e.target.closest('[data-category]');if(category){state.category=category.dataset.category;limit=8;render();if(category.closest('#category-cards')) $('#information').scrollIntoView({behavior:'smooth'});}
 const save=e.target.closest('[data-save]');if(save){const id=save.dataset.save;const existed=saved.includes(id);saved=existed?saved.filter(x=>x!==id):[...saved,id];state.saved=saved;let persisted=true;try{localStorage.setItem('uiseong-saved',JSON.stringify(saved));}catch{persisted=false;}render();toast(persisted?(existed?'관심 정보에서 해제했어요.':'이 브라우저에 관심 정보를 저장했어요.'):'현재 화면에 반영했어요. 브라우저 저장소를 사용할 수 없어 새로고침하면 유지되지 않습니다.');}
 const detail=e.target.closest('[data-detail]');if(detail){const r=records.find(x=>x.id===detail.dataset.detail);const c=categoryFor(r.category);$('#detail-content').innerHTML=`<span class="pill">${r.area} · ${c.name}</span><h2>${r.title}</h2><p>${r.description}</p><div class="detail-notice"><strong>실제 매물·채용·지원 공고가 아닌 예시입니다.</strong><p>이 카드는 서비스 이용 흐름을 보여줍니다. 해당 지역의 실제 제공 여부, 신청 조건, 금액, 기간은 확인되지 않았습니다.</p></div><h3>다음 단계</h3><p>${r.source.name}에서 지역을 ‘경상북도 의성군’으로 설정하고 관련 정보를 확인하세요. 아래 링크는 개별 공고가 아닌 공식 사이트 첫 화면입니다.</p><a class="source-link" href="${r.source.url}" target="_blank" rel="noopener noreferrer">${r.source.name} 열기 ↗</a>`;$('#detail').showModal();}
 if(e.target.closest('#reset,#empty-reset'))reset();
});
$('#search-form').addEventListener('submit',e=>{e.preventDefault();state.query=$('#search').value;limit=8;render();});
$('#search').addEventListener('input',()=>{state.query=$('#search').value;limit=8;render();});
$('#saved-toggle').onclick=()=>{state.savedOnly=!state.savedOnly;limit=8;render();};
$('#saved-nav').onclick=()=>{state.savedOnly=true;state.area='';state.category='';state.query='';$('#search').value='';limit=8;render();$('#information').scrollIntoView({behavior:'smooth'});};
$('#load-more').onclick=()=>{limit+=8;render();};
$('#close-detail').onclick=()=>$('#detail').close();
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
render();
