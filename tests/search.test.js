import test from 'node:test';
import assert from 'node:assert/strict';
import {areas,records,filterRecords} from '../src/data.js';
test('all 18 districts offer all four sample categories with unique identifiers',()=>{
 assert.equal(areas.length,18);assert.equal(new Set(areas).size,18);
 assert.equal(new Set(records.map(r=>r.id)).size,72);
 for(const area of areas)assert.deepEqual(new Set(filterRecords(records,{area}).map(r=>r.category)),new Set(['home','farm','support','job']));
 assert.ok(records.every(r=>r.sample===true&&new URL(r.source.url).protocol==='https:'));
});
test('area, category and search are combined',()=>{
 const r=filterRecords(records,{area:'안계면',category:'farm',query:' 마늘 '});
 assert.equal(r.length,1);assert.equal(r[0].area,'안계면');assert.equal(r[0].category,'farm');
 assert.equal(filterRecords(records,{area:'안계면',query:'의성읍'}).length,0);
});
test('saved filter only returns saved records and respects remaining filters',()=>{
 const saved=[records[0].id,records[5].id];
 assert.equal(filterRecords(records,{savedOnly:true,saved}).length,2);
 assert.equal(filterRecords(records,{savedOnly:true,saved,area:'의성읍'}).length,1);
 assert.equal(filterRecords(records,{savedOnly:true}).length,0);
});
test('blank and unmatched searches have explicit outcomes',()=>{
 assert.equal(filterRecords(records,{query:'  '}).length,72);
 assert.equal(filterRecords(records,{query:'없는검색어123'}).length,0);
 assert.equal(filterRecords(records,{query:'취업'}).length,18);
});
