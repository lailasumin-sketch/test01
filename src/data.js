export const areas = ['의성읍','단촌면','점곡면','옥산면','사곡면','춘산면','가음면','금성면','봉양면','비안면','구천면','단밀면','단북면','안계면','다인면','신평면','안평면','안사면'];
export const categories = [
  {id:'home',name:'주거',icon:'⌂',description:'빈집 · 임대 · 체류 공간',color:'#dcebe3'},
  {id:'farm',name:'농산물',icon:'♧',description:'작목 탐색 · 영농 준비',color:'#f0e9d3'},
  {id:'support',name:'지원 정보',icon:'♡',description:'정착 · 교육 · 지원사업',color:'#e5e5f2'},
  {id:'job',name:'취업',icon:'▣',description:'일자리 · 지역에서 일하기',color:'#f3e2d9'}
];
const sources = {
 home: {name:'마이홈포털',url:'https://www.myhome.go.kr/'},
 farm: {name:'그린대로 귀농귀촌',url:'https://www.greendaero.go.kr/'},
 support: {name:'의성군청',url:'https://www.usc.go.kr/'},
 job: {name:'고용24',url:'https://www.work24.go.kr/'}
};
const templates = {
 home:[['마을에서 시작하는 집 찾기','빈집·임대','빈집과 임대주택을 알아볼 때 위치, 수리 상태와 계약 조건을 확인해 보세요.'],['먼저 살아보는 체류 공간','체류형 주거','장기 이주 전에 생활권과 교통을 경험할 수 있는 공간을 탐색해 보세요.']],
 farm:[['나에게 맞는 작목 알아보기','작목 탐색','마늘·사과·쌀 등 관심 작목의 토양, 용수, 기술과 판로를 함께 검토해 보세요.'],['처음 시작하는 영농 준비','영농 교육','농업기술 교육과 현장 상담을 통해 재배 계획을 구체화해 보세요.']],
 support:[['귀농·귀촌 정착 지원 알아보기','정착 지원','사업별 신청 자격, 거주 요건, 접수 기간과 담당 부서를 확인해 보세요.'],['지역에서 배우는 첫걸음','교육·상담','이주 준비와 지역 적응에 필요한 교육·상담 정보를 찾아보세요.']],
 job:[['지역에서 일자리 찾기','채용 탐색','관심 직종과 근무지, 이동 거리, 근무 조건을 함께 살펴보세요.'],['농업과 함께하는 새로운 일','농업·지역 일자리','농업 관련 업무와 지역 기반 일자리를 탐색해 보세요.']]
};
// These are UI demonstration records, not listings, crop statistics or active programs.
export const records = areas.flatMap((area, i) => Object.entries(templates).map(([category, entries], j) => {
 const [title,tag,description]=entries[(i+j)%entries.length];
 return {id:`${i}-${category}`,area,category,title,tag,description,source:sources[category],sample:true};
}));
export function filterRecords(items,{area='',category='',query='',savedOnly=false,saved=[]}={}) {
 const q=query.trim().toLocaleLowerCase('ko');
 return items.filter(r=>(!area||r.area===area)&&(!category||r.category===category)&&(!savedOnly||saved.includes(r.id))&&(!q||[r.area,r.title,r.tag,r.description,categories.find(c=>c.id===r.category)?.name].join(' ').toLocaleLowerCase('ko').includes(q)));
}
