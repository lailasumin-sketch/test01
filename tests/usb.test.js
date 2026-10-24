import test from 'node:test';
import assert from 'node:assert/strict';
import {records,filterRecords} from '../src/data.js';
import {readUSBTable,parseUSBRecords} from '../usb/csv.mjs';
const fields=['id','area','category','title','tag','description','rent','deposit','size','crop','level','method','season','target','kind','schedule','pay','features','source_name','source_url','sample'];
const encode=rows=>[fields,...rows.map(r=>fields.map(key=>key==='features'?r.features.join(' | '):key==='source_name'?r.source.name:key==='source_url'?r.source.url:r[key]??''))].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
test('USB CSV roundtrip retains all 432 records and core filters',()=>{
 const parsed=parseUSBRecords('\uFEFF'+encode(records));
 assert.equal(parsed.length,432);
 for(const category of ['home','farm','support','job'])assert.equal(parsed.filter(r=>r.category===category).length,108);
 assert.equal(filterRecords(parsed,{area:'안계면'}).length,24);
 assert.equal(filterRecords(parsed,{category:'farm',query:'마늘'}).length,18);
 assert.equal(parsed[0].rent,records[0].rent);
});
test('CSV records support quotes, commas, multiline descriptions and Unicode',()=>{
 const sample={...records[0],title:'가상 "주택", A',description:'첫 줄\n둘째 줄'};
 const [parsed]=parseUSBRecords(encode([sample]));
 assert.equal(parsed.title,sample.title);assert.equal(parsed.description,sample.description);
 assert.deepEqual(readUSBTable('a,b\r\n"x,y","a""b"'),[['a','b'],['x,y','a"b']]);
});
test('invalid/duplicate IDs, categories, values and unsafe source URLs are rejected',()=>{
 for(const change of [{id:'" onclick=alert(1)'},{category:'invalid'},{rent:-1},{rent:'bad'},{source:{name:'bad',url:'javascript:alert(1)'}}]){
  assert.throws(()=>parseUSBRecords(encode([{...records[0],...change}])));
 }
 assert.throws(()=>parseUSBRecords(encode([records[0],records[0]])));
 assert.throws(()=>parseUSBRecords('id,area\na,b'));
 assert.throws(()=>parseUSBRecords('"not closed'));
});
test('blank amounts remain unknown and do not pass monetary preferences',()=>{
 const parsed=parseUSBRecords(encode([{...records[0],rent:null,deposit:null}]));
 assert.equal(parsed[0].rent,null);assert.equal(parsed[0].deposit,null);
 assert.equal(filterRecords(parsed).length,1);
 assert.equal(filterRecords(parsed,{preferences:{categories:['home'],maxRent:50}}).length,0);
 assert.equal(filterRecords(parsed,{preferences:{categories:['home'],maxDeposit:500}}).length,0);
});
