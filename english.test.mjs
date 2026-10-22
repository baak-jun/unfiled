import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {cases} from './locales/en/cases.mjs';
import {objects,answers,knownObjectAnswer,isObjectGuess,parseObjectAnswer} from './locales/en/objects.mjs';
import * as game from './locales/en/game.mjs';
import {cases as koreanCases} from './cases.mjs';
const demo={key:'',name:'Demo'};
const english=value=>assert.doesNotMatch(JSON.stringify(value),/[가-힣]/);
test('English cases preserve every puzzle gate and finish without untranslated text',()=>{
 for(const [i,c]of cases.entries()){
 const g=game.createGame('detective',c);assert.equal(game.snapshot(g,demo).testimony,undefined);game.begin(g);english(game.snapshot(g,demo));english(game.detectiveContext(g));
 for(const [index,s]of c.stages.entries()){
 assert.equal(s.lie,koreanCases[i].stages[index].lie);assert.equal(s.foundBy,koreanCases[i].stages[index].foundBy);
 const before=JSON.stringify(game.snapshot(g,demo));
 for(const future of c.stages.slice(index+1))assert.ok(!before.includes(future.reveal));
 const spoken=g.messages.findLast(m=>m.testimonyStage===index);assert.ok(spoken);for(const statement of s.statements)assert.equal(spoken.text.split(statement.text).length-1,1);
 game.hint(g,index);game.press(g,index,s.foundBy);assert.equal(game.challenge(g,index,s.lie,'initial'),false);
 assert.equal(game.challenge(g,index,s.lie,s.evidence.id),true);english(game.snapshot(g,demo));
 }
 assert.equal(g.complete,true);english(game.snapshot(g,demo));
 }
});
test('English object guesses handle articles and aliases but reject lists',()=>{
 for(const o of objects){english(o);const g=game.createGame('object',o);english(game.snapshot(g,demo));
 assert.ok(answers.includes(knownObjectAnswer(o,'Does it use electricity?')));
 assert.equal(knownObjectAnswer(o,'Is it not metal?'),null);
 assert.equal(knownObjectAnswer(o,'Does it use electricity and tell time?'),null);
 assert.equal(knownObjectAnswer(o,'Is it purple?'),null);
 assert.equal(isObjectGuess(o,'The answer is a '+o.name+'!'),true);
 assert.equal(isObjectGuess(o,'umbrella, key, mug, scissors'),false);
 assert.equal(game.guessObject(g,o.aliases[0]),true);english(game.snapshot(g,demo));
 }
 for(const a of answers)assert.equal(parseObjectAnswer(a+'.'),a);
 assert.equal(parseObjectAnswer('The answer is a mug.'),'I do not remember');
});
test('English HTTP edition supports testimony, errors, cached replies and independent Korean games',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'0',AI_PROVIDER:'raon',AI_API_KEY:'',RAON_API_KEY:'',AI_MODEL:'',AI_BASE_URL:''},stdio:['ignore','pipe','pipe']});
 try{
 const [ready]=await Promise.race([once(child.stdout,'data'),new Promise((_,r)=>setTimeout(()=>r(Error('startup timeout')),5000).unref())]);
 const base=ready.toString().match(/http:\/\/127\.0\.0\.1:\d+/)[0];
 const call=async(path,data)=>{const r=await fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:'en',...data})});const body=await r.json();if(data.lang!=='ko')english(body);return {status:r.status,data:body};};
 const html=await (await fetch(base+'/en/')).text();assert.match(html,/lang="en"/);assert.match(html,/href="\/" class="language"/);assert.doesNotMatch(html.replace('한국어',''),/[가-힣]/);
 assert.equal((await call('state',{id:'missing'})).status,404);
 let {data:g}=await call('start',{gameType:'detective'});const story=cases.find(c=>c.id===g.caseNumber),id=g.id;
 assert.equal(g.lang,'en');assert.equal(g.testimony,undefined);assert.equal((await call('press',{id,stage:0,statementId:'s0'})).status,409);assert.equal((await call('begin',{id})).status,200);assert.equal((await call('begin',{id})).status,409);assert.equal((await call('chat',{id,text:''})).status,400);
 await call('chat',{id,text:'Are you certain?'});
 for(const [stage,s]of story.stages.entries()){await call('hint',{id,stage});await call('press',{id,stage,statementId:s.foundBy});({data:g}=await call('challenge',{id,stage,statementId:s.lie,evidenceId:s.evidence.id}));}
 assert.equal(g.complete,true);
 const {data:ko}=await call('start',{lang:'ko',gameType:'detective'});assert.equal(ko.lang,'ko');assert.match(ko.title,/[가-힣]/);
 let {data:o}=await call('start',{gameType:'object'});const oid=o.id;
 for(const question of ['Does it use electricity?','Have you used it at school?','Is it purple?']){
 const {data:a}=await call('chat',{id:oid,text:question});assert.ok(answers.includes(a.messages.at(-1).text));
 assert.equal((await call('chat',{id:oid,text:question})).data.messages.at(-1).text,a.messages.at(-1).text);
 }
 for(const target of objects){({data:o}=await call('object-guess',{id:oid,text:target.name}));if(o.complete)break;}
 assert.equal(o.complete,true);assert.match(o.ending,/The answer is/);assert.equal((await call('state',{id})).data.complete,true);
 assert.equal((await fetch(base+'/locales/en/cases.mjs')).status,404);
 }finally{if(child.exitCode===null&&child.signalCode===null){const closed=once(child,'exit');child.kill();await closed;}}
});
test('English generated client has no missing translations',async()=>{
 english(await readFile('public/en/app.js','utf8'));
});
