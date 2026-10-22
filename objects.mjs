export const answers=['맞다','아니다','그랬던 것 같다','기억이 나지 않는다'];
// Properties describe the particular imagined item, not every possible version of its category.
const item=(id,name,aliases,description,properties)=>({id,name,aliases:[name,...aliases],description,properties});
export const objects=[
 item('umbrella','우산',['접이식 우산','접이식우산'],'접어서 가방에 넣는 수동 우산. 비를 막는 천과 금속 살대가 있다.',{electric:false,edible:false,portable:true,pocket:false,metal:true,rain:true,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('key','열쇠',['집열쇠','집 열쇠'],'주머니에 들어가는 작은 금속 집 열쇠. 자물쇠를 연다.',{electric:false,edible:false,portable:true,pocket:true,metal:true,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('mug','머그컵',['컵','머그','머그 컵'],'손잡이가 있는 도자기 머그컵. 음료를 담는다.',{electric:false,edible:false,portable:true,pocket:false,metal:false,rain:false,writing:false,cutting:false,drinking:true,time:false,school:'maybe'}),
 item('torch','손전등',['플래시','후레쉬','랜턴'],'배터리를 사용하는 작은 플라스틱 손전등. 어둠을 밝힌다.',{electric:true,edible:false,portable:true,pocket:true,metal:false,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('scissors','가위',[],'금속 날과 플라스틱 손잡이를 가진 작은 가위. 종이를 자른다.',{electric:false,edible:false,portable:true,pocket:true,metal:true,rain:false,writing:false,cutting:true,drinking:false,time:false,school:true}),
 item('pencil','연필',[],'나무 몸체의 연필. 종이에 글씨를 쓴다.',{electric:false,edible:false,portable:true,pocket:true,metal:false,rain:false,writing:true,cutting:false,drinking:false,time:false,school:true}),
 item('watch','손목시계',['시계','손목 시계'],'배터리로 작동하는 플라스틱 전자 손목시계. 시간을 표시한다.',{electric:true,edible:false,portable:true,pocket:true,metal:false,rain:false,writing:false,cutting:false,drinking:false,time:true,school:'maybe'}),
 item('comb','빗',['머리빗','머리 빗'],'작은 플라스틱 빗. 머리카락을 정돈한다.',{electric:false,edible:false,portable:true,pocket:true,metal:false,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('toothbrush','칫솔',['수동 칫솔','수동칫솔'],'전동이 아닌 플라스틱 칫솔. 이를 닦는다.',{electric:false,edible:false,portable:true,pocket:true,metal:false,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('dice','주사위',['육면체 주사위'],'1부터 6까지 점이 있는 플라스틱 주사위. 보드게임에 사용한다.',{electric:false,edible:false,portable:true,pocket:true,metal:false,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('book','책',['종이책','종이 책'],'종이에 인쇄된 소설책. 펼쳐서 읽는다.',{electric:false,edible:false,portable:true,pocket:false,metal:false,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'}),
 item('lock','자물쇠',['자물쇠 잠금장치'],'열쇠로 여는 작은 금속 자물쇠. 문이나 상자를 잠근다.',{electric:false,edible:false,portable:true,pocket:true,metal:true,rain:false,writing:false,cutting:false,drinking:false,time:false,school:'maybe'})
];
export const normalize=text=>text.normalize('NFKC').toLowerCase().replace(/[\s?!.,。？！]/g,'');
export function isObjectGuess(target,text){
 const value=normalize(text).replace(/^정답은/,'').replace(/(인가요|입니까|입니다|이야|야|일까|인가|이다)$/,'');
 return target.aliases.some(alias=>normalize(alias)===value);
}
export function knownObjectAnswer(target,text){
 const q=normalize(text);
 if(target.aliases.some(a=>q===normalize(a)||q===normalize(a)+'인가요'||q===normalize(a)+'입니까'))return '맞다';
 // Negation, compound questions and unknown details go to the model (or explicit unknown in demo).
 if(/않|아닌|아니|없|말고|거나|그리고|면서|인지.*인지/.test(q))return null;
 const rules=[[/전기|배터리|건전지|충전|전동/,'electric'],[/먹을|먹는|음식|식용/,'edible'],[/주머니/,'pocket'],[/가방|휴대|들고다|가지고다/,'portable'],[/금속|쇠로|철로/,'metal'],[/비를막|비올때|비오는날/,'rain'],[/글씨|필기|글을쓰/,'writing'],[/자르는|자르|절단/,'cutting'],[/음료|물을담|마실때/,'drinking'],[/시간|시각/,'time'],[/학교/,'school']];
 const matches=rules.filter(([pattern])=>pattern.test(q));
 if(matches.length!==1)return null;
 const v=target.properties[matches[0][1]];
 return v===true?'맞다':v===false?'아니다':v==='maybe'?'그랬던 것 같다':'기억이 나지 않는다';
}
export function parseObjectAnswer(raw){
 const value=raw.trim().replace(/[.。]$/,'');
 return answers.includes(value)?value:'기억이 나지 않는다';
}
