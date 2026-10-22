const $=id=>document.getElementById(id);
let state,busy=false,shownEnding=false,gameType='detective',selectedStatement=null;
const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
function storedId(type){try{return sessionStorage.getItem('unfiled-v2-'+type);}catch{return null;}}
function saveId(type,id){try{sessionStorage.setItem('unfiled-v2-'+type,id);sessionStorage.setItem('unfiled-active-mode',type);}catch{}}
async function api(route,data){const r=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:document.documentElement.lang,...data})});const result=await r.json();if(!r.ok){const error=new Error(result.error||'연결을 확인하세요.');error.status=r.status;throw error;}return result;}
function lock(value){
 busy=value;$('message').disabled=value||Boolean(state?.complete);document.querySelectorAll('button').forEach(b=>{if(!b.dataset.close&&b.id!=='help'&&b.id!=='key-help'&&b.id!=='dialogue-speed')b.disabled=value;});
 if(!value&&state){$('hint').disabled=state.hints===0||state.complete||!state.begun;$('send').disabled=state.complete;$('message').disabled=state.complete;document.querySelectorAll('[data-question],#object-form button').forEach(b=>b.disabled=state.complete);document.querySelectorAll('[data-already-pressed]').forEach(b=>b.disabled=true);}
}
function render(){
 const object=state.gameType==='object';gameType=state.gameType;
 $('mode-detective').setAttribute('aria-pressed',String(!object));$('mode-object').setAttribute('aria-pressed',String(object));
 $('hero-title').replaceChildren(document.createTextNode(object?'머릿속에 떠올린,':'모든 진술에는'),el('br'),el('em','',object?'그 사물은 무엇인가.':'또 다른 빈틈이 있다.'));
 $('hero-copy').textContent=object?'네 가지 답변으로 범위를 좁혀라. 정답은 한 판 동안 바뀌지 않는다.':'시인했다고 끝이 아니다. 남겨 둔 거짓말을 증거로 벗겨내라.';
 $('case-title').textContent=state.title;$('scene-location').textContent=state.location;$('scene-time').textContent=state.time;$('name').textContent=state.name;$('role').textContent=state.role;$('case-no').textContent=object?'OBJECT / UNKNOWN':'CASE / '+state.caseNumber;$('object').textContent=state.object;$('intro-quote').textContent=object?'“맞다 / 아니다 / 그랬던 것 같다 / 기억이 나지 않는다”':'“'+state.greeting+'”';$('chat-name').textContent=object?'기억 속 사물 / 질문 기록':state.name+' / 진술 기록';$('mode-label').textContent=state.mode==='ai'?state.provider+' 모드':'시나리오 데모';$('turns').textContent='질문 '+String(state.turns).padStart(2,'0');
 $('privacy').textContent=state.mode==='ai'?'AI 모드 · 질문 일부가 '+state.provider+' API로 전송됩니다.':'데모 · 대화는 서버 메모리에만 임시 보관됩니다.';
 document.querySelector('.live-dot').textContent=state.complete?'완료':object?'미확인':'미해결';$('scene-art').hidden=object;$('object-silhouette').hidden=!object;
 $('evidence-list').replaceChildren();if(!object){$('evidence-list').append(el('h3','','확보한 증거 / '+state.evidence.length));for(const e of state.evidence){const d=el('details','evidence-entry');d.append(el('summary','',e.title),el('p','',e.text));$('evidence-list').append(d);}}
 const testimony=$('testimony');testimony.replaceChildren();
 const selected=!object&&state.testimony?.statements.find(s=>s.id===selectedStatement);
 testimony.hidden=!selected||state.complete;
 if(selected){testimony.append(el('div','testimony-title','마음에 걸린 말'),el('p','selected-quote','“'+selected.text+'”'));const controls=el('div','statement-controls'),press=el('button','',selected.pressed?'이미 더 물어본 말':'그 부분을 더 묻기'),challenge=el('button','','증거와 대조하기'),close=el('button','','접기');press.onclick=()=>action('press',{stage:state.stage,statementId:selected.id});if(selected.pressed)press.dataset.alreadyPressed='true';challenge.onclick=()=>openChallenge(selected);close.onclick=()=>{selectedStatement=null;render();lock(false);};controls.append(press,challenge,close);testimony.append(controls);}
 const log=$('messages');log.replaceChildren(el('p','chat-day',object?'— FOUR ANSWERS / 하나의 사물 —':'— RECORDING / 진술 채록 —'));
 if(!object){const scene=el('div','case-briefing');scene.append(el('small','','이번에 맡은 일'),el('p','',state.briefing));log.append(scene);}
 for(const [messageIndex,m] of state.messages.entries()){const row=el('div','message '+(m.kind==='scene'?'narration':m.role));row.dataset.messageIndex=messageIndex;if(m.role==='system')row.textContent=m.text;else{if(m.role==='assistant')row.append(el('span','avatar',object?'?':state.name.slice(0,1)));const wrap=el('div','message-content');if(m.role==='assistant')wrap.append(el('span','speaker',object?'응답':state.name));const bubble=el('div','bubble');
 if(!object&&!state.complete&&state.begun&&m.testimonyStage===state.stage){let cursor=0;const fragments=state.testimony.statements.map(s=>({...s,at:m.text.indexOf(s.text)})).filter(s=>s.at>=0).sort((a,b)=>a.at-b.at);for(const s of fragments){bubble.append(document.createTextNode(m.text.slice(cursor,s.at)));const line=el('button','spoken-line'+(selectedStatement===s.id?' selected':''),s.text);line.setAttribute('aria-pressed',String(selectedStatement===s.id));line.onclick=()=>{if(busy)return;const top=log.scrollTop;selectedStatement=selectedStatement===s.id?null:s.id;render();lock(false);log.scrollTop=top;};bubble.append(line);cursor=s.at+s.text.length;}bubble.append(document.createTextNode(m.text.slice(cursor)));wrap.append(bubble,el('small','speech-tip','마음에 걸리는 문장을 누르면 그 부분을 더 물어볼 수 있습니다.'));}
 else bubble.textContent=m.text;
 if(!bubble.parentNode)wrap.append(bubble);row.append(wrap);}log.append(row);}
 if(!object&&!state.begun){const enter=el('button','begin-story', '그날의 이야기를 듣는다 →');enter.onclick=()=>action('begin');log.append(enter);}
 log.scrollTop=!object&&!state.begun?0:log.scrollHeight;
 $('board-title').textContent=object?'기억 속 사물':'겹겹의 진실';$('board-label').textContent=object?'ONE HIDDEN OBJECT':'LAYERS OF TRUTH';$('board-count').textContent=object?'?':String(state.stageCount).padStart(2,'0');$('board-desc').textContent=object?'질문으로 특징을 좁히고 사물 이름을 제출하세요.':'모순을 입증할 때마다 증인이 진술을 바꿉니다.';
 $('progress-shell').hidden=object;$('hint').hidden=object;$('object-form').hidden=!object;$('clues').replaceChildren();
 if(object){$('clues').append(el('p','object-stats',`질문 ${state.turns}회 / 정답 제출 ${state.attempts}회`));const guide=el('div','answer-guide');['맞다','아니다','그랬던 것 같다','기억이 나지 않는다'].forEach(a=>guide.append(el('span','',a)));$('clues').append(guide);$('board-tip').textContent='불확실한 기억은 확정된 사실이 아닙니다. 같은 질문에는 같은 답을 유지합니다.';}
 else{$('progress').max=state.stageCount;$('progress').value=state.stage;$('progress-text').textContent=Math.round(state.stage/state.stageCount*100)+'%';for(let i=0;i<state.stageCount;i++){const d=state.discoveries[i],row=el('div','clue'+(d?' solved':''));row.append(el('span','clue-number',d?'✓':String(i+1).padStart(2,'0')));const t=el('span');t.append(el('strong','',d?d.title:i===state.stage?'현재 증언':'봉인된 진실'),el('small','',d?d.evidence:i===state.stage?'대화에서 단서 찾기':'앞선 모순을 먼저 입증하세요'));row.append(t);$('clues').append(row);}$('hint').replaceChildren(document.createTextNode('조사 방향 요청 '),el('span','',String(state.hints)));$('board-tip').textContent=state.begun?'대화에서 마음에 걸리는 문장을 짚어 보세요. 더 묻거나, 가지고 있는 증거와 대조할 수 있습니다.':'먼저 무슨 일이 있었는지 이야기를 들어보세요. 서둘러 결론을 낼 필요는 없습니다.';}
 const questions=object?[['전기를 사용하는 물건인가요?','전기를 쓰나요?'],['주머니에 들어가나요?','주머니에 들어가나요?'],['학교에서 쓴 적이 있나요?','학교에서 쓰나요?']]:[['현재 진술을 다시 설명해 주시겠습니까?','진술을 확인한다'],['그렇게 확신하는 근거는 무엇입니까?','근거를 묻는다'],['지금도 같은 주장을 유지합니까?','다시 확인한다']];
 document.querySelectorAll('[data-question]').forEach((b,i)=>{b.dataset.question=questions[i][0];b.textContent=questions[i][1];});document.querySelector('.suggestions').hidden=!object&&!state.begun;$('message').placeholder=object?'예: 금속으로 된 물건인가요?':'궁금한 것을 자연스럽게 물어보세요.';
}
function showEnding(){const object=state.gameType==='object';
 if(state.complete&&!shownEnding){shownEnding=true;$('ending-title').textContent=object?'사물을 찾았다.':'마지막 거짓말까지.';$('ending-eyebrow').textContent=object?'OBJECT IDENTIFIED':'CASE CLOSED / 100%';$('ending-text').textContent=state.ending;$('reflection-text').textContent=state.reflection;$('try-object').hidden=object;$('next-case').textContent=object?'다른 사물 떠올리기 →':'다음 사건 열기 →';$('ending-dialog').showModal();}
}
let playback=null;
function speedUp(){if(!playback)return;playback.level=Math.min(2,playback.level+1);$('dialogue-speed').textContent=playback.level===1?'모두 보기 · 한 번 더':'이어서 읽는 중…';playback.wake?.();}
async function revealMessages(from){
 const log=$('messages'),rows=[...log.querySelectorAll('[data-message-index]')].filter(r=>Number(r.dataset.messageIndex)>=from&&state.messages[Number(r.dataset.messageIndex)].role!=='user');
 if(!rows.length)return;
 const run={level:0,wake:null};playback=run;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const wait=ms=>new Promise(resolve=>{let timer;const done=()=>{clearTimeout(timer);if(run.wake===done)run.wake=null;resolve();};run.wake=done;timer=setTimeout(done,run.level===2?0:ms/(run.level===1?3:1));});
 const entries=rows.map(row=>{const content=row.querySelector('.bubble')||row,walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),nodes=[];let node;while((node=walker.nextNode()))nodes.push({node,text:node.textContent,chars:[...node.textContent]});row.hidden=true;const tip=row.querySelector('.speech-tip');if(tip)tip.hidden=true;return {row,nodes,tip};});
 const beginButton=log.querySelector('.begin-story');if(beginButton)beginButton.hidden=true;
 lock(true);log.setAttribute('aria-live','off');log.classList.add('is-speaking');$('dialogue-playback').hidden=false;$('dialogue-speed').textContent='빠르게 보기 · 클릭 / Space';$('dialogue-status').textContent='이야기를 듣는 중';
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
async function action(route,data={}){if(busy||!state)return false;lock(true);$('feedback').textContent=route==='chat'?'답변을 기다리는 중…':'';try{const previousCount=state.messages.length;const next=await api(route,{id:state.id,...data});if(next.stage!==state.stage||route==='press')selectedStatement=null;state=next;render();$('feedback').textContent='';await revealMessages(previousCount);showEnding();return true;}catch(e){$('feedback').textContent=e.message;return false;}finally{lock(false);}}
async function start(type=gameType,resume=false){if(busy)return;lock(true);$('feedback').textContent='기록을 불러오는 중…';try{const id=resume?storedId(type):null;if(id){try{state=await api('state',{id});}catch(e){if(e.status!==404)throw e;state=await api('start',{gameType:type});}}else state=await api('start',{gameType:type,previousId:state?.gameType===type?state.id:undefined});shownEnding=false;selectedStatement=null;$('message').value='';$('object-guess').value='';$('char-count').textContent='0 / 600';saveId(type,state.id);render();$('feedback').textContent='';if(state.id!==id)await revealMessages(0);showEnding();}catch(e){$('feedback').textContent=e.message;}finally{lock(false);}}
async function submit(text){if(!text.trim()||busy)return;const ok=await action('chat',{text:text.trim()});if(ok){$('message').value='';$('char-count').textContent='0 / 600';if(!state.complete)$('message').focus();}}
function switchMode(type){if(gameType!==type)start(type,true);}
$('mode-detective').onclick=()=>switchMode('detective');$('mode-object').onclick=()=>switchMode('object');
$('try-object').onclick=()=>{$('ending-dialog').close();start('object',true);};
$('object-form').onsubmit=async e=>{e.preventDefault();const ok=await action('object-guess',{text:$('object-guess').value});if(ok)$('object-guess').value='';};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('help').onclick=()=>$('help-dialog').showModal();$('key-help').onclick=()=>$('key-dialog').showModal();$('hint').onclick=()=>action('hint',{stage:state.stage});$('restart').onclick=()=>{if(!state||state.complete||confirm('이 모드의 현재 판을 닫고 새로 시작할까요?'))start();};$('next-case').onclick=()=>{$('ending-dialog').close();start();};
document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>submit(b.dataset.question));$('chat-form').onsubmit=e=>{e.preventDefault();submit($('message').value);};$('message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit($('message').value);}};$('message').oninput=()=>$('char-count').textContent=$('message').value.length+' / 600';
try{gameType=sessionStorage.getItem('unfiled-active-mode')==='object'?'object':'detective';}catch{}start(gameType,true);
