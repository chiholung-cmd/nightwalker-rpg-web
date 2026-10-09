import type { Scene } from './infiniteStory'

/** Player-written branches in the real 2004 film Van Helsing universe. */
export const HELSING_WORLD: Record<string, Scene> = {
  vh_arrival:{
    id:'vh_arrival',title:'02・特蘭西瓦尼亞：惡魔獵人的任務',world:'Van Helsing（2004）',theme:'gothic',speaker:'主神系統',face:'system',
    moods:['mystery','fear','resolve'],
    lines:[
      '【進入電影《Van Helsing》（2004）】你喺梵蒂岡秘密武器室醒來。Gabriel Van Helsing 正檢查武器；Friar Carl 拿住各種改裝圖紙，準備啟程。',
      '你知道佢哋將前往特蘭西瓦尼亞保護 Anna Valerious，追查 Dracula。Van Helsing 本身失去部分記憶，而 Anna 嘅家族背負一段古老誓言。',
      '【主神任務】幫助主角阻止 Dracula 嘅計劃並活到任務結束。完成 150 積分／60 XP；【支線】拯救 Anna、拯救 Velkan、保護 Frankenstein 造物。'
    ],
    choices:[
      {label:'同 Carl 研究改良弩箭同裝備',hint:'科研合作・技術路線',to:'vh_carl',effect:{flags:['vh_carl_ally']}},
      {label:'先向 Van Helsing 詢問失憶同任務真相',hint:'人物路線',to:'vh_helsing',effect:{flags:['vh_helsing_question']}},
      {label:'提前去 Valerious 家族城堡示警',hint:'錯過獵人小隊・搶時間',to:'vh_anna',effect:{flags:['vh_early_anna'],hp:-7}}
    ]
  },
  vh_carl:{
    id:'vh_carl',title:'Carl 的秘密工作桌',world:'Van Helsing（2004）',theme:'gothic',speaker:'Carl',face:'neighbor',
    moods:['joy','mystery','resolve'],
    lines:[
      'Carl 打開裝滿各式工具嘅皮箱。「我需要嘅唔係勇氣，係有人真係睇得明機關點運作！」佢見到你帶來蜂巢識別牌，皺起眉。',
      '你向佢描述現代電子門鎖原理。雖然吸血鬼與病毒並唔相同，隔離、辨識感染路線嘅思路，或許有助研究狼人。',
      'Carl 問你：「要我幫你做一樣武器，定係優先研究防止狼人失控嘅束縛器？」'
    ],
    choices:[
      {label:'幫 Carl 做抗狼人拘束器',hint:'救 Velkan 路線',to:'vh_helsing',effect:{items:['改良銀鎖'],flags:['vh_restrain_wolf'],sp:-6}},
      {label:'用蜂巢科技記錄輔助 Carl 研究',hint:'跨世界科技專屬',to:'vh_helsing',requires:'re_spence_exposed',effect:{items:['動力封鎖器'],flags:['vh_science_merge'],xp:30}},
      {label:'要求改良吸血鬼防衛武器',hint:'降低遭遇風險',to:'vh_helsing',effect:{items:['便攜銀弩'],flags:['vh_weapon_prepared']}}
    ]
  },
  vh_helsing:{
    id:'vh_helsing',title:'獵魔人：名字以外的過去',world:'Van Helsing（2004）',theme:'gothic',speaker:'Van Helsing',face:'clerk',
    moods:['mystery','resolve','sad'],
    lines:[
      'Van Helsing 聽到你亦失去名字，沉默咗片刻。「記唔起過去，唔代表你可以逃避依家作嘅決定。」',
      '佢解釋教廷希望除去 Dracula，亦希望避免 Valerious 家族悲劇延續。你知道 Anna 嘅弟弟 Velkan 將受狼人詛咒影響。',
      '「呢一程唔係去殺幾隻怪物咁簡單。」獵魔人問你願意幫邊個。'
    ],
    choices:[
      {label:'答應全力保護 Anna 同 Velkan',hint:'救援支線',to:'vh_anna',effect:{flags:['vh_guard_valerious'],bond:1}},
      {label:'重點追查 Dracula 同 Frankenstein 研究',hint:'真相路線',to:'vh_village',effect:{flags:['vh_investigate_frank']}},
      {label:'表示以主神任務成功為優先',hint:'保持距離',to:'vh_village',effect:{flags:['vh_mission_first']}}
    ]
  },
  vh_anna:{
    id:'vh_anna',title:'Valerious 城堡：Anna 的決心',world:'Van Helsing（2004）',theme:'gothic',speaker:'Anna Valerious',face:'girl',
    moods:['anger','sad','resolve'],
    lines:[
      'Anna 將弩箭對準你。「如果你唔係來幫我對付 Dracula，就唔好阻住我救 Velkan。」佢嘅聲音比想像中更疲倦。',
      '你清楚電影發展：Velkan 被狼人咬傷後變成狼人，Anna 雖然一路努力，到最後依然會犧牲。此刻只要一個失當提示，就可能令佢更加衝動。',
      '佢終於收起武器：「你有幾大把握可以救返我弟弟？」'
    ],
    choices:[
      {label:'承認唔能夠保證，但會與佢一齊搵方法',hint:'建立 Anna 信任',to:'vh_village',effect:{flags:['vh_anna_trust'],bond:1,journal:'你答應 Anna 會將保護 Velkan 作為真正目標。'}},
      {label:'直接透露佢原本會死亡嘅結局',hint:'驚動 Anna・理智 -9',to:'vh_village',effect:{flags:['vh_anna_prophecy'],sp:-9}},
      {label:'教佢先派人監視山谷同狼人行蹤',hint:'掌握遭遇時間',to:'vh_village',effect:{flags:['vh_valley_watch'],sp:-4}}
    ]
  },
  vh_village:{
    id:'vh_village',title:'村莊襲擊：吸血鬼新娘',world:'Van Helsing（2004）',theme:'gothic',speaker:'Carl',face:'neighbor',
    moods:['fear','resolve','mystery'],
    lines:[
      '村莊上空出現幾道黑影，Dracula 嘅新娘們俯衝而下。街道一時間充滿尖叫，Anna 已經提弓迎戰。',
      'Carl 邊跑邊問你點樣分散居民。你知道 Marishka 嘅死亡可能改變其他新娘嘅策略，而 Velkan 仍然係更大威脅。',
      '【選擇後果】先救村民、保護 Anna、或者保存研究設備，會改變你稍後可用嘅資源。'
    ],
    choices:[
      {label:'與 Anna 合作撤走街上村民',hint:'信任＋保命線',to:'vh_velkan',effect:{flags:['vh_villagers_saved'],hp:-12,bond:1}},
      {label:'掩護 Carl 保存獵魔設備',hint:'科技線',to:'vh_velkan',effect:{flags:['vh_carl_saved_gear'],sp:-6}},
      {label:'追擊新娘獲取 Dracula 計劃嘅線索',hint:'高風險調查',to:'vh_velkan',effect:{flags:['vh_bride_clue'],items:['新娘徽印'],hp:-15}}
    ]
  },
  vh_velkan:{
    id:'vh_velkan',title:'Velkan：血月下的詛咒',world:'Van Helsing（2004）',theme:'gothic',speaker:'Velkan',face:'clerk',
    moods:['fear','sad','anger'],
    lines:[
      '一頭狼人由樹影衝出，你見到佢身上有 Valerious 家族嘅記號。Anna 哽住聲：「Velkan……」',
      '狼人對銀器出現本能退縮；但隔住短短一瞬間，Velkan 似乎認得自己姊姊。你知道佢最終可能死於追擊，令 Anna 徹底失去家人。',
      '你有機會提前保護佢，但主神冇保證解咒成功。'
    ],
    choices:[
      {label:'用改良銀鎖暫時拘束 Velkan',hint:'拯救支線・需 Carl 裝備',to:'vh_frankenstein',requiresItem:'改良銀鎖',effect:{flags:['vh_velkan_restrained'],sp:-8}},
      {label:'說服 Anna 暫時唔殺 Velkan',hint:'Anna 信任路線',to:'vh_frankenstein',requires:'vh_anna_trust',effect:{flags:['vh_velkan_spared'],hp:-9}},
      {label:'與獵人並肩擊退狼人，放棄救援',hint:'安全但失去救人支線',to:'vh_frankenstein',effect:{flags:['vh_velkan_lost'],sp:-7}}
    ]
  },
  vh_frankenstein:{
    id:'vh_frankenstein',title:'Frankenstein 城堡：怪物不是電池',world:'Van Helsing（2004）',theme:'gothic',speaker:'Frankenstein 造物',face:'clerk',
    moods:['sad','anger','resolve'],
    lines:[
      '喺廢棄風車附近，一位身上滿布縫線嘅造物低聲講：「Dracula 想將我變成佢孩子嘅生命來源。」',
      '你知道電影入面 Dracula 需要 Frankenstein 造物配合機器，令吸血鬼幼體獲得生命；Velkan 亦曾被當成能源。',
      '造物望住你：「你會唔會同佢哋一樣，覺得我只係一件工具？」'
    ],
    choices:[
      {label:'答應保護造物，不交佢畀 Dracula',hint:'建立造物信任',to:'vh_ball',effect:{flags:['vh_monster_ally'],bond:1,journal:'你將 Frankenstein 造物視作需要保護的生命。'}},
      {label:'與 Carl 研究機器故障及幼體弱點',hint:'科技路線',to:'vh_ball',effect:{flags:['vh_machine_analysis'],items:['Frankenstein 能量草圖'],sp:-8}},
      {label:'表面答應交出造物，交換 Anna 安全',hint:'危險談判',to:'vh_ball',effect:{flags:['vh_monster_trade'],sp:-12}}
    ]
  },
  vh_ball:{
    id:'vh_ball',title:'假面舞會：Anna 的劫難',world:'Van Helsing（2004）',theme:'gothic',speaker:'Dracula',face:'clerk',
    moods:['mystery','anger','resolve'],
    lines:[
      '舞會大廳燭火搖曳，Anna 被逼留喺舞池。Dracula 終於現身，微笑著問你：「一個外來者，點解咁在乎本來會死嘅人？」',
      'Van Helsing 準備救人，Carl 正喺後台設計撤退路線。你知道整個宴會可能都係吸血鬼偽裝嘅陷阱。',
      '你必須選：守護 Anna、揭開派對真相，或者搶先保護 Frankenstein 造物。'
    ],
    choices:[
      {label:'與 Van Helsing 配合帶 Anna 走後台',hint:'需 Anna 信任・建立救援默契',to:'vh_crypt',requires:'vh_anna_trust',effect:{flags:['vh_anna_rescue_plan'],hp:-10}},
      {label:'利用 Carl 保留嘅裝備製造混亂',hint:'科技協作路線',to:'vh_crypt',requires:'vh_carl_saved_gear',effect:{flags:['vh_escape_gear'],sp:-8}},
      {label:'先救 Frankenstein 造物離開舞會',hint:'生存＋義務選擇',to:'vh_crypt',requires:'vh_monster_ally',effect:{flags:['vh_monster_saved'],hp:-12}},
      {label:'以自己作餌吸引 Dracula 嘅注意',hint:'高風險・生命 -19',to:'vh_crypt',effect:{flags:['vh_dracula_alert'],hp:-19}}
    ]
  },
  vh_crypt:{
    id:'vh_crypt',title:'冰封城堡：狼人與解藥',world:'Van Helsing（2004）',theme:'gothic',speaker:'Carl',face:'neighbor',
    moods:['mystery','fear','resolve'],
    lines:[
      '你們靠破碎畫作找到通往 Dracula 冰封城堡嘅入口。Carl 指出一個關鍵：只有狼人形態有能力真正殺死 Dracula，而 Dracula 手上亦藏有解咒藥劑。',
      'Van Helsing 已被狼人咬傷，Anna 似乎意識到呢場勝利會付出可怕代價。',
      '電影原本會走向 Dracula 死亡，但 Anna 喺解咒後失去生命。你終於抵達可以真正改變佢結局嘅關鍵。'
    ],
    choices:[
      {label:'用之前分析嘅裝置設計安全注射距離',hint:'需要科學情報；救 Anna 條件之一',to:'vh_last_choice',requires:'vh_machine_analysis',effect:{flags:['vh_cure_delivery'],sp:-8}},
      {label:'請 Frankenstein 造物牽制其他吸血鬼',hint:'需保護造物',to:'vh_last_choice',requires:'vh_monster_saved',effect:{flags:['vh_safe_corridor'],hp:-6}},
      {label:'將 Karl 嘅裝備交畀 Anna 自己決定',hint:'需 Carl 支援',to:'vh_last_choice',requires:'vh_escape_gear',effect:{flags:['vh_anna_can_choose'],bond:1}},
      {label:'依原本電影流程行動，靠最後一刻施救',hint:'保留既定歷史',to:'vh_last_choice',effect:{flags:['vh_follow_canon'],sp:-9}}
    ]
  },
  vh_last_choice:{
    id:'vh_last_choice',title:'黎明前：救贖定係重演悲劇',world:'Van Helsing（2004）',theme:'gothic',speaker:'Anna Valerious',face:'girl',
    moods:['fear','resolve','sad'],
    lines:[
      'Van Helsing 變成狼人與 Dracula 死戰，整座城堡都喺震動。Carl 攞住解咒藥劑，Anna 睇到狼形態嘅獵人逐漸失去控制。',
      'Anna 抬頭望住你：「如果佢唔記得自己係邊個，仲算唔算係原本嘅佢？」你知道一切取決於解藥送達時機。',
      '【決定性分支】你只能保住一條優先路線；救人可能令主神認定世界線嚴重偏移。'
    ],
    choices:[
      {label:'借助安全注射設計，提前為 Van Helsing 解咒',hint:'Anna 存活・科學支線',to:'vh_ending',requires:'vh_cure_delivery',effect:{flags:['vh_anna_survived','vh_dracula_defeated'],hp:-14,sp:-11,journal:'你利用改良注射時機令 Anna 逃過原電影死亡結局。'}},
      {label:'保護 Anna 留喺隔離通道等戰鬥結束',hint:'需安全撤離路線',to:'vh_ending',requires:'vh_safe_corridor',effect:{flags:['vh_anna_survived','vh_monster_protected','vh_dracula_defeated'],hp:-17}},
      {label:'由 Anna 自己掌握最後一刻嘅救援選擇',hint:'Anna 自主權・不保證生還',to:'vh_ending',requires:'vh_anna_can_choose',effect:{flags:['vh_anna_choice','vh_dracula_defeated'],sp:-12}},
      {label:'先封鎖 Dracula 留低嘅幼體孵化設備',hint:'保住外界・犧牲介入時間',to:'vh_ending',effect:{flags:['vh_brood_destroyed','vh_dracula_defeated'],hp:-11}},
      {label:'照住原電影救贖順序，唔再改動',hint:'主線完成但 Anna 原定犧牲',to:'vh_ending',effect:{flags:['vh_canon_anna_loss','vh_dracula_defeated'],sp:-14}}
    ]
  },
  vh_ending:{
    id:'vh_ending',title:'第二世界結算：家族詛咒終止',world:'Van Helsing（2004）',theme:'gothic',speaker:'主神系統',face:'system',
    moods:['sad','mystery','resolve'],
    lines:[
      '冰封城堡嘅黑夜終於退去。Dracula 已經消失，而 Valerious 家族幾百年來嘅宿命，喺你眼前出現咗另一個版本。',
      'Anna 是否活下來、Velkan 是否被你提前保護、造物有冇獲得自由，主神全部照實記錄。',
      '【主線通關】完成基本獎勵 150 積分、60 XP；追加支線可得到 D 級支線憑證及跨世界遺物。'
    ],
    choices:[
      {label:'奇蹟結局：Anna 得以生還',hint:'D 級支線，攜帶獵魔知識',to:'vh_clear',requires:'vh_anna_survived',effect:{points:110,branch:'D',flags:['vh_good_end'],items:['Anna 的守護誓言'],journal:'Anna 在你的世界線活過了電影最終戰。'}},
      {label:'造物自由結局：保護異類生命',hint:'額外獎勵',to:'vh_clear',requires:'vh_monster_protected',effect:{points:70,branch:'D',flags:['vh_mercy_end'],items:['Frankenstein 的手稿副本']}},
      {label:'接受主線結算，回歸中轉站',hint:'基本完成',to:'vh_clear',effect:{flags:['vh_normal_end']}}
    ]
  },
  vh_clear:{
    id:'vh_clear',title:'第二世界完成：通往武林',world:'Van Helsing（2004）',theme:'gothic',speaker:'主神系統',face:'system',
    moods:['resolve','mystery'],
    lines:[
      '你重新站喺主神空間嘅傳送門前。手上殘留銀器刺鼻嘅味道，而另一道光幕已經換成飛舞嘅天下會旗幟。',
      '【跨世界成長】教廷封印、Carl 改裝工具與 Anna 對命運嘅選擇，會影響你面對雄霸嘅手段。下一關唔再係現代科技或吸血鬼，而係江湖。'
    ],
    choices:[{label:'領取第二世界獎勵，解鎖《風雲雄霸天下》',to:'movie_after_second',effect:{clearWorld:'VanHelsing2004',points:150,xp:60,items:['獵魔人銀質證章'],mastery:'occult',journal:'電影世界 02 Van Helsing（2004）通關；世界 03《風雲雄霸天下》解鎖。'}}]
  },
  movie_after_second:{
    id:'movie_after_second',title:'第三部電影：風雲起',world:'主神中轉站',theme:'nexus',speaker:'阿霧',face:'guide',
    moods:['mystery','resolve','joy'],
    lines:[
      '阿霧睇住新出現嘅光幕。「原本你係睇住電影入面嘅人面對命運，去到第三關，可能輪到你學識揀一個立場。」',
      '光幕播出天下會嘅旗幟，聶風同夜雨中的步驚雲背對而立。遠方一名老者將預言放入機關盒。',
      '【世界 03 已解鎖】《風雲雄霸天下》（1998），以電影人物及事件為準。'
    ],
    choices:[{label:'進入 1998 電影《風雲雄霸天下》',to:'fy_arrival',needsCleared:'VanHelsing2004',notCleared:'風雲1998'},{label:'先整理回歸獎勵與裝備',to:'movie_portals'}]
  }
}
