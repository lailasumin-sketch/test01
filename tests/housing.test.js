import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {columns,parseCSV,readHousingCSV,filterHousing} from '../housing-practice/source/data.js';
const source=await readFile(new URL('../housing-practice/data/주거연습.csv',import.meta.url),'utf8');
const data=readHousingCSV(source);
test('provided CSV has exactly four columns, three rows and no missing values',()=>{
 assert.deepEqual(data.headers,columns);assert.equal(data.records.length,3);
 assert.deepEqual(data.emptyCounts,{'읍면':0,'주택명':0,'월세_만원':0,'보증금_만원':0});
 assert.deepEqual(data.records[0],{'읍면':'안계면','주택명':'가상주택 A','월세_만원':35,'보증금_만원':300});
 assert.ok(data.records.every(r=>Object.keys(r).length===4));
});
test('budget boundaries are inclusive and filters combine',()=>{
 assert.deepEqual(filterHousing(data.records,{maxRent:45}).map(r=>r['주택명']),['가상주택 A','가상주택 B']);
 assert.equal(filterHousing(data.records,{maxDeposit:500}).length,2);
 assert.equal(filterHousing(data.records,{area:'안계면',maxRent:30}).length,0);
 assert.equal(filterHousing(data.records,{maxRent:35,maxDeposit:300}).length,1);
 assert.equal(filterHousing(data.records,{maxRent:0}).length,0);
 assert.equal(filterHousing(data.records,{area:'의성읍',maxRent:60,maxDeposit:1000}).length,1);
});
test('missing data stays null rather than zero, and is excluded only by applicable caps',()=>{
 const parsed=readHousingCSV('읍면,주택명,월세_만원,보증금_만원\n안계면,, ,300\n,빈값 예시,0,\n');
 assert.equal(parsed.records[0]['주택명'],null);assert.equal(parsed.records[0]['월세_만원'],null);
 assert.equal(parsed.records[1]['읍면'],null);assert.equal(parsed.records[1]['월세_만원'],0);
 assert.equal(filterHousing(parsed.records).length,2);
 assert.equal(filterHousing(parsed.records,{maxRent:0}).length,1);
 assert.equal(filterHousing(parsed.records,{maxDeposit:300}).length,1);
 assert.equal(filterHousing(parsed.records,{area:null}).length,1);
});
test('quoted commas, escaped quotes, quoted newlines and BOM are parsed',()=>{
 assert.deepEqual(parseCSV('\uFEFFa,b\r\n"x,y","a""b"\r\n"line\nbreak",z\r\n'),[['a','b'],['x,y','a"b'],['line\nbreak','z']]);
});
test('column order may change; extra fields are acknowledged and never become record properties',()=>{
 const parsed=readHousingCSV('주택명,보증금_만원,비고,읍면,월세_만원\n집,500,제외,안계면,35\n');
 assert.equal(parsed.records[0]['월세_만원'],35);assert.deepEqual(parsed.ignoredHeaders,['비고']);
 assert.equal(parsed.records[0]['비고'],undefined);
});
test('invalid data, malformed quoting and mismatched rows fail explicitly',()=>{
 for(const raw of ['', '읍면,주택명\n안계면,집', '읍면,주택명,월세_만원,보증금_만원\n안계면,집,abc,500', '읍면,주택명,월세_만원,보증금_만원\n안계면,집,-1,500', '읍면,주택명,월세_만원,보증금_만원\n안계면,집,35', '읍면,주택명,월세_만원,보증금_만원\n안계면,"집,35,500', '읍면,주택명,월세_만원,보증금_만원,읍면\n안계면,집,35,500,안계면'])assert.throws(()=>readHousingCSV(raw),undefined,raw);
});
test('commas and fractional amounts preserve the stated manwon units',()=>{
 const parsed=readHousingCSV('읍면,주택명,월세_만원,보증금_만원\n안계면,집,35.5,"1,000"');
 assert.equal(parsed.records[0]['월세_만원'],35.5);assert.equal(parsed.records[0]['보증금_만원'],1000);
});
test('header-only file is a valid zero-row dataset',()=>{
 assert.equal(readHousingCSV(columns.join(',')).records.length,0);
});
