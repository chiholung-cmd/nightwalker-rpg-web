import type { SaveState } from './infiniteStory'

export type FilmMission={
 id:'bio'|'helsing'|'storm'
 title:string
 year:string
 movie:string
 start:string
 clear:string
 category:string
 basePoints:number
 baseXp:number
 main:string
 description:string
 npcs:string[]
 side:{label:string;flag:string;reward:string}[]
}
export const FILM_MISSIONS:FilmMission[]=[
  {id:'bio',title:'生化危機',year:'2002',movie:'Resident Evil',start:'re_arrival',clear:'生化危機2002',category:'現代科幻恐怖',basePoints:120,baseXp:45,
   main:'蜂巢封鎖前安全撤離',description:'進入 Red Queen 控制區，確認病毒事件，於最後一班列車離開蜂巢。',
   npcs:['Alice','Rain','Kaplan','James Shade','Matt Addison','Spence','Red Queen'],
   side:[
    {label:'Rain 生還',flag:'re_rain_saved',reward:'D 級支線 +85 積分'},
    {label:'保留 Umbrella 證據',flag:'re_saved_evidence',reward:'D 級支線 +75 積分'},
    {label:'蜂巢病毒封鎖',flag:'re_containment',reward:'追加 40 積分'},
    {label:'James Shade 未死於雷射',flag:'re_saved_james',reward:'隊友命運變動紀錄'}
   ]},
  {id:'helsing',title:'Van Helsing',year:'2004',movie:'Van Helsing',start:'vh_arrival',clear:'VanHelsing2004',category:'哥德奇幻恐怖',basePoints:150,baseXp:60,
   main:'阻止 Dracula 的計劃並完成撤離',description:'與 Van Helsing、Carl 和 Anna 合作；追查狼人詛咒及 Frankenstein 造物。',
   npcs:['Gabriel Van Helsing','Anna Valerious','Carl','Velkan','Dracula','Frankenstein 造物'],
   side:[
    {label:'Anna 原定死亡命運被改寫',flag:'vh_anna_survived',reward:'D 級支線 +110 積分'},
    {label:'保護 Frankenstein 造物',flag:'vh_monster_protected',reward:'D 級支線 +70 積分'},
    {label:'Velkan 免被立即殺死',flag:'vh_velkan_restrained',reward:'角色世界線變動紀錄'},
    {label:'吸血鬼幼體設備被封鎖',flag:'vh_brood_destroyed',reward:'降低世界擴散風險'}
   ]},
  {id:'storm',title:'風雲雄霸天下',year:'1998',movie:'The Storm Riders',start:'fy_arrival',clear:'風雲1998',category:'香港武俠奇幻',basePoints:200,baseXp:80,
   main:'活過天下會內亂並協助風、雲化解雄霸殺局',description:'參與泥菩薩命數、孔慈婚事、凌雲窟、麒麟臂及劍塚決戰。',
   npcs:['聶風','步驚雲','雄霸','秦霜','孔慈','泥菩薩','文丑丑','于岳','楚楚'],
   side:[
    {label:'孔慈生還且風雲合擊',flag:'fy_kongchi_good_end',reward:'C 級支線 +130 積分'},
    {label:'秦霜助風雲抗衡雄霸',flag:'fy_qin_good_end',reward:'D 級支線 +85 積分'},
    {label:'記錄聶風身法心得',flag:'fy_wind_bodhi_help',reward:'武學熟練度 +1'},
    {label:'讓步驚雲保有絕世好劍的傳承',flag:'fy_cloud_recovered',reward:'角色關係及傳承紀錄'}
   ]}
]
export const currentFilmMission=(world:string):FilmMission|undefined=>FILM_MISSIONS.find(m=>
 world.includes('生化危機')&&m.id==='bio'||
 world.includes('Van Helsing')&&m.id==='helsing'||
 world.includes('風雲雄霸天下')&&m.id==='storm')
export const unlockedFilm=(m:FilmMission,s:SaveState)=>m.id==='bio'||(m.id==='helsing'?s.cleared.includes('生化危機2002'):s.cleared.includes('VanHelsing2004'))
export const completedFilm=(m:FilmMission,s:SaveState)=>s.cleared.includes(m.clear)
export const completedOptional=(m:FilmMission,s:SaveState)=>m.side.filter(x=>s.flags.includes(x.flag)).length
export const trainingSummary=(s:SaveState)=>[
 {name:'科技・蜂巢',key:'tech',rank:s.mastery?.tech||0,description:'資料解讀、現代設備與防衛系統'},
 {name:'秘術・獵魔',key:'occult',rank:s.mastery?.occult||0,description:'封印、詛咒辨識與保護知識'},
 {name:'武學・風雲',key:'martial',rank:s.mastery?.martial||0,description:'氣息、身法與武學理解'}
]
