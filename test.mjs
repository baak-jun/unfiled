import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {cases} from './cases.mjs';
import {objects,answers,knownObjectAnswer,parseObjectAnswer,isObjectGuess} from './objects.mjs';
import {createGame,snapshot,press,challenge,guessObject,detectiveContext} from './game.mjs';
const demo={key:'',name:'Demo'};

test('all cases require sequential contradictions, found evidence and fresh stage',()=>{
 for(const story of cases){
 const g=createGame('detective',story);
 assert.equal(snapshot(g,demo).ending,undefined);
 assert.equal(snapshot(g,demo).stages,undefined);
 for(let index=0;index<story.stages.length;index++){
 const stage=story.stages[index],before=snapshot(g,demo);
 assert.equal(before.testimony.statements.length,3);assert.ok(before.testimony.statements.every(s=>!('press'in s)&&!('lie'in s)));
 assert.throws(()=>press(g,index+1,stage.foundBy));
 assert.throws(()=>challenge(g,index,stage.lie,stage.evidence.id));
 assert.equal(challenge(g,index,stage.lie,'initial'),false);assert.equal(g.stage,index);
 press(g,index,stage.foundBy);assert.equal(g.evidence.filter(e=>e.id===stage.evidence.id).length,1);
 assert.throws(()=>press(g,index,stage.foundBy));
 const other=stage.statements.find(s=>s.id!==stage.lie);
 assert.equal(challenge(g,index,other.id,stage.evidence.id),false);
 assert.equal(challenge(g,index,stage.lie,stage.evidence.id),true);assert.equal(g.stage,index+1);
 assert.throws(()=>challenge(g,index,stage.lie,stage.evidence.id));
 }
 assert.equal(g.complete,true);assert.equal(snapshot(g,demo).ending,story.ending);
 }
});
test('future secrets are absent from snapshots and AI context',()=>{
 for(const story of cases){const g=createGame('detective',story),publicData=JSON.stringify(snapshot(g,demo)),context=detectiveContext(g);
 for(const later of story.stages.slice(1)){assert.ok(!publicData.includes(later.evidence.text));assert.ok(!context.includes(later.evidence.text));assert.ok(!context.includes(later.reveal));}
 assert.ok(!context.includes(story.ending));}
});
test('object answers are restricted, stable facts and guesses cannot enumerate targets',()=>{
 for(const target of objects){const g=createGame('object',target),publicData=JSON.stringify(snapshot(g,demo));assert.equal(snapshot(g,demo).ending,undefined);assert.ok(!publicData.includes(target.description));
 assert.ok(answers.includes(knownObjectAnswer(target,'전기를 사용하는 물건인가요?')));
 assert.equal(knownObjectAnswer(target,'금속이 아닌가요?'),null);
 assert.equal(knownObjectAnswer(target,'전기와 금속을 사용하는 물건인가요?'),null);
 assert.equal(knownObjectAnswer(target,'색깔이 빨간가요?'),null);
 assert.equal(parseObjectAnswer('정답은 '+target.name),'기억이 나지 않는다');
 assert.equal(guessObject(g,'우산 열쇠 컵 가위 책'),false);
 assert.equal(isObjectGuess(target,'정답은 '+target.name+'입니다!'),true);
 assert.equal(guessObject(g,target.name),true);assert.equal(g.complete,true);
 assert.throws(()=>guessObject(g,target.name));
 }
 for(const a of answers)assert.equal(parseObjectAnswer(a+'.'),a);
});
test('object and detective actions cannot cross mode boundaries',()=>{
 const g=createGame('object',objects[0]);assert.throws(()=>press(g,0,'s0'));assert.throws(()=>challenge(g,0,'s0','initial'));
 assert.throws(()=>guessObject(createGame('detective',cases[0]),'우산'));
});
test('HTTP: full detective ending, restore, mode separation, object answers and restart',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4174',RAON_API_KEY:'',AI_PROVIDER:'raon',AI_API_KEY:'',AI_MODEL:'',AI_BASE_URL:''},stdio:['ignore','pipe','pipe']});
 try{await Promise.race([once(child.stdout,'data'),new Promise((_,r)=>setTimeout(()=>r(Error('startup timeout')),5000).unref())]);
 const call=async(path,data)=>{const r=await fetch('http://127.0.0.1:4174/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
 let {data:g}=await call('start',{gameType:'detective'});const id=g.id,story=cases.find(c=>c.id===g.caseNumber);
 assert.equal(g.mode,'demo');assert.equal((await fetch('http://127.0.0.1:4174/.env')).status,404);
 assert.equal((await call('chat',{id,text:''})).status,400);
 assert.equal((await call('start',{gameType:'wrong'})).status,400);
 ({data:g}=await call('chat',{id,text:'확실합니까?'}));assert.equal(g.stage,0);assert.equal(g.turns,1);
 assert.equal((await call('state',{id})).data.turns,1);
 for(let i=0;i<4;i++)assert.equal((await call('hint',{id,stage:0})).status,200);
 assert.equal((await call('hint',{id,stage:0})).status,400);
 for(let stage=0;stage<4;stage++){
 const s=story.stages[stage];assert.equal((await call('press',{id,stage,statementId:s.foundBy})).status,200);
 ({data:g}=await call('challenge',{id,stage,statementId:s.lie,evidenceId:s.evidence.id}));assert.equal(g.stage,stage+1);
 }
 assert.equal(g.complete,true);assert.equal(g.ending,story.ending);assert.equal((await call('chat',{id,text:'추가'})).status,409);
 let {data:o}=await call('start',{gameType:'object'});const oid=o.id;
 assert.equal((await call('state',{id})).data.complete,true);
 for(const question of ['전기를 사용하나요?','학교에서 쓴 적 있나요?','어제 누구에게 샀나요?']){
 ({data:o}=await call('chat',{id:oid,text:question}));const answer=o.messages.at(-1).text;assert.ok(answers.includes(answer));
 const again=await call('chat',{id:oid,text:question});assert.equal(again.data.messages.at(-1).text,answer);
 }
 assert.equal((await call('press',{id:oid,stage:0,statementId:'s0'})).status,400);
 assert.equal((await call('object-guess',{id:oid,text:'컵 우산 열쇠'})).data.complete,false);
 for(const target of objects){const result=await call('object-guess',{id:oid,text:target.name});if(result.data.complete){o=result.data;break;}}
 assert.equal(o.complete,true);assert.match(o.ending,/정답은/);
 const next=await call('start',{gameType:'object',previousId:oid});assert.equal(next.data.complete,false);assert.equal((await call('state',{id:oid})).status,404);
 }finally{const closed=once(child,'exit');child.kill();await closed;}
});
