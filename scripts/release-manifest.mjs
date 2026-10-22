import {readdir,readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
const root=process.argv[2];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if((await stat(root)).isFile()){console.log(hash(await readFile(root)));}
else{
 const files=[];
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())await walk(path);else if(e.name!=='MANIFEST.json'){const data=await readFile(path);files.push({path:relative(root,path).replaceAll('\\','/'),bytes:data.length,sha256:hash(data)});}}}
 await walk(root);files.sort((a,b)=>a.path.localeCompare(b.path));
 await writeFile(join(root,'MANIFEST.json'),JSON.stringify(files,null,2)+'\n');
}
