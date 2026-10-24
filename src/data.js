export const areas = ['의성읍','단촌면','점곡면','옥산면','사곡면','춘산면','가음면','금성면','봉양면','비안면','구천면','단밀면','단북면','안계면','다인면','신평면','안평면','안사면'];
export const categories = [
  {id:'home',name:'주거',icon:'⌂',description:'빈집 · 임대 · 체류 공간',color:'#dcebe3'},
  {id:'farm',name:'농산물',icon:'♧',description:'작목 탐색 · 영농 준비',color:'#f0e9d3'},
  {id:'support',name:'지원 정보',icon:'♡',description:'정착 · 교육 · 지원사업',color:'#e5e5f2'},
  {id:'job',name:'취업',icon:'▣',description:'일자리 · 지역에서 일하기',color:'#f3e2d9'}
];
const sources = {
 home:{name:'마이홈포털',url:'https://www.myhome.go.kr/'},
 farm:{name:'그린대로 귀농귀촌',url:'https://www.greendaero.go.kr/'},
 support:{name:'의성군청',url:'https://www.usc.go.kr/'},
 job:{name:'고용24',url:'https://www.work24.go.kr/'}
};
const homeTemplates = [
 {title:'작은 마당이 있는 단독주택',tag:'단독주택·월세',rent:30,deposit:300,size:49,features:['마당','반려동물 가능','1~2인']},
 {title:'가족과 함께하는 마을 주택',tag:'단독주택·월세',rent:45,deposit:500,size:76,features:['가족','방 3개','텃밭']},
 {title:'생활을 먼저 경험하는 체류 공간',tag:'체류형 주거',rent:25,deposit:100,size:28,features:['단기 체류','1인','가구 포함']},
 {title:'수리 후 입주하는 빈집',tag:'빈집·월세',rent:20,deposit:200,size:66,features:['수리 필요','마당','텃밭']},
 {title:'생활이 편리한 공동주택',tag:'공동주택·월세',rent:55,deposit:1000,size:59,features:['가족','방 2개','주차']},
 {title:'넓은 정원을 갖춘 전원주택',tag:'전원주택·월세',rent:75,deposit:1500,size:99,features:['정원','가족','반려동물 가능']}
];
const farmTemplates = [
 {crop:'마늘',level:'초보',method:'노지',season:'가을 파종 · 초여름 수확',title:'마늘 재배 첫걸음',features:['작목 탐색','영농 교육']},
 {crop:'사과',level:'경험자',method:'과수원',season:'봄 관리 · 가을 수확',title:'사과 과수원 운영 탐색',features:['전정','과수 관리']},
 {crop:'쌀',level:'초보',method:'논',season:'봄 모내기 · 가을 수확',title:'쌀농사 기초 알아보기',features:['농기계','작목 탐색']},
 {crop:'고추',level:'초보',method:'노지',season:'봄 정식 · 여름 수확',title:'고추 소규모 재배 탐색',features:['소규모','영농 교육']},
 {crop:'복숭아',level:'경험자',method:'과수원',season:'봄 관리 · 여름 수확',title:'복숭아 과수 재배 준비',features:['과수 관리','판로']},
 {crop:'들깨',level:'초보',method:'밭',season:'여름 파종 · 가을 수확',title:'들깨 밭농사 시작하기',features:['소규모','작목 탐색']}
];
const supportTemplates = [
 {title:'청년 귀농 정착 상담',tag:'정착 지원',target:'청년',kind:'상담',features:['이주 계획','정착 상담']},
 {title:'초보자를 위한 영농 기초 교육',tag:'교육·상담',target:'초보',kind:'교육',features:['마늘','쌀','고추','현장 실습']},
 {title:'가족과 함께하는 귀촌 생활 체험',tag:'귀촌 체험',target:'가족',kind:'체험',features:['자녀','마을 탐방']},
 {title:'중장년의 새로운 시작 상담',tag:'정착 지원',target:'중장년',kind:'상담',features:['전직','생활 설계']},
 {title:'귀농·귀촌 주거 준비 안내',tag:'주거 지원',target:'누구나',kind:'상담',features:['빈집','임대','계약 확인']},
 {title:'지역 판매와 창업 기초 교육',tag:'창업 교육',target:'누구나',kind:'교육',features:['창업','판로','농산물 가공']}
];
const jobTemplates = [
 {title:'주말 농산물 포장 도우미',tag:'포장·물류',schedule:'주말',pay:11000,features:['초보 가능','시간제','농산물']},
 {title:'평일 농산물 판매 매장 직원',tag:'판매·서비스',schedule:'평일',pay:12000,features:['판매','주 5일','농산물']},
 {title:'오전 마을 카페 운영 보조',tag:'카페·서비스',schedule:'오전',pay:11500,features:['카페','시간제','초보 가능']},
 {title:'오후 돌봄 프로그램 보조',tag:'돌봄·교육',schedule:'오후',pay:13000,features:['돌봄','시간제','관련 경험 우대']},
 {title:'계절 농작업 도우미',tag:'농업·단기',schedule:'단기',pay:14000,features:['농작업','야외','수확']},
 {title:'지역 사무실 행정 지원',tag:'사무·행정',schedule:'평일',pay:12500,features:['문서 작성','주 5일','사무']}
];
const templates={home:homeTemplates,farm:farmTemplates,support:supportTemplates,job:jobTemplates};
// 432 deterministic fictional records. Values and locations are invented for testing, not market data.
export const records = areas.flatMap((area,i)=>Array.from({length:6},(_,j)=>Object.entries(templates).map(([category,list])=>{
 const item=list[j];
 const r={...item,features:[...item.features],id:`${i}-${category}${j?`-${j}`:''}`,area,category,source:sources[category],sample:true};
 if(category==='home'){
  r.rent+=i%3*5;r.deposit+=i%2*100;
  r.description=`${r.size}㎡ 주거 예시. ${r.features.join(' · ')}. 월세와 보증금은 기능 확인을 위해 만든 가상 금액입니다.`;
 }else if(category==='farm'){
  r.tag=`${r.crop}·${r.level}`;
  r.description=`${r.crop} ${r.method} 재배를 알아보는 ${r.level}용 작목 예시. ${r.season}. 실제 지역별 재배 현황이나 수익을 뜻하지 않습니다.`;
 }else if(category==='support'){
  r.description=`${r.target} 대상 ${r.kind} 시나리오. ${r.features.join(' · ')}. 실제 운영·접수 중인 사업이 아닙니다.`;
 }else{
  r.pay+=i%3*100;
  r.description=`${r.schedule} 근무 시나리오. ${r.features.join(' · ')}. 근무 조건과 시급은 모두 가상이며 실제 채용이 아닙니다.`;
 }
 return r;
})).flat());
export function filterRecords(items,{area='',category='',query='',savedOnly=false,saved=[],preferences=null}={}) {
 const terms=query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
 return items.filter(r=>{
  if(area&&r.area!==area||category&&r.category!==category||savedOnly&&!saved.includes(r.id))return false;
  const text=[r.area,r.title,r.tag,r.description,r.crop,r.target,r.schedule,...r.features,categories.find(c=>c.id===r.category)?.name].join(' ').toLocaleLowerCase('ko');
  if(!terms.every(term=>text.includes(term)))return false;
  if(!preferences)return true;
  const p=preferences;
  if(p.area&&r.area!==p.area||p.categories?.length&&!p.categories.includes(r.category))return false;
  if(r.category==='home'&&(p.maxRent!==null&&p.maxRent!==undefined&&r.rent>p.maxRent||p.maxDeposit!==null&&p.maxDeposit!==undefined&&r.deposit>p.maxDeposit))return false;
  if(r.category==='farm'&&p.crop&&r.crop!==p.crop)return false;
  if(r.category==='support'&&p.target&&r.target!==p.target&&r.target!=='누구나')return false;
  if(r.category==='job'&&(p.schedule&&r.schedule!==p.schedule||p.minPay!==null&&p.minPay!==undefined&&r.pay<p.minPay))return false;
  return true;
 });
}
export function parseRequest(text){
 const result={area:'',categories:[],maxRent:null,maxDeposit:null,crop:'',target:'',schedule:'',minPay:null};
 const add=id=>{if(!result.categories.includes(id))result.categories.push(id);};
 const matchedAreas=areas.filter(area=>text.includes(area)||new RegExp(area.slice(0,-1)+'(?=에서|에|의|\\s|$)').test(text));
 if(matchedAreas.length>1)return {error:'한 번에 한 읍·면을 선택해 주세요. 여러 지역은 전체 지역으로 검색한 뒤 비교할 수 있어요.'};
 result.area=matchedAreas[0]||'';
 if(/주거|월세|보증금|빈집|주택|임대|집을|집이|집 찾/.test(text))add('home');
 if(/농산물|작목|재배|농사|영농/.test(text))add('farm');
 if(/지원|교육|상담|체험|정착/.test(text))add('support');
 if(/취업|일자리|채용|근무|시급|아르바이트|알바/.test(text))add('job');
 for(const [word,field,id] of [['월세','maxRent','home'],['보증금','maxDeposit','home'],['시급','minPay','job']]){
  const match=text.match(new RegExp(word+'\\s*([\\d,]+(?:\\.\\d+)?)\\s*(만\\s*원?|원)?\\s*(이하|이내|까지|미만|이상|초과)?'));
  if(!match)continue;
  const [,raw,unit='',direction='']=match;
  if((id==='home'&&/이상|초과/.test(direction))||(id==='job'&&/이하|이내|까지|미만|초과/.test(direction)))return {error:'월세·보증금은 최대 금액(이하), 시급은 최소 금액(이상)으로 입력해 주세요.'};
  let amount=Number(raw.replaceAll(',',''));
  if(!unit)return {error:`${word} 금액에 단위를 붙여 주세요. 예: 월세 50만 원 이하, 시급 12000원 이상`};
  if(id==='home')amount=unit.startsWith('만')?amount:amount/10000;
  else amount=unit.startsWith('만')?amount*10000:amount;
  if(direction==='미만')return {error:'현재 금액 조건은 ‘이하’를 지원합니다. 예: 월세 49만 원 이하'};
  result[field]=amount;add(id);
 }
 const crops=['마늘','사과','쌀','고추','복숭아','들깨'].filter(c=>text.includes(c));
 if(crops.length>1)return {error:'작목은 한 번에 하나씩 선택해 주세요.'};
 if(crops.length){result.crop=crops[0];add('farm');}
 const targets=[['청년',/청년/],['초보',/초보|처음|입문/],['가족',/가족|자녀/],['중장년',/중장년|은퇴/]].filter(([,pattern])=>pattern.test(text));
 if(targets.length>1)return {error:'지원 대상은 청년·초보·가족·중장년 중 하나씩 선택해 주세요.'};
 if(targets.length){result.target=targets[0][0];add('support');}
 const schedules=['주말','평일','오전','오후','단기'].filter(s=>text.includes(s));
 if(schedules.length>1)return {error:'근무 형태는 주말·평일·오전·오후·단기 중 하나씩 선택해 주세요.'};
 if(schedules.length){result.schedule=schedules[0];add('job');}
 return {preferences:result,recognized:Boolean(result.area||result.categories.length)};
}
export function preferenceLabels(p){
 const labels=[];
 if(p.area)labels.push(`지역: ${p.area}`);
 if(p.categories?.length)labels.push(`분야: ${p.categories.map(id=>categories.find(c=>c.id===id).name).join(' · ')}`);
 if(p.maxRent!==null)labels.push(`주거 월세: ${p.maxRent.toLocaleString()}만 원 이하`);
 if(p.maxDeposit!==null)labels.push(`주거 보증금: ${p.maxDeposit.toLocaleString()}만 원 이하`);
 if(p.crop)labels.push(`농산물 작목: ${p.crop}`);
 if(p.target)labels.push(`지원 대상: ${p.target} + 누구나`);
 if(p.schedule)labels.push(`취업 근무: ${p.schedule}`);
 if(p.minPay!==null)labels.push(`취업 시급: ${p.minPay.toLocaleString()}원 이상`);
 return labels;
}
