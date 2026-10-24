import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const [page,style,data,app]=await Promise.all(['src/page.html','src/style.css','src/data.js','src/app.js'].map(read));
const css=style.replace(/^@import[^\n]*\n/,'');
const js=data.replaceAll('export const ','const ').replaceAll('export function ','function ')+'\n'+app.replace(/^import .*?;\s*/,'');
const html=page.replace('<link rel="stylesheet" href="/src/style.css">',()=>`<style>\n${css}\n</style>`).replace('<script type="module" src="/src/app.js"></script>',()=>`<script>\n${js}\n</script>`);
await writeFile(new URL('index.html',root),html);
console.log('Built standalone index.html (no installation or server required).');
