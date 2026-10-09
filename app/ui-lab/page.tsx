'use client'

import { useEffect, useRef, useState } from 'react'
import './ui-lab.css'

type IconName = 'globe'|'scroll'|'spark'|'bag'|'users'|'moon'|'chevron'|'arrow'|'shield'|'heart'|'eye'|'menu'|'close'|'home'|'send'|'settings'|'clock'|'book'|'check'|'lock'|'plus'|'bolt'|'feather'|'sword'|'search'|'star'|'back'|'play'|'warning'|'repeat'|'info'
type Section = 'nexus'|'story'
type Drawer = 'missions'|'enhance'|'bag'|'allies'|'rest'|'settings'|'worlds'|'journal'|null
type Genre = 'horror'|'gothic'|'wuxia'|'scifi'
type Tone = 'normal'|'tension'|'shock'|'grief'|'resolve'
type Segment = {type:'prose'|'voice'|'impact'|'alert'|'aside';text:string;name?:string;mood?:string}
type Chapter={title:string;place:string;clock:string;tone:Tone;segments:Segment[];options:string[]}
const icons:Record<IconName,React.ReactNode>={
 globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18"/></>,
 scroll:<><path d="M6 3h12v14a4 4 0 0 1-4 4H5a3 3 0 0 1-3-3V7h4"/><path d="M6 3v15M9 8h6M9 12h6"/></>,
 spark:<><path d="M12 2 14.6 9.4 22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z"/></>,
 bag:<><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2M4 12h16"/></>,
 users:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/></>,
 moon:<><path d="M20.5 14a8.5 8.5 0 0 1-10.5-10.5A8.5 8.5 0 1 0 20.5 14Z"/></>,
 chevron:<path d="m9 5 7 7-7 7"/>,
 arrow:<><path d="M3 12h18m-7-7 7 7-7 7"/></>,
 shield:<><path d="M12 2 3.5 6v6.5c0 5 3.5 8 8.5 9.5 5-1.5 8.5-4.5 8.5-9.5V6L12 2Z"/><path d="m9 12 2 2 4-4"/></>,
 heart:<path d="M20.8 5.8a5.2 5.2 0 0 0-7.3 0L12 7.3l-1.5-1.5a5.2 5.2 0 0 0-7.3 7.3L12 22l8.8-8.9a5.2 5.2 0 0 0 0-7.3Z"/>,
 eye:<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="2.8"/></>,
 menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
 close:<path d="M5 5 19 19M19 5 5 19"/>,
 home:<><path d="m3 10 9-7 9 7v10H3V10Z"/><path d="M9 20v-7h6v7"/></>,
 send:<><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M19 13.8 21 15l-2 3.5-2.3-1a7 7 0 0 1-2.7 1.6l-.3 2.5h-4l-.3-2.5a7 7 0 0 1-2.7-1.6l-2.3 1L2.4 15l2-1.2a7 7 0 0 1 0-3.6l-2-1.2 2-3.5 2.3 1a7 7 0 0 1 2.7-1.6l.3-2.5h4l.3 2.5a7 7 0 0 1 2.7 1.6l2.3-1 2 3.5-2 1.2a7 7 0 0 1 0 3.6Z"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
 book:<><path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/></>,
 check:<path d="m4 12 5 5 11-11"/>,
 lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
 plus:<path d="M12 4v16M4 12h16"/>,
 bolt:<path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z"/>,
 feather:<><path d="M20 4c-6-2-13 1-13 9v7m0 0 12-12M4 21l9-9"/></>,
 sword:<><path d="m20 3-9 9 2 2 9-9-2-2ZM4 20l7-7M4 14l6 6M2 16l6 6"/></>,
 search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 6 6"/></>,
 star:<path d="m12 2 3 6.6 7 .7-5.3 4.8 1.6 7-6.3-3.6-6.3 3.6 1.6-7L2 9.3l7-.7L12 2Z"/>,
 back:<path d="M20 12H4m7-7-7 7 7 7"/>,
 play:<path d="m8 5 11 7-11 7V5Z"/>,
 warning:<><path d="m12 2 10 19H2L12 2Z"/><path d="M12 9v5M12 17h.01"/></>,
 repeat:<><path d="M20 7H7a4 4 0 0 0-4 4m0-4v4h4M4 17h13a4 4 0 0 0 4-4m0 4v-4h-4"/></>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>
}
function Icon({name,size=18,className=''}:{name:IconName;size?:number;className?:string}){return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>}

const WORLDS:{genre:Genre;name:string;sub:string;art:string;icon:IconName;unlocked:boolean}[]=[
 {genre:'horror',name:'生化危機',sub:'2002 · 科幻恐怖',art:'THE HIVE',icon:'warning',unlocked:true},
 {genre:'gothic',name:'Van Helsing',sub:'2004 · 哥德奇幻',art:'TRANSYLVANIA',icon:'moon',unlocked:false},
 {genre:'wuxia',name:'風雲雄霸天下',sub:'1998 · 武俠奇幻',art:'天下會',icon:'sword',unlocked:false},
 {genre:'scifi',name:'未知的第四世界',sub:'輪迴序列 · 尚未揭曉',art:'?',icon:'lock',unlocked:false},
]
const TONES:Tone[]=['normal','tension','shock','grief','resolve']
const toneLabels:Record<Tone,string>={normal:'平靜',tension:'緊張',shock:'驚嚇',grief:'悲傷',resolve:'決意'}
const STORIES:Record<Genre,Record<Tone,Chapter>>={
 horror:{
 normal:{title:'入侵者',place:'蜂巢 · B1 地下長廊',clock:'21:46',tone:'normal',segments:[{type:'aside',text:'【蜂巢系統】基地警戒等級：黃色'},{type:'prose',text:'電梯門緩緩打開。冷白色嘅燈光一盞接住一盞，延伸至睇唔到盡頭嘅走廊。空氣有股淡淡嘅消毒藥水味。'},{type:'voice',name:'Alice',mood:'疑惑',text:'「呢度好安靜……你覺唔覺得安靜得有啲奇怪？」'},{type:'prose',text:'你見到遠處保安門上閃爍住一個紅色指示燈。'}],options:['先同 Alice 確認隊伍現況','走向控制台查看封鎖紀錄','留喺原地觀察走廊']},
 tension:{title:'有人喺另一邊',place:'蜂巢 · B2 隔離通道',clock:'22:03',tone:'tension',segments:[{type:'aside',text:'【系統】不明聲源 · 距離 12 米'},{type:'prose',text:'走廊盡頭嘅燈閃咗兩下，然後熄滅。'},{type:'impact',text:'……咚。'},{type:'prose',text:'第二下撞擊聲近咗。Rain 停低腳步，慢慢舉起手槍。你發現佢連呼吸都放得極輕。'},{type:'voice',name:'Rain',mood:'恐懼',text:'「唔好出聲。有嘢喺門後面。」'}],options:['示意 Rain 後退並保持安靜','關閉手電筒，聽清楚聲音來源','尋找旁邊可以躲藏嘅位置']},
 shock:{title:'封鎖失效',place:'蜂巢 · B2 隔離通道',clock:'22:04',tone:'shock',segments:[{type:'alert',text:'警告 · 生物隔離門異常開啟'},{type:'prose',text:'門框猛然向外扭曲，一股腐臭嘅熱氣撲面而來。'},{type:'impact',text:'砰！！！'},{type:'prose',text:'金屬門成塊飛咗出去，喺地上劃出刺耳聲響。紅色警示燈瘋狂閃爍。'},{type:'voice',name:'Rain',mood:'驚恐',text:'「走！即刻走！」'}],options:['立即撲向右邊安全門','拉住 Rain 一齊撤退','倒退並觀察闖入者嘅動作']},
 grief:{title:'沒有人回答',place:'蜂巢 · 逃生列車',clock:'23:17',tone:'grief',segments:[{type:'aside',text:'【通訊狀態】最後訊號已中斷'},{type:'prose',text:'列車穿過漆黑嘅隧道，車廂入面只剩下輪軌震動嘅聲音。'},{type:'prose',text:'你低頭望住手中嗰張沾咗血嘅身份牌，突然發現自己連對方最後一句說話都記唔清楚。'},{type:'voice',name:'Alice',mood:'悲傷',text:'「我哋真係盡咗力……係咪？」'},{type:'aside',text:'有啲問題，唔會因為完成任務就有答案。'}],options:['坐低陪 Alice，暫時唔講嘢','將身份牌收好，記錄佢嘅名字','告訴 Alice，仲有其他人需要我哋']},
 resolve:{title:'最後一道門',place:'蜂巢 · 地面出口',clock:'23:39',tone:'resolve',segments:[{type:'aside',text:'【任務】地面撤離 · 最後階段'},{type:'prose',text:'出口只剩幾步之遙。身後嘅倒數聲一秒一秒逼近。'},{type:'prose',text:'Alice 停低腳步，回頭望向仍然鎖住嘅另一條通道。你知道嗰邊可能仲有人等緊。'},{type:'voice',name:'Alice',mood:'堅定',text:'「如果你願意返去，我會同你一齊。」'}],options:['同 Alice 返回通道救人','留下準備撤退嘅安全路線','先確認閘門倒數仲有幾多時間']}
 },
 gothic:{
 normal:{title:'教廷的密令',place:'梵蒂岡 · 兵器室',clock:'暮色將至',tone:'normal',segments:[{type:'aside',text:'【主神】世界二 · 哥德奇幻'},{type:'prose',text:'古老石牆上，蠟燭嘅火光照亮整排銀製武器。遠處鐘聲慢慢響起。'},{type:'voice',name:'Carl',mood:'期待',text:'「你就係新嚟嘅幫手？好，至少今次有人識得睇說明書。」'},{type:'prose',text:'一封印住 Valerious 家族徽章嘅信，正放喺桌面中央。'}],options:['向 Carl 詢問任務詳情','閱讀封印信件','檢查銀弩及其他裝備']},
 tension:{title:'血月之前',place:'特蘭西瓦尼亞 · 山谷',clock:'午夜前夕',tone:'tension',segments:[{type:'aside',text:'【異常】夜行生物正在靠近'},{type:'prose',text:'霧濛住整條村路。Anna 嘅箭搭咗上弦，卻遲遲冇放。'},{type:'impact',text:'沙……沙……'},{type:'voice',name:'Anna',mood:'警戒',text:'「噓。佢哋喺等我哋行錯一步。」'}],options:['同 Anna 伏低尋找掩護','檢查教廷銀器是否可用','試探聲音來自山坡邊度']},
 shock:{title:'城堡大門',place:'德古拉城堡 · 正廳',clock:'午夜',tone:'shock',segments:[{type:'alert',text:'警告 · 不明超自然反應'},{type:'prose',text:'整排蠟燭喺同一瞬間熄滅。頭頂傳來石塊崩裂嘅巨響。'},{type:'impact',text:'轟——！'},{type:'voice',name:'Anna',mood:'恐懼',text:'「退後！門後面唔係人！」'}],options:['拔出銀器保護 Anna','朝側門撤退','呼叫 Van Helsing 支援']},
 grief:{title:'沉默的誓言',place:'Valerious 家族墓園',clock:'黎明',tone:'grief',segments:[{type:'prose',text:'第一縷日光落喺墓碑上，風將 Anna 嘅披肩輕輕吹起。'},{type:'prose',text:'佢一直冇講嘢。你知道一個家族幾百年嘅負擔，唔會喺一夜之間消失。'},{type:'voice',name:'Anna',mood:'悲傷',text:'「如果一切可以重新開始……我只想佢有個普通嘅人生。」'}],options:['安靜陪伴 Anna','問佢仲有冇其他心願','將家族信件交返畀佢']},
 resolve:{title:'破曉時分',place:'冰封城堡 · 最後通道',clock:'將近黎明',tone:'resolve',segments:[{type:'prose',text:'德古拉嘅城堡開始震動。銀色晨光穿過高窗，照亮 Anna 手中嘅最後一支弩箭。'},{type:'voice',name:'Van Helsing',mood:'堅定',text:'「今次，唔會再由佢決定我哋嘅命運。」'},{type:'aside',text:'【世界線】關鍵抉擇即將到來'}],options:['與 Van Helsing 合作','護送 Anna 去安全位置','先尋找解咒藥劑']}
 },
 wuxia:{
 normal:{title:'天下會來客',place:'天下會 · 山門',clock:'午時',tone:'normal',segments:[{type:'aside',text:'【江湖紀事】風雲未變'},{type:'prose',text:'山風拂過石階，天下會旗幟迎風飛揚。遠處傳來弟子練武嘅喝聲。'},{type:'voice',name:'秦霜',mood:'平靜',text:'「江湖路遠。閣下既然到咗山門，不如先說明來意。」'},{type:'prose',text:'你望見山頂大殿嘅屋簷，知道有場風波正慢慢逼近。'}],options:['向秦霜表明來意','打聽聶風同雲師兄近況','先觀察天下會守衛部署']},
 tension:{title:'風起之前',place:'天下會 · 內院',clock:'黃昏',tone:'tension',segments:[{type:'aside',text:'【命數】殺局正逐漸成形'},{type:'prose',text:'院內忽然靜得出奇。步驚雲背對住你企喺廊下，指節握得發白。'},{type:'impact',text:'鏘——'},{type:'voice',name:'步驚雲',mood:'憤怒',text:'「你話雄霸早有安排……證據呢？」'}],options:['出示所掌握嘅密令','勸步驚雲先冷靜','去搵秦霜作證']},
 shock:{title:'婚宴之變',place:'天下會 · 喜堂',clock:'入夜',tone:'shock',segments:[{type:'alert',text:'【警示】原定劇情正在改變'},{type:'prose',text:'滿堂喜字忽然被狂風撕裂。劍光掠過眾人頭頂，杯盤盡碎。'},{type:'impact',text:'錚！'},{type:'voice',name:'孔慈',mood:'驚恐',text:'「住手！你哋唔好再打！」'}],options:['即刻帶孔慈離開','嘗試隔開風雲二人','阻止雄霸繼續挑撥']},
 grief:{title:'落花無聲',place:'天下會 · 後園',clock:'深夜',tone:'grief',segments:[{type:'prose',text:'一片花瓣隨風落到石階。你忽然發覺，江湖中最難挽回嘅未必係敗陣。'},{type:'voice',name:'聶風',mood:'悲傷',text:'「如果我早啲講清楚，今日會唔會唔同？」'},{type:'aside',text:'有時候，一句說話已經太遲。'}],options:['安慰聶風','整理孔慈留下嘅信件','尋找仍然可以補救嘅辦法']},
 resolve:{title:'風雲際會',place:'劍塚 · 懸崖',clock:'破曉',tone:'resolve',segments:[{type:'prose',text:'山嵐翻湧，風與雲終於並肩而立。你望向前方孤峰，見到雄霸已經等待多時。'},{type:'voice',name:'聶風',mood:'堅定',text:'「呢次，我哋唔會再畀人利用。」'},{type:'aside',text:'【主神】最終抉擇已開啟'}],options:['協助風雲合擊','保護後方傷者','查找雄霸留下嘅退路']}
 },
 scifi:{
 normal:{title:'星際信號',place:'未知星艦 · 觀測甲板',clock:'船時 04:12',tone:'normal',segments:[{type:'aside',text:'【系統】深空航行 · 穩定'},{type:'prose',text:'觀測窗外係一片無邊黑暗。遠處一道淡藍色訊號，正喺星圖上緩緩閃動。'},{type:'voice',name:'導航系統',mood:'平靜',text:'「未知來源訊號已鎖定。是否開始解碼？」'}],options:['解碼未知訊號','檢查星艦狀態','通知值班船員']},
 tension:{title:'訊號中斷',place:'未知星艦 · 通訊艙',clock:'船時 04:15',tone:'tension',segments:[{type:'alert',text:'【WARNING】通訊延遲異常'},{type:'prose',text:'星圖上嘅藍色光點突然分裂成三個。你聽見耳機裏傳出微弱而重複嘅敲擊聲。'},{type:'impact',text:'· · · ——'},{type:'voice',name:'導航系統',mood:'疑惑',text:'「偵測到與本艦相同嘅識別碼。」'}],options:['追蹤第二個識別碼','關閉外部通訊','召集工程人員']},
 shock:{title:'警報',place:'未知星艦 · 核心機房',clock:'船時 04:16',tone:'shock',segments:[{type:'alert',text:'【CRITICAL】反應爐隔離失敗'},{type:'prose',text:'艙室猛然傾斜。所有顯示器瞬間變成警示紅色。'},{type:'impact',text:'警報！'},{type:'voice',name:'導航系統',mood:'恐懼',text:'「反應爐核心正在失去控制！」'}],options:['立即切斷反應爐','衝去救受困工程師','啟動緊急撤離程序']},
 grief:{title:'星圖上的名字',place:'未知星艦 · 紀念艙',clock:'船時 09:20',tone:'grief',segments:[{type:'prose',text:'所有失聯者嘅名字，一個一個出現喺觀測窗旁。'},{type:'prose',text:'你伸手掂住冷冰冰嘅艙壁，想起最後一段冇人回覆嘅訊息。'},{type:'voice',name:'導航系統',mood:'悲傷',text:'「我已經保存咗佢哋最後嘅聲音。」'}],options:['重聽最後訊息','為失聯者留下記錄','返回駕駛艙']},
 resolve:{title:'重新啟航',place:'未知星艦 · 駕駛艙',clock:'船時 09:42',tone:'resolve',segments:[{type:'prose',text:'引擎微微震動。星圖重新亮起，遠方一道光帶慢慢延伸至視野之外。'},{type:'voice',name:'導航系統',mood:'堅定',text:'「所有系統重新上線。請確認航行目標。」'},{type:'aside',text:'【MISSION】下一段旅程正在等待'}],options:['設定新航線','聯絡剩餘隊員','檢查星艦可用資源']}
 }
}
const FEATURE:{key:NonNullable<Drawer>;label:string;small:string;icon:IconName}[]=[
 {key:'worlds',label:'世界傳送',small:'前往輪迴電影世界',icon:'globe'},
 {key:'missions',label:'任務與結算',small:'主線 · 支線 · 獎勵',icon:'scroll'},
 {key:'enhance',label:'主神強化',small:'能力 · 血統 · 兌換',icon:'spark'},
 {key:'bag',label:'裝備背包',small:'物品與特殊線索',icon:'bag'},
 {key:'allies',label:'同伴與關係',small:'NPC 記憶與信任',icon:'users'},
 {key:'rest',label:'私人休息室',small:'治療 · 休整 · 存檔',icon:'moon'},
]
export default function UILabPage(){
 const [section,setSection]=useState<Section>('nexus')
 const [drawer,setDrawer]=useState<Drawer>(null)
 const [genre,setGenre]=useState<Genre>('horror')
 const [tone,setTone]=useState<Tone>('tension')
 const [choiceIndex,setChoiceIndex]=useState<number|null>(null)
 const [typed,setTyped]=useState('')
 const [history,setHistory]=useState<string[]>([])
 const [points,setPoints]=useState(650)
 const [hp,setHp]=useState(78)
 const [sp,setSp]=useState(64)
 const [tab,setTab]=useState<'overview'|'archive'>('overview')
 const [quiet,setQuiet]=useState(false)
 const [notice,setNotice]=useState('')
 const [level,setLevel]=useState(3)
 const [itemEquipped,setItemEquipped]=useState(false)
 const [showGuide,setShowGuide]=useState(true)
 const [animateText,setAnimateText]=useState(true)
 const [storyPage,setStoryPage]=useState(0)
 const [compactReading,setCompactReading]=useState(false)
 const panelRef=useRef<HTMLDivElement>(null)
 const chapter=STORIES[genre][tone]
 const pageSize=compactReading?1:2
 const segmentPages=Array.from({length:Math.ceil(chapter.segments.length/pageSize)},(_,i)=>chapter.segments.slice(i*pageSize,(i+1)*pageSize))
 const page=Math.min(storyPage,Math.max(0,segmentPages.length-1))
 const visibleSegments=segmentPages[page]||[]
 useEffect(()=>{setChoiceIndex(null);setHistory([]);setTyped('');setStoryPage(0)},[genre,tone])
 useEffect(()=>{const check=()=>setCompactReading(window.innerHeight<690);check();window.addEventListener('resize',check);return()=>window.removeEventListener('resize',check)},[])
 useEffect(()=>{if(drawer){panelRef.current?.focus()}},[drawer])
 const action=(text:string,idx?:number)=>{
   if(!text.trim())return
   setHistory(h=>[...h, text.trim()].slice(-4))
   setChoiceIndex(idx===undefined?null:idx)
   setTyped('')
   setNotice('【UI 示範】已記錄行動。正式版本會由 AI 判斷結果，呢度唔會消耗存檔或 API。')
 }
 const enter=(g:Genre)=>{
   setGenre(g);setTone('normal');setSection('story');setDrawer(null);setNotice('');setStoryPage(0)
 }
 const spend=()=>{
   if(points<100)return
   setPoints(n=>n-100);setLevel(n=>n+1);setNotice('主神已扣除 100 點。你嘅角色等級提高 1 級（UI 示範資料）。')
 }
 return <main className={'nwl nwl-'+(section==='nexus'?'nexus':genre)+(quiet?' nwl-reduced':'')} data-tone={tone}>
   <div className="nwl-noise" aria-hidden="true"/>
   <div className="nwl-shell">
     <header className="nwl-header">
       <button type="button" className="nwl-brand" onClick={()=>{setDrawer(null);setSection('nexus')}} aria-label="返回主神空間">
         <span className="nwl-symbol">N<span>∞</span></span>
         <span className="nwl-brand-copy"><strong>NIGHTWALKER</strong><small>REINCARNATION SYSTEM</small></span>
       </button>
       <span className="nwl-env"><i/>{section==='nexus'?'NEXUS / 00':'WORLD / '+String(WORLDS.findIndex(w=>w.genre===genre)+1).padStart(2,'0')}</span>
       <button type="button" className="nwl-top-control" aria-label="系統設定" onClick={()=>setDrawer('settings')}><Icon name="menu" size={21}/></button>
     </header>

     {section==='nexus'?<div className="nwl-scroll nwl-dashboard nwl-dashboard-v2">
       <section className="nwl-nexus-hero nwl-nexus-hero-v2" aria-label="主神空間科技中樞">
         <div className="nwl-nexus-topline"><span><i/> NEXUS CONTROL CORE</span><span>NO. 0000 / ONLINE</span></div>
         <div className="nwl-cosmos" aria-hidden="true">
           <div className="nwl-arc nwl-arc-a"/><div className="nwl-arc nwl-arc-b"/><div className="nwl-arc nwl-arc-c"/>
           <div className="nwl-orb"><span/></div><div className="nwl-horizon"/>
           <div className="nwl-pillar nwl-pillar-l"/><div className="nwl-pillar nwl-pillar-r"/>
           <div className="nwl-core-floor"/><div className="nwl-core-scan"/>
         </div>
         <div className="nwl-hero-overprint"><span>SUPREME REINCARNATION SYSTEM</span><h1>主神空間</h1><p>「輪迴者，歡迎回來。」</p></div>
         <div className="nwl-hero-hud"><span>◈ 中樞穩定 · 休整期</span><span>CORE / 001</span></div>
       </section>
       <section className="nwl-command-status" aria-label="角色即時狀態">
         <div className="nwl-v2-character"><div className="nwl-avatar-mark">00</div><div><strong>無名生還者</strong><small>LV.{level} · 輪迴者</small></div></div>
         <div className="nwl-v2-bars">
           <div><span>HP <b>{hp}</b></span><div className="nwl-v2-meter"><i className="health" style={{width:hp+'%'}}/></div></div>
           <div><span>SP <b>{sp}</b></span><div className="nwl-v2-meter"><i className="sanity" style={{width:sp+'%'}}/></div></div>
         </div>
         <button type="button" className="nwl-v2-points" onClick={()=>setDrawer('enhance')} aria-label="查看主神強化及積分"><Icon name="spark" size={14}/><strong>{points}</strong><small>PT</small></button>
       </section>
       <div className="nwl-v2-functions-label"><span>MAIN SYSTEM</span><strong>主神系統</strong><span>06 / MODULES</span></div>
       <section className="nwl-feature-grid nwl-feature-grid-v2" aria-label="主神系統功能">
         {FEATURE.map((f,i)=><button type="button" className={'nwl-feature nwl-feature-v2 nwl-feature-'+i} key={f.key} onClick={()=>setDrawer(f.key)}>
           <span className="nwl-feature-id">{String(i+1).padStart(2,'0')}</span>
           <div className="nwl-feature-icon"><Icon name={f.icon} size={23}/></div>
           <strong>{f.label}</strong><Icon name="chevron" size={13} className="nwl-feature-arrow-v2"/>
         </button>)}
       </section>
       <section className="nwl-next nwl-next-v2" aria-label="下一個世界入口">
         <div className="nwl-next-copy"><span>WORLD 01 · READY</span><strong>生化危機 <small>2002</small></strong><small>蜂巢 · 第一輪迴世界</small></div>
         <button type="button" className="nwl-launch nwl-launch-v2" onClick={()=>enter('horror')}><Icon name="play" size={16}/><span>進入世界</span><Icon name="arrow" size={15}/></button>
       </section>
       <div className="nwl-v2-bottom-help">UI PROTOTYPE <span>·</span> 點選「進入世界」可試文字情緒動畫</div>
     </div>:<div className="nwl-story-layout">
       <div className="nwl-worldbar"><button type="button" onClick={()=>setSection('nexus')} aria-label="返回主神空間 Dashboard"><Icon name="back" size={16}/></button><div><small>WORLD · {WORLDS.find(w=>w.genre===genre)?.sub}</small><strong>{WORLDS.find(w=>w.genre===genre)?.name}</strong></div><button type="button" onClick={()=>setDrawer('journal')} aria-label="故事紀錄"><Icon name="book" size={19}/></button></div>
       <div className="nwl-story-stats"><span><i className="nwl-stat-red"/> HP {hp}</span><span><i className="nwl-stat-blue"/> SP {sp}</span><span><Icon name="spark" size={12}/> {points} PT</span><span><Icon name="clock" size={12}/> {chapter.clock}</span></div>
       <section className="nwl-story-window" key={genre+'-'+tone+'-'+page}>
         <div className="nwl-reading-status"><span>劇情閱讀 · {page+1} / {segmentPages.length}</span><span>情緒演出：{toneLabels[tone]}</span></div>
         <div className="nwl-story-overline"><span className="nwl-divider-line"/> CHAPTER DEMO · 情緒演出</div>
         <div className="nwl-scene-location"><Icon name="globe" size={13}/>{chapter.place}</div>
         <div className="nwl-story-title"><span>◈</span><h1>{chapter.title}</h1></div>
         <div className={'nwl-narrative nwl-tone-'+tone+(animateText?' nwl-animate':'')}>
           {visibleSegments.map((seg,i)=>seg.type==='impact'?
             <div key={i} className="nwl-impact">{Array.from(seg.text).map((letter,k)=><span key={k} style={{animationDelay:(k*85)+'ms'}}>{letter}</span>)}</div>:
             seg.type==='alert'?<div key={i} className="nwl-alert"><Icon name="warning" size={16}/>{seg.text}</div>:
             seg.type==='aside'?<div key={i} className="nwl-aside">{seg.text}</div>:
             seg.type==='voice'?<div key={i} className="nwl-dialogue"><div><strong>{seg.name}</strong><small>{seg.mood}</small></div><p>{seg.text}</p></div>:
             <p key={i} className="nwl-prose">{seg.text}</p>)}
         </div>
         <div className="nwl-page-controls"><button type="button" onClick={()=>setStoryPage(i=>Math.max(0,i-1))} disabled={page===0} aria-label="上一段劇情"><Icon name="back" size={14}/> 上一段</button><span>{page+1} / {segmentPages.length}</span><button type="button" onClick={()=>setStoryPage(i=>Math.min(segmentPages.length-1,i+1))} disabled={page>=segmentPages.length-1} aria-label="下一段劇情">下一段 <Icon name="arrow" size={14}/></button></div>
         {history.length>0&&<div className="nwl-player-log"><span>上一個行動</span>{history[history.length-1]}</div>}
         {!!notice&&<div className="nwl-proto-note"><Icon name="info" size={13}/>{notice}</div>}
       </section>
       <section className="nwl-decision-area">
         <div className="nwl-decision-heading"><span>YOUR MOVE <i/> 你打算點做？</span><span>DEMO {toneLabels[tone]}</span></div>
         <div className="nwl-options">
           {chapter.options.map((o,i)=><button type="button" key={i} className={'nwl-option'+(choiceIndex===i?' nwl-option-selected':'')} onClick={()=>action(o,i)}><span>{String(i+1).padStart(2,'0')}</span><strong>{o}</strong><Icon name="chevron" size={15}/></button>)}
         </div>
         <div className="nwl-freeform"><label htmlFor="nwl-user-action">或者，自行決定你的行動</label><div><input id="nwl-user-action" placeholder="我想先試探 Rain，唔直接講出真相……" value={typed} onChange={e=>setTyped(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();action(typed)}}}/><button type="button" onClick={()=>action(typed)} disabled={!typed.trim()} aria-label="輸入行動"><Icon name="send" size={18}/></button></div></div>
       </section>
       <nav className="nwl-story-nav" aria-label="冒險快捷功能">
         <button type="button" onClick={()=>setDrawer('allies')}><Icon name="users" size={18}/><span>角色</span></button>
         <button type="button" onClick={()=>setDrawer('bag')}><Icon name="bag" size={18}/><span>背包</span></button>
         <button type="button" onClick={()=>setDrawer('missions')}><Icon name="scroll" size={18}/><span>任務</span></button>
         <button type="button" onClick={()=>setDrawer('journal')}><Icon name="book" size={18}/><span>紀錄</span></button>
         <button type="button" onClick={()=>setDrawer('settings')}><Icon name="settings" size={18}/><span>設定</span></button>
       </nav>
       <div className="nwl-demo-picker"><div className="nwl-mini-label">固定 UI · 即時換 Theme</div><div className="nwl-theme-tabs">{WORLDS.map((w,i)=><button type="button" key={w.genre} className={genre===w.genre?'active':''} onClick={()=>setGenre(w.genre)}>{['恐怖','奇幻','武俠','科幻'][i]}</button>)}</div><div className="nwl-tone-tabs">{TONES.map(t=><button type="button" key={t} className={tone===t?'active':''} onClick={()=>setTone(t)}>{toneLabels[t]}</button>)}</div></div>
     </div>}
   </div>
   {drawer&&<div className="nwl-overlay" onClick={()=>setDrawer(null)}><div className="nwl-drawer" role="dialog" aria-modal="true" aria-label="主神系統面板" tabIndex={-1} ref={panelRef} onClick={e=>e.stopPropagation()}>
     <div className="nwl-drawer-head"><div><small>MAIN SYSTEM // {drawer.toUpperCase()}</small><h2>{FEATURE.find(f=>f.key===drawer)?.label||({settings:'系統設定',journal:'故事紀錄'} as Record<string,string>)[drawer]}</h2></div><button type="button" aria-label="關閉" onClick={()=>setDrawer(null)}><Icon name="close" size={19}/></button></div>
     <div className="nwl-drawer-content">
       {drawer==='worlds'&&<><p className="nwl-drawer-intro">電影世界按照輪迴順序開啟。此頁係 UI 示範；選擇「生化危機」可以試不同 Theme 嘅文字冒險畫面。</p>{WORLDS.map((w,i)=><button key={w.genre} type="button" className="nwl-world-row" onClick={()=>{if(w.unlocked)enter(w.genre)}} disabled={!w.unlocked}><span className="nwl-world-number">{String(i+1).padStart(2,'0')}</span><span><strong>{w.name}</strong><small>{w.sub}</small></span><Icon name={w.unlocked?'arrow':'lock'} size={18}/></button>)}</>}
       {drawer==='missions'&&<><div className="nwl-task-brief"><span>WORLD 01 · MISSION DATA</span><h3>生化危機：蜂巢撤離</h3><p>在蜂巢封鎖前帶住至少一名隊員安全逃離地下設施。</p><div>獎勵 <strong>120 PT · 45 XP</strong></div></div><div className="nwl-drawer-subhead">支線目標</div>{['保護 Rain，避免她因感染而死亡','保留 Umbrella 病毒事故證據','成功避開紅后鐳射走廊陷阱'].map((s,i)=><div className="nwl-task-row" key={s}><Icon name={i===0?'eye':'lock'} size={16}/>{s}<small>{i===0?'進行中':'未達成'}</small></div>)}<p className="nwl-drawer-footnote">任務及獎勵只係 UI 樣本，唔會寫入舊遊戲進度。</p></>}
       {drawer==='enhance'&&<><div className="nwl-points-box"><span>主神可用點數</span><strong>{points.toLocaleString()}<small> PT</small></strong></div><div className="nwl-drawer-subhead">強化模組</div>{[{name:'基礎感知強化',cost:100,text:'提高人物對危機嘅察覺能力',icon:'eye' as IconName},{name:'心智穩定協議',cost:180,text:'減少恐怖場景對理智嘅影響',icon:'shield' as IconName},{name:'生命修復專項',cost:250,text:'增加生還者體能與耐力',icon:'heart' as IconName}].map((x,i)=><div className="nwl-upgrade" key={x.name}><span className="nwl-upgrade-icon"><Icon name={x.icon}/></span><div><strong>{x.name}</strong><small>{x.text}</small></div><button type="button" disabled={i!==0||points<100} onClick={spend}>{x.cost} PT</button></div>)}<p className="nwl-drawer-footnote">只有第一項可以模擬兌換；另外兩項係介面示範。</p></>}
       {drawer==='bag'&&<><p className="nwl-drawer-intro">道具會喺不同世界之間繼承。呢度展示統一背包 UI。</p>{[{name:'半張染血車票',kind:'特殊線索',icon:'scroll' as IconName},{name:'蜂巢識別牌',kind:'世界物件',icon:'shield' as IconName},{name:'基本防護裝備',kind:'一般裝備',icon:'bag' as IconName}].map((x,i)=><div key={x.name} className="nwl-inventory-row"><span><Icon name={x.icon} size={19}/></span><div><strong>{x.name}</strong><small>{x.kind}</small></div>{i===2&&<button type="button" onClick={()=>setItemEquipped(v=>!v)}>{itemEquipped?'已裝備':'裝備'}</button>}</div>)}</>}
       {drawer==='allies'&&<><div className="nwl-profile"><div className="nwl-profile-mark">00</div><div><strong>無名生還者</strong><small>輪迴者識別：NO. 0000</small><span>等級 {level} · 生命 {hp} · 理智 {sp}</span></div></div><div className="nwl-drawer-subhead">人物關係</div>{[{name:'阿霧',tag:'主神空間引導者',trust:'信任 III'},{name:'Alice',tag:'世界 01 · 生化危機',trust:'中立'},{name:'Rain',tag:'世界 01 · 生化危機',trust:'初識'}].map(x=><div key={x.name} className="nwl-ally-row"><div className="nwl-ally-avatar">{x.name.slice(0,1)}</div><div><strong>{x.name}</strong><small>{x.tag}</small></div><span>{x.trust}</span></div>)}</>}
       {drawer==='rest'&&<><div className="nwl-rest"><Icon name="moon" size={33}/><h3>私人休息室</h3><p>輪迴間歇，你可以喺呢度治療、恢復精神，為下一部電影做好準備。</p></div><div className="nwl-recover-row"><span>目前生命 <strong>{hp}/100</strong></span><span>理智 <strong>{sp}/100</strong></span></div><button type="button" className="nwl-drawer-primary" onClick={()=>{setHp(100);setSp(100);setNotice('休息完成：生命同理智已恢復（僅測試 UI）。');setDrawer(null)}}>使用休息室 · 完成恢復 <Icon name="arrow" size={16}/></button><p className="nwl-drawer-footnote">今次只更新 Prototype 狀態，不會影響你既有 Nightwalker 存檔。</p></>}
       {drawer==='journal'&&<><p className="nwl-drawer-intro">測試冒險互動紀錄（唔連 AI）。</p>{history.length?history.map((x,i)=><div className="nwl-journal-entry" key={i}><small>CHOICE {String(i+1).padStart(2,'0')}</small><p>{x}</p></div>):<div className="nwl-empty">尚未有行動紀錄。你可以返回遊戲畫面點選建議行動，或者自己輸入。</div>}</>}
       {drawer==='settings'&&<><p className="nwl-drawer-intro">呢個係全新 UI Prototype。你可以試全部互動；唔會呼叫 AI、改動原遊戲、或者產生 API 費用。</p><label className="nwl-toggle"><span>細緻動畫與呼吸光暈</span><input type="checkbox" checked={!quiet} onChange={e=>setQuiet(!e.target.checked)}/></label><label className="nwl-toggle"><span>劇情文字淡入演出</span><input type="checkbox" checked={animateText} onChange={e=>setAnimateText(e.target.checked)}/></label><button type="button" className="nwl-drawer-primary" onClick={()=>{setSection('nexus');setDrawer(null)}}>返回主神 Dashboard <Icon name="arrow" size={17}/></button><button type="button" className="nwl-drawer-secondary" onClick={()=>{setSection('story');setDrawer(null)}}>開啟文字遊戲 Theme 示範</button><p className="nwl-drawer-footnote">此版本所有 UI／場景均由程式產生，無背景圖、無電影人物圖。建議你先評估設計方向，再將風格接入真正 AI 遊戲。</p></>}
     </div>
     <div className="nwl-drawer-footer"><span>◈ NIGHTWALKER / DESIGN PROTOTYPE</span><button type="button" onClick={()=>setDrawer(null)}>返回</button></div>
   </div></div>}
 </main>
}
