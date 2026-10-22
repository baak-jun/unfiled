const $=id=>document.getElementById(id);let state,busy=false,shownEnding=false;
const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
function storedId(){try{return sessionStorage.getItem('unfiled-session');}catch{return null;}}
function saveId(id){try{sessionStorage.setItem('unfiled-session',id);}catch{}}
async function api(route,data){const r=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw new Error(result.error||'연결을 확인해 주세요.');return result;}
function lock(value){busy=value;document.querySelectorAll('button').forEach(b=>{if(!b.dataset.close&&b.id!=='help')b.disabled=value;});if(!value&&state){$('hint').disabled=state.hints===0||state.complete;$('send').disabled=state.complete;$('message').disabled=state.complete;document.querySelectorAll('[data-question]').forEach(b=>b.disabled=state.complete);}}
function render(){
 $('case-title').textContent=state.title;$('scene-location').textContent=state.location;$('scene-time').textContent=state.time;$('name').textContent=state.name;$('role').textContent=state.role;$('case-no').textContent='CASE / '+state.caseNumber;$('object').textContent=state.object;$('intro-quote').textContent='“'+state.messages[0].text+'”';$('chat-name').textContent=state.name+' / 진술 기록';$('mode-label').textContent=state.mode==='ai'?state.provider+' 모드':'시나리오 데모';$('turns').textContent='질문 '+String(state.turns).padStart(2,'0');
 $('privacy').textContent=state.mode==='ai'?'AI 모드 · 진술이 '+state.provider+' API로 전송됩니다.':'데모 · 대화는 서버 메모리에만 임시 보관됩니다.';
 document.querySelector('.live-dot').textContent=state.complete?'해결':'미해결';
 const log=$('messages');log.replaceChildren(el('p','chat-day','— RECORDING STARTED / 진술 채록 —'));
 for(const m of state.messages){const row=el('div','message '+m.role);if(m.role==='system'){row.textContent=m.text;}else{if(m.role==='assistant')row.append(el('span','avatar',state.name.slice(0,1)));const wrap=el('div','message-content');if(m.role==='assistant')wrap.append(el('span','speaker',state.name));wrap.append(el('div','bubble',m.text));row.append(wrap);}log.append(row);}log.scrollTop=log.scrollHeight;
 $('progress').value=state.solved.length;$('progress-text').textContent=Math.round(state.solved.length/3*100)+'%';
 $('clues').replaceChildren();state.categories.forEach((c,i)=>{const solved=state.solved.find(s=>s.slot===i),b=el('button','clue'+(solved?' solved':''));b.append(el('span','clue-number',solved?'✓':'0'+(i+1)));const t=el('span');t.append(el('strong','',c.title),el('small','',solved?c.options[solved.choice]:'미확인 / 추리 제출'));b.append(t,el('span','clue-arrow',solved?'':'＋'));b.setAttribute('aria-label',c.title+(solved?' 확인 완료':' 추리하기'));b.onclick=()=>{if(solved){$('feedback').textContent='이미 확정된 사실입니다.';return;}openGuess(i);};$('clues').append(b);});
 $('hint').replaceChildren(document.createTextNode('추가 단서 요청 '),el('span','',String(state.hints)));
 if(state.complete&&!shownEnding){shownEnding=true;$('ending-text').textContent='“'+state.ending+'”';$('reflection-text').textContent=state.reflection;$('ending-dialog').showModal();}
}
function openGuess(slot){if(busy)return;const c=state.categories[slot];$('guess-title').textContent=c.question;$('guess-options').replaceChildren();c.options.forEach((o,choice)=>{const b=el('button','',o);b.onclick=async()=>{$('guess-dialog').close();await action('guess',{slot,choice});};$('guess-options').append(b);});$('guess-dialog').showModal();}
async function action(route,data={}){if(busy||!state)return false;lock(true);$('feedback').textContent=route==='chat'?'진술을 기다리는 중…':'';try{state=await api(route,{id:state.id,...data});render();$('feedback').textContent='';return true;}catch(e){$('feedback').textContent=e.message;return false;}finally{lock(false);}}
async function start(resume=false){if(busy)return;lock(true);$('feedback').textContent='사건 파일을 불러오는 중…';try{
 const id=resume?storedId():null;if(id){try{state=await api('state',{id});}catch{state=await api('start',{});}}else state=await api('start',{previousId:state?.id});
 shownEnding=false;$('message').value='';$('char-count').textContent='0 / 600';saveId(state.id);render();$('feedback').textContent='';
 }catch(e){$('feedback').textContent=e.message;}finally{lock(false);}}
async function submit(text){if(!text.trim()||busy)return;const ok=await action('chat',{text:text.trim()});if(ok){$('message').value='';$('char-count').textContent='0 / 600';if(!state.complete)$('message').focus();}}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('help').onclick=()=>$('help-dialog').showModal();$('hint').onclick=()=>action('hint');$('restart').onclick=()=>{if(!state||state.complete||confirm('현재 사건을 닫고 새로운 사건을 시작할까요?'))start();};$('next-case').onclick=()=>{$('ending-dialog').close();start();};
document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>submit(b.dataset.question));$('chat-form').onsubmit=e=>{e.preventDefault();submit($('message').value);};$('message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit($('message').value);}};$('message').oninput=()=>$('char-count').textContent=$('message').value.length+' / 600';start(true);

$('key-help').onclick=()=>$('key-dialog').showModal();
