import { awardXp, maxHp, maxSp, talentRank } from './progression'
export type WorldTheme = 'nexus' | 'archive' | 'apartment' | 'hospital' | 'rift'
export type Effect = {
  hp?: number
  sp?: number
  points?: number
  bond?: number
  flags?: string[]
  items?: string[]
  removeItems?: string[]
  clearWorld?: string
  journal?: string
  riftAdvance?: boolean
  xp?: number
}
export type Choice = {
  label: string
  hint?: string
  to?: string
  effect?: Effect
  requires?: string
  without?: string
  requiresItem?: string
  bondAtLeast?: number
  requiresTalent?: 'insight' | 'mirror'
  notCleared?: string
  needsCleared?: string
  action?: 'shop' | 'battle' | 'combat-practice'
  enemy?: 'clerk' | 'echo'
}
export type Scene = {
  id: string
  title: string
  world: string
  theme: WorldTheme
  speaker: string
  face?: 'guide' | 'girl' | 'clerk' | 'nurse' | 'neighbor' | 'system'
  lines: string[]
  choices: Choice[]
}
export type SaveState = {
  scene: string
  line: number
  hp: number
  sp: number
  points: number
  bond: number
  items: string[]
  flags: string[]
  cleared: string[]
  journal: string[]
  path: string[]
  riftCount: number
  chapter: number
  level: number
  xp: number
  talentPoints: number
  talents: { vitality:number; composure:number; insight:number; mirror:number }
}
export const INITIAL: SaveState = {
  scene: 'hub_arrival', line: 0,
  hp: 100, sp: 74, points: 105, bond: 0,
  items: ['舊式手機', '半張染血車票', '鏡面碎片', '遺忘者印記'],
  flags: ['no_name','zero_station_survivor'],
  cleared: ['零號月台'],
  journal: ['你喺零號月台放棄名字，獲得「無名生還者」身份。'],
  path: ['零號月台：車票 → 鏡面 → 放棄名字'],
  riftCount: 0, chapter: 1, level:1, xp:0, talentPoints:0,
  talents:{vitality:0,composure:0,insight:0,mirror:0}
}
const HUB = '主神中轉站'
export const SCENES: Record<string, Scene> = {
  hub_arrival: {
    id:'hub_arrival', title:'第零層・主神候車廳', world:HUB, theme:'nexus',
    speaker:'主神系統',face:'system',
    lines:[
      '【嘀——存活確認。】你由一班已經消失嘅地鐵列車跌落冰冷地板。頭頂冇天空，只有數以百計倒轉懸浮嘅門。',
      '「上一關結算完成。身份：無名生還者。」你試圖回憶自己個名，但記憶中只剩下一片空白。',
      '月台盡頭有一間開住燈嘅小賣部。一個披住灰色斗篷嘅少女向你招手。三道傳送門，同時響起倒數聲。'
    ],
    choices:[
      {label:'走向灰斗篷少女',hint:'角色對話・建立關係',to:'guide_first'},
      {label:'查看主神世界地圖',hint:'選擇副本・跨世界傳送',to:'hub_portals'},
      {label:'觀察牆上嘅隱藏規則',hint:'調查・可以取得線索',to:'hub_rules'},
      {label:'前往積分商店',hint:'補給・裝備',action:'shop'}
    ]
  },
  guide_first: {
    id:'guide_first',title:'無名的引路人',world:HUB,theme:'nexus',speaker:'阿霧',face:'guide',
    lines:[
      '少女轉過身，灰斗篷底下露出一對琥珀色眼睛。「你終於都上嚟喇。你叫我阿霧就得。」',
      '「每道門後面都係一個獨立世界。有啲世界嘅規則相互矛盾，有啲甚至識得記住你做過嘅事。」',
      '佢伸出手：「我可以幫你搵返個名，但你要決定——你信唔信我？」'
    ],
    choices:[
      {label:'握住佢隻手',hint:'阿霧信任 +2；解鎖秘密',to:'guide_trust',effect:{bond:2,flags:['guide_ally'],journal:'阿霧答應協助你尋找被刪除的名字。'}},
      {label:'要求佢先講出真正目的',hint:'理智 -3；取得情報',to:'guide_question',effect:{sp:-3,flags:['guide_suspicious']}},
      {label:'暫時保持距離',hint:'謹慎路線',to:'hub_portals'}
    ]
  },
  guide_trust: {
    id:'guide_trust',title:'第一份盟約',world:HUB,theme:'nexus',speaker:'阿霧',face:'guide',
    lines:[
      '阿霧隻手冰得唔正常。你聽見佢心跳聲，竟然同候車廳嘅倒數聲完全同步。',
      '「記住：見到一個同你一模一樣嘅人，唔好即刻當佢係敵人。」佢畀你一張摺好嘅紙，上面寫住「第一個出口唔係出口」。',
      '系統提示：【獲得角色關係：阿霧・盟友。部分隱藏選項已解鎖。】'
    ],
    choices:[{label:'收好紙條，查看可進入世界',to:'hub_portals',effect:{items:['阿霧的紙條'],flags:['guide_note']}}]
  },
  guide_question: {
    id:'guide_question',title:'被遮住的一半真相',world:HUB,theme:'nexus',speaker:'阿霧',face:'guide',
    lines:[
      '阿霧沉默咗幾秒：「我同你一樣，都係被困喺輪迴入面嘅人。」',
      '「但我唔可以直接講出自己原本嘅名字。有人正透過名字監視我哋。」你察覺佢提到「名字」嗰刻，四周所有鐘都停咗一秒。'
    ],
    choices:[
      {label:'相信佢，但保持戒心',to:'hub_portals',effect:{bond:1,flags:['guide_secret'],journal:'阿霧聲稱姓名會令監視者發現玩家。'}},
      {label:'質疑佢係主神安排嘅棋子',to:'hub_portals',effect:{flags:['guide_distrusted']}}
    ]
  },
  hub_rules: {
    id:'hub_rules',title:'主神候車廳・守則',world:HUB,theme:'nexus',speaker:'旁白',face:'system',
    lines:[
      '公告板上有四條規則：「一、未經確認嘅門唔可以打開。二、返回中轉站時不可帶走活人。三、商店售出嘅回憶不設退換。」',
      '「四、如果你發現自己已經完成咗某個副本，但完全冇印象……請立即熄機。」',
      '第四條規則下方，有人用指甲刻出一句小字：「主神都會說謊。」'
    ],
    choices:[
      {label:'用手機影低公告板',to:'hub_portals',effect:{flags:['hub_rules_photo'],journal:'主神候車廳第四條規則：完成了卻不記得的副本，必須立即熄機。'}},
      {label:'撕走第四條規則',hint:'取得道具・理智 -5',to:'hub_portals',effect:{items:['被撕下的第四條規則'],sp:-5,flags:['stolen_rule']}},
      {label:'放低呢個疑問',to:'hub_portals'}
    ]
  },
  hub_portals: {
    id:'hub_portals',title:'下一道門',world:HUB,theme:'nexus',speaker:'主神系統',face:'system',
    lines:[
      '三道傳送門喺半空浮現：第一道散發金屬同舊紙氣味；第二道滲出潮濕嘅紅光；第三道不斷傳出醫院心電圖聲。',
      '【每個世界都有獨立任務、規則、人物同結局。完成副本後可返回中轉站，攜帶因果進入下一個世界。】'
    ],
    choices:[
      {label:'副本 002：凌晨四點失物管理處',hint:'怪談・調查・可選擇避戰',to:'lost_arrival',notCleared:'失物管理處'},
      {label:'副本 003：血月公寓',hint:'住戶規則・救人定逃生',to:'blood_arrival',notCleared:'血月公寓'},
      {label:'副本 004：鏡城病院',hint:'身份交換・記憶與真相',to:'hospital_arrival',notCleared:'鏡城病院'},
      {label:'前往不穩定裂隙',hint:'完成三個世界後解鎖・可重複探索',to:'rift_arrival',needsCleared:'失物管理處|血月公寓|鏡城病院'},
      {label:'開啟被主神封鎖嘅第四道門',hint:'第二章・跨世界因果・完成三個副本後解鎖',to:'fourth_threshold',needsCleared:'失物管理處|血月公寓|鏡城病院',notCleared:'第四道門'},
      {label:'返回候車廳，同阿霧傾偈',to:'hub_return'}
    ]
  },
  hub_return: {
    id:'hub_return',title:'世界與因果',world:HUB,theme:'nexus',speaker:'阿霧',face:'guide',
    lines:[
      '「你終於又返嚟。每次去完一個世界，你身上都會多一啲別人睇唔到嘅痕跡。」',
      '佢望向你背包：「有啲選擇只係令你贏一場戰鬥；另有啲選擇，會令未來嘅人願意為你打開一道門。」'
    ],
    choices:[
      {label:'詢問關於自己名字嘅線索',to:'hub_memory',requires:'archive_truth'},
      {label:'同阿霧分享目前經歷',to:'hub_bond',effect:{bond:1},without:'bond_reward_claimed'},
      {label:'用「真相視界」觀察阿霧隱藏嘅記憶',hint:'真相視界天賦專屬',to:'guide_inner',requiresTalent:'insight'},
      {label:'查看世界地圖',to:'hub_portals'},
      {label:'進入積分商店',action:'shop'}
    ]
  },
  hub_memory: {
    id:'hub_memory',title:'名字背後的門',world:HUB,theme:'nexus',speaker:'阿霧',face:'guide',
    lines:[
      '阿霧望住你從檔案室攞返嚟嘅紀錄，第一次流露出恐懼。',
      '「呢個編號……喺你入第一個副本之前已經存在。你可能唔係第一次參加無限流。」',
      '你問佢：「咁我之前究竟死過幾多次？」佢冇回答，只係慢慢指向空白嘅第四道門。'
    ],
    choices:[{label:'記住第四道門，暫時唔入去',to:'hub_portals',effect:{flags:['fourth_door'],journal:'第四道門可能通往玩家被刪除的前世輪迴。'}}]
  },
  hub_bond: {
    id:'hub_bond',title:'篝火旁的約定',world:HUB,theme:'nexus',speaker:'阿霧',face:'guide',
    lines:[
      '你向阿霧講起小女孩、染血車票同鏡面碎片。佢安靜聽完，從小賣部拎出一樽藍色飲品。',
      '「唔使還錢。你唔需要一個人捱晒所有副本。」'
    ],
    choices:[{label:'接受佢嘅心意',to:'hub_portals',effect:{sp:12,flags:['bond_reward_claimed'],journal:'阿霧給你藍色飲品，理智恢復。'}}]
  },
  lost_arrival: {
    id:'lost_arrival',title:'失物管理處・午夜',world:'失物管理處',theme:'archive',speaker:'旁白',face:'system',
    lines:[
      '【副本 002：凌晨四點的失物管理處】你重新踏入一幢舊地鐵大樓，所有櫃檯都排滿標籤寫住「已失蹤」嘅檔案。',
      '喇叭響起：「未登記姓名者，一律視作失物。」走廊盡頭，一個戴住圍裙嘅管理員用長剪刀剪斷咗自己嘅影子。',
      '你見到左邊有一本守則、右邊傳出小女孩啜泣聲，而正前方有一個寫住你編號嘅抽屜。'
    ],
    choices:[
      {label:'先閱讀失物處守則',to:'lost_rules',hint:'調查・解鎖談判線索'},
      {label:'尋找哭聲來源',to:'lost_girl',hint:'角色支線・有機會救人'},
      {label:'檢查寫有你編號嘅抽屜',to:'lost_archive',hint:'主線秘密'},
      {label:'直接走去管理員面前',to:'lost_clerk'}
    ]
  },
  lost_rules: {
    id:'lost_rules',title:'誰擁有自己的名字',world:'失物管理處',theme:'archive',speaker:'旁白',face:'system',
    lines:[
      '第一條：「失物只可以由失主本人領回。」第二條：「冇名字者可以用領取編號代替。」',
      '第三條：「管理員只會對被登記嘅物品動武。」你忽然明白：只要證明自己唔屬於呢間管理處，就可能唔使戰鬥。',
      '守則最尾有個被塗黑嘅欄位：「檔案編號：0000-████」。'
    ],
    choices:[
      {label:'記低規則，調查自己嘅編號',to:'lost_archive',effect:{flags:['lost_rules'],journal:'失物管理員只對已登記物品動武；領取編號可以代替名字。'}},
      {label:'沿住哭聲追上去',to:'lost_girl',effect:{flags:['lost_rules']}},
      {label:'用守則同管理員交涉',to:'lost_clerk',effect:{flags:['lost_rules']}}
    ]
  },
  lost_girl: {
    id:'lost_girl',title:'第十三號寄存櫃',world:'失物管理處',theme:'archive',speaker:'小滿',face:'girl',
    lines:[
      '你推開一個半掩住嘅寄存櫃。裏面蜷縮住一個穿黃色雨衣嘅小女孩，手上攬住半隻破舊布偶。',
      '「哥哥，我搵唔返阿媽……如果佢哋將我放上架，我係咪永遠都返唔到屋企？」',
      '佢腳腕已經掛住一張「待回收」嘅鐵牌。遠處，長剪刀摩擦地面嘅聲音愈嚟愈近。'
    ],
    choices:[
      {label:'答應帶小滿一齊離開',hint:'生命 -8；建立羈絆',to:'lost_archive',effect:{hp:-8,flags:['save_xiaoman'],items:['黃色布偶'],journal:'你答應保護小滿，並取得佢嘅黃色布偶。'}},
      {label:'問佢知唔知管理員弱點',hint:'情報路線・理智 -5',to:'lost_archive',effect:{sp:-5,flags:['girl_hint'],journal:'小滿話管理員最怕有人證明「失物」其實係活人。'}},
      {label:'將櫃門關返，獨自離開',to:'lost_clerk',effect:{flags:['abandoned_girl']}}
    ]
  },
  lost_archive: {
    id:'lost_archive',title:'被撕去姓名的檔案',world:'失物管理處',theme:'archive',speaker:'旁白',face:'system',
    lines:[
      '你打開抽屜，裏面唔係紙，而係一張張你曾經死亡嘅照片。每張嘅時間都係 04:44。',
      '最後一張照片背面寫住：「玩家 0000，已完成第七次記憶清除。」你背脊一陣發涼。',
      '你忽然發現檔案夾嘅封口被一張半截車票封住——同你背包嗰張一模一樣。'
    ],
    choices:[
      {label:'將檔案收好，作為自己存在過嘅證據',to:'lost_clerk',hint:'解鎖無戰鬥通關',effect:{flags:['archive_truth'],items:['玩家0000檔案'],sp:-6,journal:'玩家0000曾被清除記憶至少七次；04:44不是第一次。'}},
      {label:'撕毀照片，拒絕相信呢個真相',to:'lost_clerk',effect:{sp:5,flags:['reject_truth']}},
      {label:'將照片藏喺小滿嘅布偶入面',to:'lost_clerk',requires:'save_xiaoman',effect:{flags:['archive_truth','protected_proof'],items:['玩家0000檔案'],journal:'你利用小滿的布偶保存了玩家0000的死亡證據。'}},
      {label:'請鏡中人辨認這些死亡照片',hint:'跨世界線索・需要鏡中人的記憶',to:'lost_clerk',requiresItem:'鏡中人的記憶',effect:{flags:['archive_truth','mirror_proof'],points:20,journal:'鏡中人的記憶補完玩家0000的死亡照片。'}}
    ]
  },
  lost_clerk: {
    id:'lost_clerk',title:'管理員的最後核對',world:'失物管理處',theme:'archive',speaker:'失物管理員',face:'clerk',
    lines:[
      '管理員突然攔喺你前面，鐵剪上滴住黑色嘅血。「冇名字，就唔算人。」',
      '「你係要交出自己，定係用證據證明你屬於呢個世界？」佢旁邊有一道鎖住嘅緊急出口。',
      '【注意：你可以透過調查、交涉或武力通過。唔係每一個危機都要戰鬥。】'
    ],
    choices:[
      {label:'展示檔案同守則，指出佢嘅邏輯矛盾',hint:'解謎通關・無需戰鬥',to:'lost_ending',requires:'archive_truth',effect:{flags:['defeated_by_logic'],points:25,journal:'利用玩家檔案推翻管理員的收容邏輯，成功避免戰鬥。'}},
      {label:'用半張染血車票換取放行',hint:'犧牲一次性道具',to:'lost_ending',requiresItem:'半張染血車票',effect:{removeItems:['半張染血車票'],flags:['ticket_trade'],journal:'你用染血車票換取管理員放行。'}},
      {label:'抱起小滿，從貨架後面偷偷離開',hint:'小滿帶路・無戰鬥',to:'lost_ending',requires:'save_xiaoman',effect:{flags:['rescued_xiaoman','stealth_route'],points:15}},
      {label:'拔出鏡面碎片，直接迎戰管理員',hint:'進入戰鬥模式',action:'battle',enemy:'clerk',to:'lost_after_battle'},
      {label:'屈服並交出所有證明',hint:'快速離開・重大代價',to:'lost_ending',effect:{sp:-25,points:-35,flags:['surrendered_to_clerk']}}
    ]
  },
  lost_after_battle: {
    id:'lost_after_battle',title:'撕裂的失物簿',world:'失物管理處',theme:'archive',speaker:'旁白',face:'system',
    lines:[
      '管理員慢慢跪低，長剪刀斷成兩截。你喺佢胸口發現一把刻住 0000 嘅鑰匙。',
      '遠處嘅寄存櫃開始逐個打開，幾十個失蹤者嘅聲音同時叫住你：「唔好忘記我哋……」'
    ],
    choices:[
      {label:'帶埋失物簿同鑰匙離開',to:'lost_ending',effect:{items:['鏽蝕檔案鑰匙'],flags:['clerk_defeated','archive_key'],journal:'戰勝失物管理員，取得刻有0000的鏽蝕鑰匙。'}},
      {label:'先救出仲困住嘅人',hint:'額外生命代價・改變結局',to:'lost_ending',effect:{hp:-10,flags:['clerk_defeated','rescued_many','rescued_xiaoman'],items:['鏽蝕檔案鑰匙'],journal:'你冒險救出寄存櫃內的失蹤者，包括小滿。'}}
    ]
  },
  lost_ending: {
    id:'lost_ending',title:'失物處・結算',world:'失物管理處',theme:'archive',speaker:'主神系統',face:'system',
    lines:[
      '凌晨 04:44。全部時鐘同時歸零，失物管理處嘅建築開始塌落。',
      '傳送門出現喺你腳下。你知道自己就算離開，都唔可能將呢個地方嘅所有秘密留喺身後。',
      '【副本結算：你的調查、救人及交涉選擇已被記錄，將影響之後世界對「玩家0000」的認知。】'
    ],
    choices:[
      {label:'帶住成功救出嘅小滿返去中轉站',hint:'特殊結局・被記住的無名者',to:'hub_return',requires:'rescued_xiaoman',effect:{clearWorld:'失物管理處',points:100,bond:1,flags:['lost_true_end'],journal:'失物管理處達成「被記住的無名者」結局。'}},
      {label:'帶走檔案嘅真相，返回中轉站',hint:'調查結局',to:'hub_return',requires:'archive_truth',effect:{clearWorld:'失物管理處',points:80,flags:['lost_truth_end'],journal:'失物管理處達成「玩家0000」調查結局。'}},
      {label:'收下積分，立即離開',hint:'普通結局',to:'hub_return',effect:{clearWorld:'失物管理處',points:55,flags:['lost_normal_end'],journal:'失物管理處達成普通生還結局。'}}
    ]
  },
  blood_arrival: {
    id:'blood_arrival',title:'血月公寓・十三樓',world:'血月公寓',theme:'apartment',speaker:'電梯廣播',face:'system',
    lines:[
      '傳送門將你送入一幢舊式公寓。電梯停喺十三樓，但面板上根本冇十三呢個數字。',
      '廣播響起：「本樓住戶請注意，過咗午夜十二點，無論門外邊個叫你，都唔可以承認自己係住戶。」',
      '走廊深處有女人輕輕拍門：「可唔可以幫我搵個仔？」而你腳下，一條紅線一路延伸到 1304 室。'
    ],
    choices:[
      {label:'閱讀電梯內嘅住戶守則',hint:'調查規則',to:'blood_rules'},
      {label:'跟住女人嘅聲音前進',hint:'NPC 劇情',to:'blood_neighbor'},
      {label:'沿紅線行去 1304 室',hint:'主線',to:'blood_1304'}
    ]
  },
  blood_rules: {
    id:'blood_rules',title:'不存在的十三樓',world:'血月公寓',theme:'apartment',speaker:'旁白',face:'system',
    lines:[
      '住戶守則只剩一半：「門口紅線不可跨越；聽到小朋友喊媽媽，就要關燈；如電梯到達十三樓，請唔好回望鏡面。」',
      '你反而發現電梯鏡面內多咗一個穿校服嘅小朋友，佢用嘴形不停講：「佢唔係我阿媽。」'
    ],
    choices:[
      {label:'記低小朋友嘅警告',to:'blood_neighbor',effect:{flags:['blood_child_warning'],journal:'血月公寓孩子聲稱門外女人不是他的母親。'}},
      {label:'敲碎電梯鏡子',hint:'理智 -8',to:'blood_1304',effect:{sp:-8,flags:['blood_broken_mirror']}},
      {label:'先觀察 1304 室門牌',to:'blood_1304',effect:{flags:['blood_rule_read']}}
    ]
  },
  blood_neighbor: {
    id:'blood_neighbor',title:'門外的母親',world:'血月公寓',theme:'apartment',speaker:'關小姐',face:'neighbor',
    lines:[
      '女人穿住一身濕透嘅紅色裙，手上攞住一張發黃家庭照。相入面小朋友嘅臉被刮到完全睇唔清。',
      '「幫我開 1304 嘅門，好唔好？我個仔已經喺裏面等咗七年。」',
      '佢每講一次「個仔」，你都發現走廊盡頭嘅燈少咗一盞。'
    ],
    choices:[
      {label:'答應幫手，但要求佢交出照片',to:'blood_1304',effect:{items:['刮花的家庭照'],flags:['blood_photo'],sp:-5,journal:'關小姐將刮花的家庭照交給你。'}},
      {label:'指出相片入面嘅小朋友並非佢個仔',to:'blood_reveal',requires:'blood_child_warning',effect:{flags:['blood_confronted']}},
      {label:'拒絕，轉身走向 1304',to:'blood_1304',effect:{flags:['blood_refusal']}}
    ]
  },
  blood_reveal: {
    id:'blood_reveal',title:'走廊的真正住戶',world:'血月公寓',theme:'apartment',speaker:'關小姐',face:'neighbor',
    lines:[
      '女人嘅笑容僵住。佢條影子竟然開始向反方向走。「原來你睇得到……」',
      '「我只係想搵人記得佢啫。」佢終於坦白，自己係公寓嘅看門人，死去七年嘅小朋友一直被困喺房內。'
    ],
    choices:[
      {label:'答應替佢釋放小朋友',to:'blood_1304',effect:{flags:['blood_caretaker_truth','blood_save_child'],bond:1,journal:'關小姐是公寓看門人的殘魂，想解救七年前死去的孩子。'}},
      {label:'表示只想離開，唔參與',to:'blood_1304',effect:{flags:['blood_caretaker_truth']}}
    ]
  },
  blood_1304: {
    id:'blood_1304',title:'1304 室・紅色房門',world:'血月公寓',theme:'apartment',speaker:'旁白',face:'system',
    lines:[
      '你走到房門前。紅色門縫底下不停滲水，裏面有個小男孩壓低聲音：「哥哥，唔好畀佢入嚟。」',
      '門鎖上面有兩個凹位，一個似相片形狀，一個似鏡子。你注意到門邊有張告示：「被承認的人，永遠都走唔出十三樓。」'
    ],
    choices:[
      {label:'用家庭照解開門鎖',hint:'需要家庭照・真相路線',to:'blood_truth',requiresItem:'刮花的家庭照'},
      {label:'聽孩子指示，拒絕承認自己係住戶',to:'blood_truth',requires:'blood_child_warning',effect:{flags:['blood_resisted']}},
      {label:'按照阿霧紙條尋找真正的第一道門',hint:'盟友提示・隱藏安全路線',to:'blood_truth',requiresItem:'阿霧的紙條',effect:{flags:['blood_hidden_door'],journal:'阿霧的紙條幫你避開血月公寓的假出口。'}},
      {label:'拆開封住門嘅紅線',hint:'生命 -14・危險捷徑',to:'blood_breach',effect:{hp:-14,flags:['blood_broken_line']}},
      {label:'答應成為十三樓新住戶換取安全',hint:'理智 -20・黑暗結局',to:'blood_ending',effect:{sp:-20,flags:['blood_new_resident']}}
    ]
  },
  blood_truth: {
    id:'blood_truth',title:'房間裏面真正的孩子',world:'血月公寓',theme:'apartment',speaker:'小男孩',face:'girl',
    lines:[
      '門打開一條縫，裏面冇任何人。你只見到一個塞滿舊玩具嘅房間，同埋掛喺牆上嘅兒童手印。',
      '小男孩嘅聲音由你背後傳出：「多謝你冇叫我個名。其實我早就唔喺度……」',
      '你發現整幢公寓都係一個用名字留住亡魂嘅巨大儀式。'
    ],
    choices:[
      {label:'破壞儀式，讓孩子真正離開',hint:'損失理智；善結局',to:'blood_ending',effect:{sp:-12,flags:['blood_ritual_broken','blood_saved_child'],items:['紅線斷片'],journal:'你破解血月公寓的姓名儀式，釋放了被困的孩子。'}},
      {label:'保留儀式，偷走其中一塊符石',hint:'力量路線',to:'blood_ending',effect:{items:['十三樓符石'],flags:['blood_stole_stone'],sp:-8}},
      {label:'默默離開',to:'blood_ending',effect:{flags:['blood_left_child']}}
    ]
  },
  blood_breach: {
    id:'blood_breach',title:'破門的代價',world:'血月公寓',theme:'apartment',speaker:'旁白',face:'system',
    lines:[
      '紅線一斷，所有房門同時彈開。數十個唔見樣嘅住戶企滿成條走廊，齊聲問：「你住邊間房？」',
      '你依靠無名生還者嘅身份衝出包圍，但左手永久留低一道紅色手印。'
    ],
    choices:[
      {label:'沿逃生梯衝落樓',to:'blood_ending',effect:{flags:['blood_escape_mark'],journal:'你違反紅線規則，以生命代價衝出血月公寓。'}},
      {label:'回頭拎走孩子的玩具',to:'blood_ending',effect:{hp:-8,items:['小男孩的玩具'],flags:['blood_toy_saved']}}
    ]
  },
  blood_ending: {
    id:'blood_ending',title:'血月公寓・結算',world:'血月公寓',theme:'apartment',speaker:'主神系統',face:'system',
    lines:[
      '你踏出大樓嗰刻，天上嘅血月裂開。背後十三樓嘅燈光逐間熄滅。',
      '系統冇立即宣布勝利，而係彈出一句：「每個被遺忘嘅名字，都要由另一個人承擔。」',
      '【通關條件已滿足。當中嘅人有冇被拯救，會影響其他世界。】'
    ],
    choices:[
      {label:'帶住孩子的自由返回中轉站',hint:'救贖結局',to:'hub_return',requires:'blood_saved_child',effect:{clearWorld:'血月公寓',points:110,flags:['blood_good_end'],journal:'血月公寓「遺忘者的救贖」結局，孩子成功解放。'}},
      {label:'接受自己成為新住戶的代價',hint:'黑暗結局',to:'hub_return',requires:'blood_new_resident',effect:{clearWorld:'血月公寓',points:35,flags:['blood_dark_end'],journal:'血月公寓黑暗結局：你仍與十三樓連接。'}},
      {label:'返到主神中轉站',hint:'普通結局',to:'hub_return',effect:{clearWorld:'血月公寓',points:65,flags:['blood_normal_end']}}
    ]
  },
  hospital_arrival: {
    id:'hospital_arrival',title:'鏡城病院・入院通知',world:'鏡城病院',theme:'hospital',speaker:'護士',face:'nurse',
    lines:[
      '一陣刺鼻嘅消毒水味湧入鼻腔。你瞓喺病床上，左手手腕戴住病人手帶：「姓名：不詳。編號：0000。」',
      '牆上護士站公告寫住：「病院只有活人可以出院。」',
      '一個穿白袍嘅護士笑住問你：「你想先確認病歷，定係直接簽出院紙？」'
    ],
    choices:[
      {label:'檢查自己嘅病歷',hint:'調查・主線真相',to:'hospital_records'},
      {label:'問護士點解冇自己名字',to:'hospital_nurse'},
      {label:'直接簽出院紙',hint:'可能觸發身份陷阱',to:'hospital_wrong',effect:{sp:-12,flags:['hospital_signed_unknown']}}
    ]
  },
  hospital_records: {
    id:'hospital_records',title:'病歷上的第零位病人',world:'鏡城病院',theme:'hospital',speaker:'旁白',face:'system',
    lines:[
      '病歷第一頁寫住：「病人 0000，曾接受七次記憶重置。」同失物管理處嗰份檔案吻合。',
      '第二頁更加古怪：「真正患者仍然留喺鏡子另一邊。」你抬頭，床尾嗰塊鏡倒映住另一個自己。',
      '鏡中嘅你似乎有嘢想講，但佢冇發出任何聲音。'
    ],
    choices:[
      {label:'同鏡入面嘅自己傾偈',hint:'隱藏記憶',to:'hospital_mirror',effect:{flags:['hospital_chart'],journal:'鏡城病院認定玩家0000接受過七次記憶重置。'}},
      {label:'將病歷帶走後質問護士',to:'hospital_nurse',effect:{items:['0000病歷'],flags:['hospital_chart']}},
      {label:'撕走自己個病人手帶',hint:'生命 -9',to:'hospital_mirror',effect:{hp:-9,flags:['hospital_no_band']}}
    ]
  },
  hospital_nurse: {
    id:'hospital_nurse',title:'笑容不會變的護士',world:'鏡城病院',theme:'hospital',speaker:'護士',face:'nurse',
    lines:[
      '護士微笑嘅角度一直冇變。「我哋唔會醫治冇病嘅人，只會確保每位患者記得自己應該係邊個。」',
      '佢忽然伸出手：「如果你有之前世界嘅檔案，我可以帶你去見院長。」',
      '你隱約聽見鏡入面有人用你從未聽過嘅聲音講：「唔好相信佢。」'
    ],
    choices:[
      {label:'展示玩家 0000 檔案，要求見院長',to:'hospital_mirror',requiresItem:'玩家0000檔案',effect:{flags:['hospital_director'],journal:'護士見到玩家0000檔案後，容許你接近院長的鏡面。'}},
      {label:'以無名身份拒絕入院',to:'hospital_mirror',effect:{flags:['hospital_refused']}},
      {label:'完全相信護士，交出記憶',hint:'理智 -18',to:'hospital_wrong',effect:{sp:-18,flags:['hospital_trusted_nurse']}}
    ]
  },
  hospital_wrong: {
    id:'hospital_wrong',title:'簽紙時看見的名字',world:'鏡城病院',theme:'hospital',speaker:'旁白',face:'system',
    lines:[
      '筆尖一碰到紙，你嘅手竟然不受控制寫咗一個自己唔認識嘅名字。',
      '護士開始拍掌。「恭喜，你終於肯承認自己係第零號病人。」你發現鏡中嘅自己正逐步走出嚟。'
    ],
    choices:[
      {label:'立即撕毀出院紙',hint:'生命 -12',to:'hospital_mirror',effect:{hp:-12,flags:['hospital_broke_contract']}},
      {label:'承受代價，記住嗰個陌生名字',hint:'獲得線索・理智 -16',to:'hospital_mirror',effect:{sp:-16,flags:['hospital_false_name'],journal:'你記得一個陌生名字，但不肯定是否屬於自己。'}}
    ]
  },
  hospital_mirror: {
    id:'hospital_mirror',title:'鏡子另一面的人',world:'鏡城病院',theme:'hospital',speaker:'鏡中人',face:'girl',
    lines:[
      '鏡入面嘅另一個你終於開口：「我唔係想取代你。我只係保管住你每次被清除嘅記憶。」',
      '「如果你打碎呢塊鏡，就可以離開，但過去嘅真相會永遠消失。相反，如果你將我帶出去，主神就會開始追捕我哋。」',
      '你手上嘅鏡面碎片微微震動，彷彿喺等緊你做決定。'
    ],
    choices:[
      {label:'答應帶鏡中人離開',hint:'真相路線・理智 -15',to:'hospital_ending',effect:{sp:-15,flags:['hospital_freed_echo'],items:['鏡中人的記憶'],journal:'你保留鏡中人的記憶，決定與主神系統對抗。'}},
      {label:'用鏡域共鳴喚醒被抹除的原始檔案',hint:'鏡域天賦專屬・額外真相',to:'hospital_ending',requiresTalent:'mirror',effect:{sp:-9,xp:50,flags:['hospital_original_self','hospital_freed_echo'],items:['初始輪迴殘片'],journal:'你用鏡域天賦取得輪迴第一次發生時的原始記憶。'}},
      {label:'用鏡面碎片打碎醫院鏡子',hint:'安全逃生・犧牲真相',to:'hospital_ending',effect:{flags:['hospital_destroyed_mirror'],sp:8}},
      {label:'同鏡中人討價還價，要求先還部分記憶',hint:'需要阿霧信任',to:'hospital_ending',bondAtLeast:2,effect:{flags:['hospital_partial_memory'],sp:-5,items:['失去的第七段記憶'],journal:'第七段記憶顯示主神中轉站有一位玩家正在假扮引路人。'}},
      {label:'用血月公寓的紅線封住鏡面裂口',hint:'跨世界道具・穩住鏡中人',to:'hospital_ending',requiresItem:'紅線斷片',effect:{flags:['hospital_freed_echo','hospital_redline'],sp:5,items:['鏡中人的記憶'],journal:'你用另一個世界嘅紅線保護鏡中人離開病院。'}}
    ]
  },
  hospital_ending: {
    id:'hospital_ending',title:'鏡城病院・結算',world:'鏡城病院',theme:'hospital',speaker:'主神系統',face:'system',
    lines:[
      '病院走廊變得無限長。所有鏡子同時裂開，化成一條通往候車廳嘅路。',
      '【副本通關。記憶是否獲得釋放，已納入之後世界的因果判定。】'
    ],
    choices:[
      {label:'同鏡中人一齊穿過出口',to:'hub_return',requires:'hospital_freed_echo',effect:{clearWorld:'鏡城病院',points:95,flags:['hospital_true_end'],journal:'鏡城病院真相結局：你帶走鏡中人的記憶。'}},
      {label:'帶住破碎但自由嘅記憶返去',to:'hub_return',requires:'hospital_partial_memory',effect:{clearWorld:'鏡城病院',points:85,flags:['hospital_memory_end']}},
      {label:'拋低鏡子，返回中轉站',to:'hub_return',effect:{clearWorld:'鏡城病院',points:60,flags:['hospital_normal_end']}}
    ]
  },
  rift_arrival: {
    id:'rift_arrival',title:'不穩定裂隙・下一個世界',world:'未知世界',theme:'rift',speaker:'主神系統',face:'system',
    lines:[
      '三個已完成嘅世界喺身後逐個熄滅。但中轉站中央，原本不存在嘅門忽然出現。',
      '「系統警告：未知副本正在自我生成。」門牌不斷改寫，一時係雨夜戲院，一時係白霧校園，一時變成永遠到唔到站嘅列車。',
      '你知道前方冇既定嘅安全路線。每次進入裂隙，你嘅選擇都會改變之後可用嘅資源。'
    ],
    choices:[
      {label:'觀察未知世界嘅規則碎片',to:'rift_choice',effect:{sp:-4,flags:['rift_observed'],journal:'裂隙副本會重組之前世界殘留的規則。'}},
      {label:'立即進入，依靠直覺行事',to:'rift_choice',effect:{hp:-7}},
      {label:'向阿霧請教',to:'rift_choice',bondAtLeast:2,effect:{sp:6}}
    ]
  },
  rift_choice: {
    id:'rift_choice',title:'重組的異常世界',world:'未知世界',theme:'rift',speaker:'未知聲音',face:'system',
    lines:[
      '你看見之前所有世界嘅居民企喺遠處。唔知點解，佢哋似乎都記得你曾經做過嘅選擇。',
      '一把聲音喺耳邊講：「你可以犧牲一部分生命換線索，或者保住自己，帶走更多力量。」'
    ],
    choices:[
      {label:'拼合玩家0000與鏡中人的完整記憶',hint:'跨世界隱藏線・大量積分',to:'rift_exit',requires:'hospital_freed_echo',requiresItem:'玩家0000檔案',effect:{sp:-9,points:85,flags:['rift_combined_memory'],journal:'你在裂隙中拼湊到主神輪迴核心的重要記憶。'}},
      {label:'調查深處的斷裂記憶',hint:'理智 -12・情報',to:'rift_exit',effect:{sp:-12,points:35,flags:['rift_truth'],journal:'你在不穩定世界捕捉到另一段主神輪迴記憶。'}},
      {label:'嘗試救助被困嘅陌生人',hint:'生命 -18・羈絆',to:'rift_exit',effect:{hp:-18,bond:1,points:20}},
      {label:'擊退異常世界守門者',hint:'可選戰鬥',action:'battle',enemy:'echo',to:'rift_exit'},
      {label:'直接尋找離開嘅門',hint:'安全但獎勵較少',to:'rift_exit',effect:{points:10}}
    ]
  },
  rift_exit: {
    id:'rift_exit',title:'輪迴仍未完結',world:'未知世界',theme:'rift',speaker:'主神系統',face:'system',
    lines:[
      '你成功返到中轉站。但今次冇出現「最終通關」四個字。',
      '【世界編號已更新。新的異常組合將繼續生成。】遠方又有一道從未見過嘅門，緩緩打開。',
      '阿霧望住你：「我哋可能永遠唔會知道終點喺邊。不過你選擇帶返嚟嘅嘢，都會留喺你身上。」'
    ],
    choices:[
      {label:'保存呢一輪收穫，返回主神空間',to:'hub_return',effect:{points:25,riftAdvance:true,journal:'穿越一次不穩定裂隙。主神輪迴仍在繼續。'}},
      {label:'立即迎接下一次穿越',to:'rift_arrival',effect:{riftAdvance:true,points:15}}
    ]
  }
}

export function availableChoices(scene: Scene, state: SaveState): Choice[] {
  return scene.choices.filter(c => {
    if(c.requires && !state.flags.includes(c.requires)) return false
    if(c.without && state.flags.includes(c.without)) return false
    if(c.requiresItem && !state.items.includes(c.requiresItem)) return false
    if(c.bondAtLeast !== undefined && state.bond < c.bondAtLeast) return false
    if(c.requiresTalent && talentRank(state,c.requiresTalent)<1)return false
    if(c.notCleared && state.cleared.includes(c.notCleared)) return false
    if(c.needsCleared && !c.needsCleared.split('|').every(w=>state.cleared.includes(w))) return false
    return true
  })
}
export function applyEffect(state: SaveState, effect?: Effect): SaveState {
  if(!effect) return state
  const items = Array.from(new Set([...state.items, ...(effect.items||[])]))
    .filter(item=>!effect.removeItems?.includes(item))
  const flags = Array.from(new Set([...state.flags, ...(effect.flags||[])]))
  const cleared = effect.clearWorld && !state.cleared.includes(effect.clearWorld)
    ? [...state.cleared, effect.clearWorld] : state.cleared
  const firstClear=!!effect.clearWorld&&!state.cleared.includes(effect.clearWorld)
  return awardXp({
    ...state,
    hp: Math.max(0,Math.min(maxHp(state),state.hp+(effect.hp||0))),
    sp: Math.max(0,Math.min(maxSp(state),state.sp+(effect.sp||0))),
    points: Math.max(0,state.points+(effect.points||0)),
    bond: Math.max(-5,Math.min(10,state.bond+(effect.bond||0))),
    items, flags, cleared,
    riftCount: state.riftCount+(effect.riftAdvance?1:0),
    chapter: Math.max(state.chapter,cleared.length),
    journal: effect.journal ? [effect.journal,...state.journal].slice(0,30):state.journal
  },(effect.xp||0)+(firstClear?80:0))
}
export function sceneFor(id:string):Scene {
  return SCENES[id] || SCENES.hub_arrival
}
export function effectiveLines(scene:Scene,state:SaveState):string[]{
  if(scene.id==='hub_return') return [
    '你再一次返到主神中轉站。已經完成 '+state.cleared.length+' 個世界。阿霧企喺小賣部門口，似乎一直等緊你。',
    state.flags.includes('lost_true_end') ? '「小滿話，你真係守住咗承諾。」你驚訝地望住阿霧——原來不同世界嘅人，真係會記得你。' :
    state.flags.includes('hospital_freed_echo') ? '阿霧見到你帶返嚟嘅鏡中記憶，忽然避開你嘅目光。' :
    '「你返嚟就好。」阿霧望住你身上嘅傷，冇再追問。',
    '下一道門正等待你。你可以隨時翻查記錄、補給，或者繼續穿越。'
  ]
  if(scene.id==='rift_arrival' || scene.id==='rift_choice') {
    const theme=['雨夜戲院','白霧校園','逆行列車'][state.riftCount%3]
    return scene.lines.map((line,index)=>index===0?'【裂隙 '+String(state.riftCount+1).padStart(3,'0')+'：'+theme+'】'+line:line)
  }
  return scene.lines
}
