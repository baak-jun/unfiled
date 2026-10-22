import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {cases,judge} from './cases.mjs';
test('all cases: wrong answers, deduplication, completion and validation',()=>{
 for(const story of cases){const g={story,solved:new Set()};for(let slot=0;slot<3;slot++){assert.equal(judge(g,slot,(story.answers[slot]+1)%4),false);assert.equal(g.solved.size,slot);assert.equal(judge(g,slot,story.answers[slot]),true);judge(g,slot,story.answers[slot]);assert.equal(g.solved.size,slot+1);}assert.throws(()=>judge(g,-1,0));assert.throws(()=>judge(g,0,9));}
});
test('HTTP complete game, hidden answers, hints, validation, restore and restart',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4174',RAON_API_KEY:'',AI_PROVIDER:'raon',AI_API_KEY:'',AI_MODEL:'',AI_BASE_URL:''},stdio:['ignore','pipe','pipe']});
 try{await Promise.race([once(child.stdout,'data'),new Promise((_,r)=>setTimeout(()=>r(Error('startup timeout')),5000).unref())]);
 const call=async(path,data)=>{const r=await fetch('http://127.0.0.1:4174/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
 let {data:g}=await call('start',{});const id=g.id;
 assert.equal(g.mode,'demo');assert.equal(g.solved.length,0);assert.equal(g.answers,undefined);assert.equal(g.ending,undefined);
 assert.equal((await fetch('http://127.0.0.1:4174/.env')).status,404);
 assert.equal((await call('chat',{id,text:''})).status,400);
 assert.equal((await call('guess',{id,slot:0,choice:0})).status,400);
 ({data:g}=await call('chat',{id,text:'누구와의 일이에요?'}));assert.equal(g.turns,1);assert.equal(g.messages.length,3);
 assert.equal((await call('state',{id})).data.turns,1);
 for(let i=0;i<3;i++)assert.equal((await call('hint',{id})).status,200);
 assert.equal((await call('hint',{id})).status,400);
 assert.equal((await call('guess',{id,slot:8,choice:0})).status,400);
 const story=cases.find(c=>c.id===g.caseNumber);
 for(let slot=0;slot<3;slot++){const wrong=await call('guess',{id,slot,choice:(story.answers[slot]+1)%4});assert.equal(wrong.data.solved.length,slot);({data:g}=await call('guess',{id,slot,choice:story.answers[slot]}));assert.equal(g.solved.length,slot+1);}
 assert.equal(g.complete,true);assert.equal(g.ending,story.ending);assert.equal((await call('chat',{id,text:'다음'})).status,409);
 const next=await call('start',{previousId:id});assert.notEqual(next.data.caseNumber,g.caseNumber);assert.equal((await call('state',{id})).status,404);
 }finally{const closed=once(child,'exit');child.kill();await closed;}
});
