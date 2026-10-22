const $=id=>document.getElementById(id);
let state,busy=false,shownEnding=false,gameType='detective',selectedStatement=null;
const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
function storedId(type){try{return sessionStorage.getItem('unfiled-v2-en-'+type);}catch{return null;}}
function saveId(type,id){try{sessionStorage.setItem('unfiled-v2-en-'+type,id);sessionStorage.setItem('unfiled-active-mode-en',type);}catch{}}
async function api(route,data){const r=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:document.documentElement.lang,...data})});const result=await r.json();if(!r.ok){const error=new Error(result.error||'Check your connection.');error.status=r.status;throw error;}return result;}
function lock(value){
 busy=value;$('message').disabled=value||Boolean(state?.complete);document.querySelectorAll('button').forEach(b=>{if(!b.dataset.close&&b.id!=='help'&&b.id!=='key-help'&&b.id!=='dialogue-speed')b.disabled=value;});
 if(!value&&state){$('hint').disabled=state.hints===0||state.complete||!state.begun;$('send').disabled=state.complete;$('message').disabled=state.complete;document.querySelectorAll('[data-question],#object-form button').forEach(b=>b.disabled=state.complete);document.querySelectorAll('[data-already-pressed]').forEach(b=>b.disabled=true);}
}
function render(){
 const object=state.gameType==='object';gameType=state.gameType;
 $('mode-detective').setAttribute('aria-pressed',String(!object));$('mode-object').setAttribute('aria-pressed',String(object));
 $('hero-title').replaceChildren(document.createTextNode(object?'One object.':'Every statement'),el('br'),el('em','',object?'What is on their mind?':'hides another lie.'));
 $('hero-copy').textContent=object?'Four answers to narrow it down. One fixed object per round.':'An admission is not the end. Expose the lie it leaves behind.';
 $('case-title').textContent=state.title;$('scene-location').textContent=state.location;$('scene-time').textContent=state.time;$('name').textContent=state.name;$('role').textContent=state.role;$('case-no').textContent=object?'OBJECT / UNKNOWN':'CASE / '+state.caseNumber;$('object').textContent=state.object;$('intro-quote').textContent=object?'“Yes / No / I think so / I do not remember”':'“'+state.greeting+'”';$('chat-name').textContent=object?'Object in Mind / Question log':state.name+' / Transcript';$('mode-label').textContent=state.mode==='ai'?state.provider+' mode':'Scripted demo';$('turns').textContent='Questions '+String(state.turns).padStart(2,'0');
 $('privacy').textContent=state.mode==='ai'?'AI mode · Some questions are sent to the '+state.provider+' API.':'Demo · Transcripts are held temporarily in local server memory.';
 document.querySelector('.live-dot').textContent=state.complete?'Complete':object?'Unknown':'Unsolved';$('scene-art').hidden=object;$('object-silhouette').hidden=!object;
 $('evidence-list').replaceChildren();if(!object){$('evidence-list').append(el('h3','','Collected evidence / '+state.evidence.length));for(const e of state.evidence){const d=el('details','evidence-entry');d.append(el('summary','',e.title),el('p','',e.text));$('evidence-list').append(d);}}
 const testimony=$('testimony');testimony.replaceChildren();
 const selected=!object&&state.testimony?.statements.find(s=>s.id===selectedStatement);
 testimony.hidden=!selected||state.complete;
 if(selected){testimony.append(el('div','testimony-title','The line you noticed'),el('p','selected-quote','“'+selected.text+'”'));const controls=el('div','statement-controls'),press=el('button','',selected.pressed?'Already asked about':'Ask about this'),challenge=el('button','','Compare evidence'),close=el('button','','Dismiss');press.onclick=()=>action('press',{stage:state.stage,statementId:selected.id});if(selected.pressed)press.dataset.alreadyPressed='true';challenge.onclick=()=>openChallenge(selected);close.onclick=()=>{selectedStatement=null;render();lock(false);};controls.append(press,challenge,close);testimony.append(controls);}
 const log=$('messages');log.replaceChildren(el('p','chat-day',object?'— FOUR ANSWERS / ONE OBJECT —':'— RECORDING / TRANSCRIPT —'));
 if(!object){const scene=el('div','case-briefing');scene.append(el('small','','Your assignment'),el('p','',state.briefing));log.append(scene);}
 for(const [messageIndex,m] of state.messages.entries()){const row=el('div','message '+(m.kind==='scene'?'narration':m.role));row.dataset.messageIndex=messageIndex;if(m.role==='system')row.textContent=m.text;else{if(m.role==='assistant')row.append(el('span','avatar',object?'?':state.name.slice(0,1)));const wrap=el('div','message-content');if(m.role==='assistant')wrap.append(el('span','speaker',object?'Reply':state.name));const bubble=el('div','bubble');
 if(!object&&!state.complete&&state.begun&&m.testimonyStage===state.stage){let cursor=0;const fragments=state.testimony.statements.map(s=>({...s,at:m.text.indexOf(s.text)})).filter(s=>s.at>=0).sort((a,b)=>a.at-b.at);for(const s of fragments){bubble.append(document.createTextNode(m.text.slice(cursor,s.at)));const line=el('button','spoken-line'+(selectedStatement===s.id?' selected':''),s.text);line.setAttribute('aria-pressed',String(selectedStatement===s.id));line.onclick=()=>{if(busy)return;const top=log.scrollTop;selectedStatement=selectedStatement===s.id?null:s.id;render();lock(false);log.scrollTop=top;};bubble.append(line);cursor=s.at+s.text.length;}bubble.append(document.createTextNode(m.text.slice(cursor)));wrap.append(bubble,el('small','speech-tip','Select a line that catches your attention to ask about it.'));}
 else bubble.textContent=m.text;
 if(!bubble.parentNode)wrap.append(bubble);row.append(wrap);}log.append(row);}
 if(!object&&!state.begun){const enter=el('button','begin-story', 'Hear what happened →');enter.onclick=()=>action('begin');log.append(enter);}
 log.scrollTop=!object&&!state.begun?0:log.scrollHeight;
 $('board-title').textContent=object?'Object in Mind':'Layers of Truth';$('board-label').textContent=object?'ONE HIDDEN OBJECT':'LAYERS OF TRUTH';$('board-count').textContent=object?'?':String(state.stageCount).padStart(2,'0');$('board-desc').textContent=object?'Narrow down its features, then submit the name.':'Prove a contradiction. Make the witness change their story.';
 $('progress-shell').hidden=object;$('hint').hidden=object;$('object-form').hidden=!object;$('clues').replaceChildren();
 if(object){$('clues').append(el('p','object-stats',`Questions ${state.turns} / Guesses ${state.attempts}`));const guide=el('div','answer-guide');['Yes','No','I think so','I do not remember'].forEach(a=>guide.append(el('span','',a)));$('clues').append(guide);$('board-tip').textContent='Uncertain memories are not facts. Repeated questions receive the same answer.';}
 else{$('progress').max=state.stageCount;$('progress').value=state.stage;$('progress-text').textContent=Math.round(state.stage/state.stageCount*100)+'%';for(let i=0;i<state.stageCount;i++){const d=state.discoveries[i],row=el('div','clue'+(d?' solved':''));row.append(el('span','clue-number',d?'✓':String(i+1).padStart(2,'0')));const t=el('span');t.append(el('strong','',d?d.title:i===state.stage?'Current testimony':'Sealed truth'),el('small','',d?d.evidence:i===state.stage?'Follow the conversation':'Resolve the preceding contradiction'));row.append(t);$('clues').append(row);}$('hint').replaceChildren(document.createTextNode('Request a lead '),el('span','',String(state.hints)));$('board-tip').textContent=state.begun?'Select a line in the conversation. Ask for details, or compare it with your evidence.':'Hear their account first. There is no need to rush to a conclusion.';}
 const questions=object?[['Does it use electricity?','Uses electricity?'],['Does it fit in a pocket?','Does it fit in a pocket?'],['Have you used it at school?','Used at school?']]:[['Would you explain your current statement again?','Review statement'],['What makes you so certain?','Ask for grounds'],['Do you still stand by that statement?','Confirm account']];
 document.querySelectorAll('[data-question]').forEach((b,i)=>{b.dataset.question=questions[i][0];b.textContent=questions[i][1];});document.querySelector('.suggestions').hidden=!object&&!state.begun;$('message').placeholder=object?'For example: Is it made of metal?':'Ask whatever you want to know.';
}
function showEnding(){const object=state.gameType==='object';
 if(state.complete&&!shownEnding){shownEnding=true;$('ending-title').textContent=object?'Object identified.':'The final lie exposed.';$('ending-eyebrow').textContent=object?'OBJECT IDENTIFIED':'CASE CLOSED / 100%';$('ending-text').textContent=state.ending;$('reflection-text').textContent=state.reflection;$('try-object').hidden=object;$('next-case').textContent=object?'Think of another object →':'Open the next case →';$('ending-dialog').showModal();}
}
let playback=null;
function speedUp(){if(!playback)return;playback.level=Math.min(2,playback.level+1);$('dialogue-speed').textContent=playback.level===1?'Show all · Once more':'Finishing the reply…';playback.wake?.();}
async function revealMessages(from){
 const log=$('messages'),rows=[...log.querySelectorAll('[data-message-index]')].filter(r=>Number(r.dataset.messageIndex)>=from&&state.messages[Number(r.dataset.messageIndex)].role!=='user');
 if(!rows.length)return;
 const run={level:0,wake:null};playback=run;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const wait=ms=>new Promise(resolve=>{let timer;const done=()=>{clearTimeout(timer);if(run.wake===done)run.wake=null;resolve();};run.wake=done;timer=setTimeout(done,run.level===2?0:ms/(run.level===1?3:1));});
 const entries=rows.map(row=>{const content=row.querySelector('.bubble')||row,walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),nodes=[];let node;while((node=walker.nextNode()))nodes.push({node,text:node.textContent,chars:[...node.textContent]});row.hidden=true;const tip=row.querySelector('.speech-tip');if(tip)tip.hidden=true;return {row,nodes,tip};});
 const beginButton=log.querySelector('.begin-story');if(beginButton)beginButton.hidden=true;
 lock(true);log.setAttribute('aria-live','off');log.classList.add('is-speaking');$('dialogue-playback').hidden=false;$('dialogue-speed').textContent='Read faster · Click / Space';$('dialogue-status').textContent='Listening…';
 try{
 for(const {row,nodes,tip} of entries){
 for(const item of nodes)item.node.textContent='';
 row.hidden=false;row.classList.add('speaking');log.scrollTop=log.scrollHeight;
 await wait(420);
 for(const item of nodes){
 let at=0;
 while(at<item.chars.length){
 if(run.level===2){item.node.textContent=item.text;break;}
 if(reduced){item.node.textContent=item.text;log.scrollTop=log.scrollHeight;await wait(Math.min(2400,Math.max(500,item.chars.length*30)));break;}
 const amount=1;const fragment=item.chars.slice(at,at+amount).join('');at+=amount;item.node.textContent+=fragment;
 log.scrollTop=log.scrollHeight;
 await wait(/[.!?。？！]/.test(fragment)?135:/[,，…]/.test(fragment)?75:24);
 }
 }
 row.classList.remove('speaking');if(tip)tip.hidden=false;
 await wait(160);
 }
 }finally{
 for(const {row,nodes,tip} of entries){row.hidden=false;row.classList.remove('speaking');for(const item of nodes)item.node.textContent=item.text;if(tip)tip.hidden=false;}
 if(beginButton)beginButton.hidden=false;
 log.classList.remove('is-speaking');log.setAttribute('aria-live','polite');$('dialogue-playback').hidden=true;$('dialogue-status').textContent='';playback=null;
 }
}
$('dialogue-speed').onclick=speedUp;
$('messages').addEventListener('click',()=>{if(playback&&document.getSelection()?.isCollapsed!==false)speedUp();});
document.addEventListener('keydown',e=>{if(!playback||e.code!=='Space'||e.repeat||e.isComposing)return;const target=e.target;if(target.isContentEditable||target.matches('input:not(:disabled),textarea:not(:disabled),select,button:not(:disabled),a'))return;e.preventDefault();speedUp();});
function openChallenge(statement){if(busy)return;const stage=state.stage;$('guess-title').textContent='“'+statement.text+'”';$('guess-options').replaceChildren();state.evidence.forEach(e=>{const b=el('button','');b.append(el('strong','',e.title),el('small','',e.text));b.onclick=async()=>{$('guess-dialog').close();await action('challenge',{stage,statementId:statement.id,evidenceId:e.id});};$('guess-options').append(b);});$('guess-dialog').showModal();}
async function action(route,data={}){if(busy||!state)return false;lock(true);$('feedback').textContent=route==='chat'?'Waiting for a reply…':'';try{const previousCount=state.messages.length;const next=await api(route,{id:state.id,...data});if(next.stage!==state.stage||route==='press')selectedStatement=null;state=next;render();$('feedback').textContent='';await revealMessages(previousCount);showEnding();return true;}catch(e){$('feedback').textContent=e.message;return false;}finally{lock(false);}}
async function start(type=gameType,resume=false){if(busy)return;lock(true);$('feedback').textContent='Opening the records…';try{const id=resume?storedId(type):null;if(id){try{state=await api('state',{id});}catch(e){if(e.status!==404)throw e;state=await api('start',{gameType:type});}}else state=await api('start',{gameType:type,previousId:state?.gameType===type?state.id:undefined});shownEnding=false;selectedStatement=null;$('message').value='';$('object-guess').value='';$('char-count').textContent='0 / 600';saveId(type,state.id);render();$('feedback').textContent='';if(state.id!==id)await revealMessages(0);showEnding();}catch(e){$('feedback').textContent=e.message;}finally{lock(false);}}
async function submit(text){if(!text.trim()||busy)return;const ok=await action('chat',{text:text.trim()});if(ok){$('message').value='';$('char-count').textContent='0 / 600';if(!state.complete)$('message').focus();}}
function switchMode(type){if(gameType!==type)start(type,true);}
$('mode-detective').onclick=()=>switchMode('detective');$('mode-object').onclick=()=>switchMode('object');
$('try-object').onclick=()=>{$('ending-dialog').close();start('object',true);};
$('object-form').onsubmit=async e=>{e.preventDefault();const ok=await action('object-guess',{text:$('object-guess').value});if(ok)$('object-guess').value='';};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('help').onclick=()=>$('help-dialog').showModal();$('key-help').onclick=()=>$('key-dialog').showModal();$('hint').onclick=()=>action('hint',{stage:state.stage});$('restart').onclick=()=>{if(!state||state.complete||confirm('End the current round in this mode and start again?'))start();};$('next-case').onclick=()=>{$('ending-dialog').close();start();};
document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>submit(b.dataset.question));$('chat-form').onsubmit=e=>{e.preventDefault();submit($('message').value);};$('message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit($('message').value);}};$('message').oninput=()=>$('char-count').textContent=$('message').value.length+' / 600';
try{gameType=sessionStorage.getItem('unfiled-active-mode-en')==='object'?'object':'detective';}catch{}start(gameType,true);
