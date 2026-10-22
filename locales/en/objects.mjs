import {objects as originals} from '../../objects.mjs';
export const answers=['Yes','No','I think so','I do not remember'];
const descriptions=[
 ['Umbrella',['folding umbrella'],'A manually opened folding umbrella carried in a bag. Fabric and metal ribs keep off the rain.'],
 ['Key',['house key'],'A small metal house key that fits in a pocket and opens a lock.'],
 ['Mug',['cup','coffee mug'],'A ceramic mug with a handle, used to hold drinks.'],
 ['Flashlight',['torch'],'A small battery-powered plastic flashlight that illuminates dark places.'],
 ['Scissors',['a pair of scissors','pair of scissors'],'Small scissors with metal blades and plastic handles, used to cut paper.'],
 ['Pencil',[],'A wooden pencil used to write on paper.'],
 ['Wristwatch',['watch','digital watch'],'A battery-powered plastic digital wristwatch that displays the time.'],
 ['Comb',['hair comb'],'A small plastic comb used to tidy hair.'],
 ['Toothbrush',['manual toothbrush'],'A manual plastic toothbrush used to clean teeth, not an electric one.'],
 ['Die',['dice','six-sided die'],'A plastic die marked with one to six dots, used in board games.'],
 ['Book',['novel','paperback'],'A printed paper novel that you open to read.'],
 ['Padlock',['lock'],'A small metal padlock opened with a key, used to secure a door or box.']
];
export const objects=originals.map((o,i)=>({...o,name:descriptions[i][0],aliases:[descriptions[i][0],...descriptions[i][1]],description:descriptions[i][2]}));
export const normalize=text=>text.normalize('NFKC').toLowerCase().replace(/[\s?!.,]/g,'');
export function isObjectGuess(target,text){
 const value=text.trim().toLowerCase().replace(/^(?:the answer is|is it|it is|it\u0027s)\s+/,'').replace(/^(?:a|an|the)\s+/,'');
 return target.aliases.some(a=>normalize(a)===normalize(value));
}
export function knownObjectAnswer(target,text){
 const q=text.toLowerCase().trim();
 if(isObjectGuess(target,q))return 'Yes';
 if(/\b(?:not|no|never|without|and|or|but)\b|n\u0027t/.test(q))return null;
 const rules=[[/\belectric(?:ity|al)?\b|\bbatter(?:y|ies)\b|\bcharg(?:e|ing)\b/,'electric'],[/\bedible\b|\bfood\b|\beat(?:en|ing)?\b/,'edible'],[/\bpocket\b/,'pocket'],[/\bportable\b|\bcarry\b|\bbag\b/,'portable'],[/\bmetal\b|\bsteel\b|\biron\b/,'metal'],[/\brain\b/,'rain'],[/\bwrite\b|\bwriting\b/,'writing'],[/\bcut\b|\bcutting\b/,'cutting'],[/\bdrink\b|\bdrinks\b|\bbeverage\b/,'drinking'],[/\btime\b/,'time'],[/\bschool\b/,'school']];
 const matches=rules.filter(([p])=>p.test(q));if(matches.length!==1)return null;
 const v=target.properties[matches[0][1]];return v===true?'Yes':v===false?'No':v==='maybe'?'I think so':'I do not remember';
}
export function parseObjectAnswer(raw){const value=raw.trim().replace(/[.]$/,'');return answers.find(a=>a.toLowerCase()===value.toLowerCase())||'I do not remember';}
