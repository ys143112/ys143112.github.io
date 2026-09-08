import type { APIContext } from 'astro';
import { getPosts } from '../../lib/posts';
export async function getStaticPaths(){ return (await getPosts()).map(post=>({params:{id:post.data.id},props:{title:post.data.title,category:post.data.category}})); }
const escape=(value:string)=>value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export function GET({props}:APIContext){
  const title=String(props.title), chunks=title.match(/.{1,17}/gu)?.slice(0,3) || [title];
  const lines=chunks.map((line,i)=>`<text x="90" y="${330+i*90}" fill="white" font-size="66" font-weight="700">${escape(line)}</text>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#234cec"/><g font-family="Noto Sans KR, sans-serif"><text x="90" y="125" fill="#ccd5ff" font-size="25">${escape(String(props.category))}</text>${lines}<path d="M90 660H1110" stroke="#8fa5ff"/><text x="90" y="725" fill="white" font-size="25">FORM → CODE</text></g></svg>`;
  return new Response(svg,{headers:{'Content-Type':'image/svg+xml; charset=utf-8'}});
}
