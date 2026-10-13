(function(global){
"use strict";
// Reader-side story codex; owned skills/equipment/NPCs remain narrative resources,
// not scores. Commands prepare text for the user; only the user confirms an action.
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn=(label,cmd)=>'<button class="codex-action" data-do="'+esc(cmd)+'">'+esc(label)+'</button>';
const action=(kind,id)=>"insert:"+kind+":"+encodeURIComponent(String(id));
function character(s,m){
 const name=s.profile?.name||"未命名人物";
 const bloodline=(global.NW_DATA?.bloodlines||[]).find(x=>x.id===s.profile?.bloodline);
 const known=(m.history||[]).slice(-3);
 return '<div class="codex-section"><h3>'+esc(name)+'</h3><p>你係呢段故事嘅主角。人物嘅能力、經歷同選擇會改變後續情節，而唔係用一堆數值做門檻。</p>'+
 (bloodline?'<p><strong>血脈：</strong>'+esc(bloodline.name)+'</p>':"")+
 '<p><strong>最近決定</strong></p>'+
 (known.length?known.map(x=>'<p class="codex-memory">'+esc(x.action)+'</p>').join(""):'<p>呢個世界仲未有行動紀錄。</p>')+'</div>';
}
function skills(s){
 const D=global.NW_DATA,ids=new Set(s.learned||[]);
 const list=(D.skills||[]).filter(x=>ids.has(x.id));
 return '<div class="codex-section"><h3>已學技能</h3><p>技能會令某啲故事行動合理可行。唔需要體力、MP 或配招點數；技能是否奏效取決於劇情。</p>'+
 (list.length?list.map(x=>'<div class="codex-row"><div><strong>'+esc(x.name)+'</strong><p>'+esc(x.desc||x.school||"")+'</p></div>'+btn("用在下一步",action("skill",x.id))+'</div>').join(""):'<p>尚未學會任何技能。</p>')+'</div>';
}
function equipment(s,m){
 const D=global.NW_DATA,gear=s.loadout||{},warehouse=s.warehouse||{};
 const carry=new Set([...(gear.backpack||[]),gear.weapon,gear.offhand,gear.armor,gear.accessory].filter(Boolean));
 const available=(D.items||[]).filter(x=>carry.has(x.id)||Number(warehouse[x.id])>0);
 const weapons=available.filter(x=>x.type==="weapon");
 const objects=available.filter(x=>x.type!=="weapon");
 const line=(x,isWeapon)=>'<div class="codex-row"><div><strong>'+esc(x.name)+(gear.weapon===x.id?' · 隨身武器':"")+'</strong><p>'+esc(x.desc||"")+'</p></div><div class="codex-row-actions">'+
 (isWeapon?btn(gear.weapon===x.id?"已攜帶":"改用此武器","codexArm:"+encodeURIComponent(x.id)):(carry.has(x.id)?btn("使用此物",action("item",x.id)):btn("帶在身上","codexCarry:"+encodeURIComponent(x.id))))+
 '</div></div>';
 return '<div class="codex-section"><h3>武器</h3><p>可以喺故事中拔刀、防衛、威嚇或者交出武器，但唔需要傷害數值結算。</p>'+
 (weapons.map(x=>line(x,true)).join("")||'<p>未有武器。</p>')+
 '<h3>物品與線索</h3>'+(objects.map(x=>line(x,false)).join("")||'<p>未有物品。</p>')+'</div>';
}
function npcs(s,m){
 const known=new Map();
 for(const p of m.crew||[])if(p?.name)known.set(p.name,{name:p.name,relationship:"同行角色",memory:p.bio||p.role||"",available:true});
 if(m.rival?.name)known.set(m.rival.name,{name:m.rival.name,relationship:"對立角色",memory:m.rival.role||"",available:true});
 for(const [name,n] of Object.entries(m.npcMemory||{}))known.set(name,{
  ...known.get(name),name,relationship:n.attitude||known.get(name)?.relationship||"認識的人",
  memory:n.memory||known.get(name)?.memory||"",goal:n.goal||"",available:true});
 for(const [name,n] of Object.entries(m.storyBible?.characters||{}))known.set(name,{
  ...known.get(name),name,location:n.location||known.get(name)?.location||"",
  memory:known.get(name)?.memory||n.condition||"",available:true});
 const others=(global.NW_DATA?.companions||[]).filter(c=>![...known.values()].some(p=>p.name===c.name));
 return '<div class="codex-section"><h3>故事人物</h3><p>NPC 會記住互動與人際關係；佢哋有自己嘅目的，不會只係每章一次性出場。</p>'+
 ([...known.values()].map(n=>'<div class="codex-row"><div><strong>'+esc(n.name)+'</strong><p>'+esc(n.relationship||"")+
 (n.goal?' · 目的：'+esc(n.goal):"")+'</p><p>'+esc(n.memory||n.location||"正在了解對方")+'</p></div>'+
 btn("與佢互動",action("npc",n.name))+'</div>').join("")||'<p>故事中尚未遇到重要人物。</p>')+
 (others.length?'<h3>其他輪迴者</h3>'+others.map(n=>'<p class="codex-memory">'+esc(n.name)+' · '+esc(n.temper||n.role||"")+'（未同行）</p>').join(""):"")+'</div>';
}
function render(s,m,tab){
 if(!m)return "";
 const tabs=[["character","人物"],["skills","技能"],["gear","武器與道具"],["npcs","NPC"]];
 const body=tab==="skills"?skills(s):tab==="gear"?equipment(s,m):tab==="npcs"?npcs(s,m):character(s,m);
 return '<div class="mission-popup literary-codex" role="dialog" aria-label="角色與世界手冊">'+
 '<div class="codex-heading"><h2>人物與世界</h2>'+btn("關閉","codexClose")+'</div>'+
 '<nav class="codex-tabs">'+tabs.map(([id,label])=>'<button data-do="codexTab:'+id+'" class="'+(tab===id?"active":"")+'">'+label+'</button>').join("")+'</nav>'+
 '<div class="codex-body">'+body+'</div><p class="codex-hint">選「用在下一步」只會幫你準備一段行動文字，唔會代你執行。你可以自己修改，再確認。</p></div>';
}
global.NW_CODEX={render};
})(window);
