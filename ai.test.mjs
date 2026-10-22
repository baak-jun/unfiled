import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readConfig,requestFor,complete} from './ai.mjs';
const history=[{role:'assistant',content:'첫 진술'},{role:'user',content:'어디에 있습니까?'}];
test('provider keys are isolated; legacy Raon key remains supported',()=>{
 assert.equal(readConfig({RAON_API_KEY:'legacy'}).key,'legacy');
 assert.equal(readConfig({AI_PROVIDER:'openai',RAON_API_KEY:'legacy',AI_MODEL:'chat-model'}).key,'');
 assert.equal(readConfig({AI_PROVIDER:'gemini',GEMINI_API_KEY:'own-key',AI_MODEL:'text-model'}).key,'own-key');
 assert.throws(()=>readConfig({AI_PROVIDER:'unknown'}));
 assert.throws(()=>readConfig({AI_PROVIDER:'openai',AI_API_KEY:'key'}),/AI_MODEL/);
});
test('custom endpoint validation and token limits',()=>{
 const env={AI_PROVIDER:'custom',AI_MODEL:'local-model',AI_API_KEY:'local'};
 for(const base of ['http://example.com/v1','https://user:pass@example.com/v1','https://example.com/v1?key=x','https://example.com/v1#secret'])assert.throws(()=>readConfig({...env,AI_BASE_URL:base}));
 assert.equal(readConfig({...env,AI_BASE_URL:'http://127.0.0.1:11434/v1/'}).base,'http://127.0.0.1:11434/v1');
 assert.throws(()=>readConfig({AI_BASE_URL:'https://other.example'}));
 assert.throws(()=>readConfig({AI_MAX_TOKENS:'100000'}));
});
test('all six providers: request schema, response parsing, no redirect',async()=>{
 for(const provider of ['raon','openai','gemini','anthropic','deepseek','custom']){
 const config=readConfig({AI_PROVIDER:provider,AI_MODEL:'test-model',AI_API_KEY:'test-key',...(provider==='custom'?{AI_BASE_URL:'https://example.com/v1'}:{})});
 const req=requestFor(config,'규칙',history),body=JSON.parse(req.options.body);
 assert.equal(body.model,'test-model');assert.equal(req.options.redirect,'error');
 if(provider==='anthropic'){
 assert.equal(req.url,'https://api.anthropic.com/v1/messages');assert.equal(req.options.headers['x-api-key'],'test-key');assert.equal(req.options.headers.Authorization,undefined);assert.equal(body.messages[0].role,'user');assert.match(body.system,/첫 진술/);
 }else{assert.ok(req.url.endsWith('/chat/completions'));assert.equal(req.options.headers.Authorization,'Bearer test-key');assert.equal(body.messages[0].role,'system');}
 assert.equal(body[provider==='openai'?'max_completion_tokens':'max_tokens'],2048);
 const result=await complete(config,'규칙',history,async()=>({ok:true,json:async()=>provider==='anthropic'?{content:[{type:'thinking',thinking:'private'},{type:'text',text:'단서입니다.'}]}:{choices:[{message:{content:'단서입니다.',reasoning:'private'}}]}}));
 assert.equal(result,'단서입니다.');
 }
});
test('authentication errors and empty replies are explicit without reflecting provider error text',async()=>{
 const config=readConfig({RAON_API_KEY:'test-key'});
 await assert.rejects(complete(config,'rule',history,async()=>({ok:false,status:401})),e=>e.status===401&&!e.message.includes('test-key'));
 await assert.rejects(complete(config,'rule',history,async()=>({ok:true,json:async()=>({choices:[{message:{content:null}}]})})),/Empty/);
});
