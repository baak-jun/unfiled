export const providers = {
 raon:{name:'Raon',base:'https://raon-api.krafton.ai/v1',env:'RAON_API_KEY',model:'raon-1-mini-preview'},
 openai:{name:'OpenAI',base:'https://api.openai.com/v1',env:'OPENAI_API_KEY'},
 gemini:{name:'Gemini',base:'https://generativelanguage.googleapis.com/v1beta/openai',env:'GEMINI_API_KEY'},
 anthropic:{name:'Claude',base:'https://api.anthropic.com/v1',env:'ANTHROPIC_API_KEY'},
 deepseek:{name:'DeepSeek',base:'https://api.deepseek.com',env:'DEEPSEEK_API_KEY'},
 custom:{name:'Custom API',env:'AI_API_KEY'}
};
export function readConfig(env=process.env){
 const provider=(env.AI_PROVIDER||'raon').trim().toLowerCase();
 const preset=providers[provider];if(!preset)throw new Error('AI_PROVIDER must be raon, openai, gemini, anthropic, deepseek or custom.');
 const key=(env.AI_API_KEY||env[preset.env]||'').trim();
 const model=(env.AI_MODEL||preset.model||'').trim();
 if(key&&!model)throw new Error('Set AI_MODEL to a model ID available in your provider console.');
 const base=provider==='custom'?(env.AI_BASE_URL||'').trim():preset.base;
 if(provider==='custom'&&!base)throw new Error('Custom provider requires AI_BASE_URL, including the API version path.');
 if(provider!=='custom'&&env.AI_BASE_URL?.trim()&&env.AI_BASE_URL.trim().replace(/\/$/,'')!==base)throw new Error('AI_BASE_URL overrides are allowed only for AI_PROVIDER=custom.');
 const url=new URL(base);
 if(url.username||url.password||url.search||url.hash)throw new Error('AI_BASE_URL must not contain credentials, query parameters or fragments.');
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw new Error('Use HTTPS, or HTTP on localhost only.');
 const maxTokens=Number(env.AI_MAX_TOKENS||2048);
 if(!Number.isInteger(maxTokens)||maxTokens<128||maxTokens>8192)throw new Error('AI_MAX_TOKENS must be an integer from 128 to 8192.');
 return {provider,name:preset.name,key,model,base:url.href.replace(/\/$/,''),maxTokens};
}
export function requestFor(config,system,messages){
 const native=config.provider==='anthropic';
 // Claude conversations start with user; the NPC opening is context, not a synthetic user question.
 let conversation=messages.map(m=>({...m}));
 if(native&&conversation[0]?.role==='assistant'){system+='\n참고인의 첫 진술: '+conversation.shift().content;}
 const body=native?{model:config.model,system,messages:conversation,max_tokens:config.maxTokens}:
 {model:config.model,messages:[{role:'system',content:system},...conversation],[config.provider==='openai'?'max_completion_tokens':'max_tokens']:config.maxTokens};
 if(config.provider==='deepseek')body.thinking={type:'disabled'};
 const headers={'Content-Type':'application/json',...(native?{'x-api-key':config.key,'anthropic-version':'2023-06-01'}:{Authorization:`Bearer ${config.key}`})};
 return {url:config.base+(native?'/messages':'/chat/completions'),options:{method:'POST',headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(35000)}};
}
export async function complete(config,system,messages,fetcher=fetch){
 const request=requestFor(config,system,messages);
 const response=await fetcher(request.url,request.options);
 if(!response.ok){const error=new Error('Provider request failed');error.status=response.status;throw error;}
 const data=await response.json();
 const content=config.provider==='anthropic'?data.content?.filter(b=>b.type==='text').map(b=>b.text).join('\n'):data.choices?.[0]?.message?.content;
 if(typeof content!=='string'||!content.trim())throw new Error('Empty provider response');
 return content.trim().slice(0,2000);
}
