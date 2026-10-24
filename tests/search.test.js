import test from 'node:test';
import assert from 'node:assert/strict';
import {areas,records,filterRecords,parseRequest,preferenceLabels} from '../src/data.js';
const preferences=overrides=>({area:'',categories:[],maxRent:null,maxDeposit:null,crop:'',target:'',schedule:'',minPay:null,...overrides});
test('432 distinct fictional records cover 18 districts and four categories',()=>{
 assert.equal(areas.length,18);assert.equal(new Set(areas).size,18);
 assert.equal(records.length,432);assert.equal(new Set(records.map(r=>r.id)).size,432);
 for(const area of areas){
  const found=filterRecords(records,{area});assert.equal(found.length,24);
  for(const category of ['home','farm','support','job'])assert.equal(found.filter(r=>r.category===category).length,6);
 }
 assert.ok(records.every(r=>r.sample===true&&new URL(r.source.url).protocol==='https:'));
});
test('area, category and all keyword tokens combine',()=>{
 const found=filterRecords(records,{area:'안계면',category:'farm',query:' 마늘 초보 '});
 assert.equal(found.length,1);assert.equal(found[0].crop,'마늘');
 assert.equal(filterRecords(records,{area:'안계면',query:'의성읍'}).length,0);
});
test('saved filtering combines with remaining conditions',()=>{
 const saved=[records[0].id,records[25].id];
 assert.equal(filterRecords(records,{savedOnly:true,saved}).length,2);
 assert.equal(filterRecords(records,{savedOnly:true,saved,area:'의성읍'}).length,1);
 assert.equal(filterRecords(records,{savedOnly:true}).length,0);
});
test('blank, category and unknown keyword searches have meaningful outcomes',()=>{
 assert.equal(filterRecords(records,{query:'  '}).length,432);
 assert.equal(filterRecords(records,{query:'없는검색어123'}).length,0);
 assert.equal(filterRecords(records,{query:'취업'}).length,108);
});
test('rent/deposit limits are inclusive and a zero limit is honored',()=>{
 const p=preferences({area:'의성읍',categories:['home'],maxRent:30,maxDeposit:300});
 const found=filterRecords(records,{preferences:p});assert.equal(found.length,3);
 assert.ok(found.every(r=>r.rent<=30&&r.deposit<=300));
 assert.ok(found.some(r=>r.rent===30&&r.deposit===300));
 assert.equal(filterRecords(records,{preferences:{...p,maxRent:0}}).length,0);
});
test('multiple domains apply only their respective limits',()=>{
 const p=preferences({area:'안계면',categories:['home','support','job'],maxRent:50,target:'초보',schedule:'주말',minPay:11000});
 const found=filterRecords(records,{preferences:p});
 assert.ok(found.length>0);
 assert.deepEqual(new Set(found.map(r=>r.category)),new Set(['home','support','job']));
 assert.ok(found.every(r=>r.area==='안계면'));
 assert.ok(found.filter(r=>r.category==='home').every(r=>r.rent<=50));
 assert.ok(found.filter(r=>r.category==='support').every(r=>['초보','누구나'].includes(r.target)));
 assert.ok(found.filter(r=>r.category==='job').every(r=>r.schedule==='주말'&&r.pay>=11000));
});
test('crop and support target filter their own domains',()=>{
 const found=filterRecords(records,{preferences:preferences({area:'봉양면',categories:['farm','support'],crop:'마늘',target:'청년'})});
 assert.equal(found.filter(r=>r.category==='farm').length,1);
 assert.equal(found.filter(r=>r.category==='support').length,3);
 assert.ok(found.filter(r=>r.category==='farm').every(r=>r.crop==='마늘'));
});
test('parse a combined housing/education/weekend request',()=>{
 const {preferences:p,recognized}=parseRequest('안계면에서 월세 50만 원 이하 집, 초보 교육과 주말 일자리를 찾고 싶어요.');
 assert.ok(recognized);assert.equal(p.area,'안계면');assert.equal(p.maxRent,50);
 assert.equal(p.target,'초보');assert.equal(p.schedule,'주말');
 assert.deepEqual(new Set(p.categories),new Set(['home','support','job']));
 assert.ok(filterRecords(records,{preferences:p}).length>0);
 assert.ok(preferenceLabels(p).includes('주거 월세: 50만 원 이하'));
});
test('parse won/manwon units, commas, decimals and bare area names',()=>{
 const {preferences:p}=parseRequest('안계 월세 350,000원 이하 보증금 500만 원 이하');
 assert.equal(p.area,'안계면');assert.equal(p.maxRent,35);assert.equal(p.maxDeposit,500);
 assert.equal(parseRequest('시급 1.2만원 이상 평일 일자리').preferences.minPay,12000);
 assert.equal(parseRequest('월세 0원 이하').preferences.maxRent,0);
});
test('reject ambiguous amount units and unsupported range directions',()=>{
 for(const text of ['월세 50','월세 50만원 이상','월세 50만원 미만','시급 12000원 이하','시급 12000원 초과'])assert.ok(parseRequest(text).error,text);
});
test('reject contradictory multi-value preferences rather than silently choosing',()=>{
 for(const text of ['안계면 또는 봉양면','마늘과 사과 재배','청년 가족 지원','주말 오전 일자리'])assert.ok(parseRequest(text).error,text);
});
test('unsupported text does not pretend to recognize a condition',()=>{
 assert.equal(parseRequest('조용하고 예쁜 곳을 찾아줘').recognized,false);
 assert.equal(parseRequest('<img src=x onerror=alert(1)>').recognized,false);
});
test('minimum pay and maximum housing cost do not leak to other domains',()=>{
 const found=filterRecords(records,{preferences:preferences({categories:['home','job'],maxRent:0,minPay:14000})});
 assert.ok(found.length>0);assert.ok(found.every(r=>r.category==='job'&&r.pay>=14000));
});
