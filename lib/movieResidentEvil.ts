import type { Scene } from './infiniteStory'

/** Nightwalker cinematic trilogy. Licensed movie names/characters are references;
 * all player routes and dialogue are newly written, not screenplay transcriptions.
 * The canon timeline is an entry point, not an outcome requirement.
 */
export const MOVIE_TRILOGY: Record<string, Scene> = {
  movie_brief:{
    id:'movie_brief',title:'主神契約・輪迴電影三部曲',world:'主神中轉站',theme:'nexus',speaker:'主神系統',face:'system',
    moods:['mystery','resolve','mystery'],
    lines:[
      '【輪迴電影序列已鎖定】第一站《生化危機》（2002）；第二站《Van Helsing》（2004）；第三站《風雲雄霸天下》（1998）。主神會將你投放到原有劇情之中，但你唔會自動獲得主角嘅能力。',
      '每關都有【主線任務】同【隱藏支線】。生存同完成主線先可以解鎖下一套電影；隱藏支線可以帶走關鍵道具、支線憑證，同令人物嘅命運偏離電影。',
      '你可以靠對話、調查、犧牲、欺瞞或者與 NPC 合作推進故事。戰鬥暫時用劇情抉擇解決。所有選擇永久記錄喺單機存檔。'
    ],
    choices:[
      {label:'開始世界 01：《生化危機》',hint:'蜂巢・紅后・生存',to:'re_arrival',notCleared:'生化危機2002'},
      {label:'查看電影世界傳送門',hint:'按通關進度順序解鎖',to:'movie_portals'},
      {label:'詢問阿霧點樣令劇情改變',to:'movie_guide'}
    ]
  },
  movie_guide:{
    id:'movie_guide',title:'介入劇情嘅代價',world:'主神中轉站',theme:'nexus',speaker:'阿霧',face:'guide',
    moods:['mystery','worried','resolve'],
    lines:[
      '阿霧打開你手上嘅舊式手機，入面顯示一條從未出現過嘅訊息：「任何人都可以改變劇本，前提係佢願意承擔世界線變動嘅後果。」',
      '「記得電影點演，唔代表你識得信任邊個。你越早揭露秘密，對方未必越信你；主神又未必會畀你好好等到安全結局。」',
      '「記得將線索帶返中轉站。有啲喺第一關冇用嘅嘢，可能去到第二、三關先變成救命關鍵。」'
    ],
    choices:[{label:'收低建議，進入電影序列',to:'movie_portals',effect:{flags:['movie_rules_known'],journal:'劇情改變有代價；跨世界線索可以在之後的電影中使用。'}}]
  },
  movie_portals:{
    id:'movie_portals',title:'輪迴序列・三個世界',world:'主神中轉站',theme:'nexus',speaker:'主神系統',face:'system',
    moods:['resolve','mystery'],
    lines:[
      '三道電影光幕逐一亮起。第一道通往浣熊市地下蜂巢；第二道係特蘭西瓦尼亞夜空下嘅城堡；第三道則映出天下會嘅旗幟。',
      '【鎖定順序】必須先完成上一部電影先開放下一部。已通關世界留低喺回顧紀錄中；過去嘅抉擇會喺下一關繼續發揮作用。'
    ],
    choices:[
      {label:'01｜《生化危機》（2002）',hint:'主線：生存並離開蜂巢',to:'re_arrival',notCleared:'生化危機2002'},
      {label:'02｜《Van Helsing》（2004）',hint:'完成生化危機後解鎖',to:'vh_arrival',needsCleared:'生化危機2002',notCleared:'VanHelsing2004'},
      {label:'03｜《風雲雄霸天下》（1998）',hint:'完成范海辛後解鎖',to:'fy_arrival',needsCleared:'VanHelsing2004',notCleared:'風雲1998'},
      {label:'完成序列・查看輪迴結算',to:'movie_trilogy_epilogue',needsCleared:'生化危機2002|VanHelsing2004|風雲1998'},
      {label:'返回主神候車廳',to:'hub_return'}
    ]
  },
  re_arrival:{
    id:'re_arrival',title:'01・蜂巢入口：剩餘九十分鐘',world:'生化危機（2002）',theme:'archive',speaker:'主神系統',face:'system',
    moods:['mystery','fear','resolve'],
    lines:[
      '【進入電影《生化危機》（2002）】你喺浣熊市郊外一棟洋館醒來。大門被踢開，James Shade 帶住僱傭兵小隊入屋，Alice 面色蒼白，似乎連自己身份都唔記得。',
      'Rain 叫你雙手放喺睇得見嘅地方；Kaplan 正搜尋通往地下設施嘅列車入口。你知道 Red Queen 封鎖嘅「蜂巢」發生咗 T 病毒事故，而隊伍原本將迎來大量死亡。',
      '【主神任務】蜂巢封鎖前到達地面出口。完成獎勵：120 積分、45 經驗；【支線】保全生還者／保留病毒罪證／避免病毒擴散。'
    ],
    choices:[
      {label:'向 Alice 表明自己記得設施事故',hint:'贏取信任，但你嘅情報來源成疑',to:'re_alice',effect:{flags:['re_told_alice'],sp:-4}},
      {label:'幫 Kaplan 檢查紅后鎖定紀錄',hint:'調查：系統控制權',to:'re_terminal',effect:{flags:['re_help_kaplan']}},
      {label:'留意 Spence 對列車嘅反應',hint:'尋找真正洩漏病毒嘅人',to:'re_spence',effect:{flags:['re_spence_watched']}}
    ]
  },
  re_alice:{
    id:'re_alice',title:'Alice 的疑心',world:'生化危機（2002）',theme:'archive',speaker:'Alice',face:'girl',
    moods:['mystery','worried','resolve'],
    lines:[
      'Alice 望住你手上嘅舊電話：「如果你真係知下面有咩，點解你冇阻止呢班人落去？」你知道佢失憶，但佢未必肯相信陌生人嘅預知。',
      'Rain 企喺門邊聽你哋講嘢。佢唔耐煩咁提醒：入口列車已經啟動，一旦大門封死，外面唔會有人返嚟接你。',
      'Alice 問你最後一次：「我應唔應該信你？」'
    ],
    choices:[
      {label:'告訴佢先保住同伴，暫時唔講背叛者',hint:'Alice 信任',to:'re_terminal',effect:{flags:['re_alice_ally'],bond:1,journal:'你與 Alice 約定以救人及離開蜂巢為優先。'}},
      {label:'立即指控 Spence 偷走病毒',hint:'風險：未有證據',to:'re_spence',effect:{flags:['re_accused_early'],sp:-8}},
      {label:'承認自己只係估計，先去求證',hint:'誠實調查',to:'re_terminal',effect:{flags:['re_honest']}}
    ]
  },
  re_spence:{
    id:'re_spence',title:'失憶者與有意留下的痕跡',world:'生化危機（2002）',theme:'archive',speaker:'Spence',face:'clerk',
    moods:['mystery','anger','fear'],
    lines:[
      'Spence 一聽見「T 病毒」就摸向自己外套內袋。佢同樣聲稱失憶，但對地下列車出口熟悉得唔正常。',
      'Matt 喺另一端話自己想搵妹妹 Lisa。你記起佢係調查 Umbrella 嘅人，卻無法保證每個人喺蜂巢都仲有機會活落去。',
      '你可以冒險搜證，或者留住嫌疑，先處理眼前嘅設備危機。'
    ],
    choices:[
      {label:'暗中記錄 Spence 交代前後矛盾嘅說話',hint:'取得揭穿背叛者嘅情報',to:'re_terminal',effect:{flags:['re_spence_evidence'],items:['Spence 行動記錄'],sp:-3,journal:'Spence 對病毒與列車位置的認知並不符合失憶說法。'}},
      {label:'同 Matt 合作尋找 Lisa 留低嘅檔案',hint:'解鎖 Umbrella 罪證',to:'re_terminal',effect:{flags:['re_matt_ally'],bond:1}},
      {label:'表面相信 Spence，逼佢帶路',hint:'較快，但存在背叛風險',to:'re_terminal',effect:{flags:['re_spence_lead'],hp:-5}}
    ]
  },
  re_terminal:{
    id:'re_terminal',title:'紅后的門：鐳射走廊',world:'生化危機（2002）',theme:'archive',speaker:'Kaplan',face:'neighbor',
    moods:['worried','fear','resolve'],
    lines:[
      'Kaplan 拆開控制面板，入面顯示一道會啟動雷射嘅保安走廊。James Shade 準備帶隊進入 Red Queen 機房。',
      '你記得原有電影入面，呢段路會奪走多名隊員性命；但突然阻止長官，亦可能令小隊失去唯一關閉 AI 嘅機會。',
      'Kaplan 小聲問：「你係咪見過呢套防衛系統？我仲有十幾秒就要落決定。」'
    ],
    choices:[
      {label:'預警雷射陷阱，說服隊長停止衝入',hint:'救 James Shade 支線・用掉時間',to:'re_queen',effect:{flags:['re_saved_james','re_time_cost'],sp:-8,journal:'你阻止隊長直接進入雷射走廊。'}},
      {label:'用 Kaplan 嘅終端建立備用斷線開關',hint:'科技路線・取證機會',to:'re_queen',requires:'re_help_kaplan',effect:{flags:['re_ai_control'],items:['蜂巢系統密鑰'],sp:-5}},
      {label:'順住原定命令進入紅后機房',hint:'保留時間但隊員可能犧牲',to:'re_queen',effect:{flags:['re_laser_losses'],sp:-10}},
      {label:'用真相視界識別保安感應線',hint:'天賦專屬・無需走廊代價',to:'re_queen',requiresTalent:'insight',effect:{flags:['re_saved_james','re_ai_control'],sp:-5,xp:25}}
    ]
  },
  re_queen:{
    id:'re_queen',title:'Red Queen：封鎖真相',world:'生化危機（2002）',theme:'archive',speaker:'Red Queen',face:'system',
    moods:['mystery','anger','resolve'],
    lines:[
      'Red Queen 嘅投影出現喺玻璃後面。佢承認用極端方法封閉設施，因為任何感染者離開，都有可能令地面陷入災難。',
      'Rain 認為要關閉主機救人；Kaplan 擔心停電會令實驗區閘門全部打開。AI 問你：「要救目前活著的幾個人，定係冒險放出更多危險？」',
      '【劇情歧路】紅后是否維持監控，會影響你之後對感染者同防衛門嘅處理。'
    ],
    choices:[
      {label:'同紅后談判：保留封鎖但開啟撤離線',hint:'需要備用斷線或調查信任',to:'re_infected',requires:'re_ai_control',effect:{flags:['re_queen_compromise'],xp:20}},
      {label:'協助 Kaplan 關閉 Red Queen',hint:'原電影關鍵事件・病毒區開始開門',to:'re_infected',effect:{flags:['re_queen_off'],sp:-8}},
      {label:'以封鎖罪證作條件，要求 AI 提供地圖',hint:'調查主線',to:'re_infected',effect:{flags:['re_ai_map'],items:['蜂巢撤離路線圖'],sp:-6}}
    ]
  },
  re_infected:{
    id:'re_infected',title:'Rain 的傷口',world:'生化危機（2002）',theme:'archive',speaker:'Rain',face:'girl',
    moods:['anger','fear','sad'],
    lines:[
      '通道傳嚟雜亂腳步聲。Rain 扯起袖口，你見到一個深深嘅咬痕；而 Kaplan 正捱住牆，努力維持其他人撤離。',
      'Matt 想繼續搵妹妹，Alice 已經想起實驗室可能藏有抗病毒藥劑。你知道電影裏面所謂解藥未必成功。',
      '你要決定有限時間先分配畀邊個。呢個選擇可能令原本會犧牲嘅人有生存機會。'
    ],
    choices:[
      {label:'優先帶 Rain 去隔離醫療艙',hint:'救 Rain 隱藏支線・降低其他機會',to:'re_lab',effect:{flags:['re_rain_quarantine','re_time_cost'],hp:-9,journal:'你提前隔離 Rain，試圖改變她在列車上的命運。'}},
      {label:'同 Matt 搜尋 Lisa 收集嘅 Umbrella 證據',hint:'揭露 Umbrella',to:'re_lab',requires:'re_matt_ally',effect:{flags:['re_lisa_evidence'],items:['Lisa 的實驗副本'],sp:-7}},
      {label:'協助 Kaplan 穩住鐵閘，帶其他人先走',hint:'Kaplan 生還路線',to:'re_lab',effect:{flags:['re_kaplan_saved'],hp:-12}},
      {label:'爭取最快抵達實驗室取得解藥',hint:'優先撤離',to:'re_lab',effect:{flags:['re_antidote_priority'],sp:-4}}
    ]
  },
  re_lab:{
    id:'re_lab',title:'實驗室：真正偷走病毒的人',world:'生化危機（2002）',theme:'archive',speaker:'Alice',face:'girl',
    moods:['mystery','anger','resolve'],
    lines:[
      '實驗室櫃門被打開，原本應該存放藥劑嘅位置只剩空盒。Spence 神情突變，伸手奪走你嘅行動路線圖。',
      'Alice 逐步恢復記憶，指向地下列車。「如果病毒同解藥都唔喺呢度，就一定有人一早搬走咗。」',
      '主神顯示：【支線風險升級】揭露病毒來源可以帶走世界級情報，但正面衝突可能失去撤離時間。'
    ],
    choices:[
      {label:'出示 Spence 行動記錄，逼佢交代藏藥位置',hint:'有證據可避免被騙',to:'re_train',requires:'re_spence_evidence',effect:{flags:['re_spence_exposed'],items:['T 病毒研究數據'],xp:35}},
      {label:'靠 Alice 恢復嘅記憶追向列車',hint:'需要 Alice 信任',to:'re_train',requires:'re_alice_ally',effect:{flags:['re_alice_route','re_antidote_found'],sp:-5}},
      {label:'先封死危險通道，防止 Licker 追出',hint:'降低地面感染風險・生命代價',to:'re_train',effect:{flags:['re_containment'],hp:-13}},
      {label:'冒險同 Spence 談判，換取撤退時間',hint:'理智受損・容許對方逃脫',to:'re_train',effect:{flags:['re_spence_escape'],sp:-11}}
    ]
  },
  re_train:{
    id:'re_train',title:'蜂巢列車：最後三分鐘',world:'生化危機（2002）',theme:'archive',speaker:'主神系統',face:'system',
    moods:['fear','resolve','mystery'],
    lines:[
      '列車已經震動。身後實驗區傳來異形拍撞牆壁嘅聲音；你知道原電影嘅 Licker 可能喺任何一刻追上來。',
      'Rain 逐漸失去神智，而 Alice 仲想救佢。你只能作出一個最關鍵決定：車門一關，路線就無法再改。',
      '【主神提示】保護更多人可取得支線憑證；不過任何耽誤都會導致額外生命／理智損失。'
    ],
    choices:[
      {label:'用隔離裝置同解藥救 Rain',hint:'需提前隔離，否則不能安全嘗試',to:'re_ending',requires:'re_rain_quarantine',effect:{flags:['re_rain_saved'],hp:-10,sp:-8,journal:'你為 Rain 爭取到電影原本沒有的生還機會。'}},
      {label:'帶 Kaplan 同 Alice 通過側線逃生',hint:'隊員生還分支',to:'re_ending',requires:'re_kaplan_saved',effect:{flags:['re_rescued_team'],hp:-7}},
      {label:'利用紅后地圖封死追擊路線',hint:'需要 AI 地圖',to:'re_ending',requires:'re_ai_map',effect:{flags:['re_safe_escape','re_containment'],sp:-6}},
      {label:'將病毒罪證同資料帶出地面',hint:'跨世界科研路線',to:'re_ending',requires:'re_lisa_evidence',effect:{flags:['re_saved_evidence'],items:['Umbrella 安全儲存晶片'],hp:-8}},
      {label:'先活下來，直接乘列車逃走',hint:'基本通關，失去隱藏獎勵',to:'re_ending',effect:{flags:['re_basic_escape'],sp:-8}}
    ]
  },
  re_ending:{
    id:'re_ending',title:'蜂巢結算：電影結局已偏移',world:'生化危機（2002）',theme:'archive',speaker:'主神系統',face:'system',
    moods:['resolve','mystery'],
    lines:[
      '出口閘門終於打開。你見到地面嘅夜色，但裝甲車喇叭突然響起；Umbrella 嘅回收隊正向洋館逼近。',
      '系統投射出原有電影結局嘅輪廓：Alice 同 Matt 本來會被捉去研究。你明白，今次帶走嘅唔單止係自己條命。',
      '【主線通關】蜂巢逃生確認。你做過嘅選擇已改變隊伍命運。完成結算後會開放下一部電影《Van Helsing》（2004）。'
    ],
    choices:[
      {label:'支線結算：更多隊員生還',hint:'取得 D 級支線憑證',to:'re_clear',requires:'re_rain_saved',effect:{points:85,branch:'D',flags:['re_good_end'],journal:'Rain 於你的路線中成功生還。'}},
      {label:'情報結算：保留 Umbrella 罪證',hint:'取得 D 級支線憑證與跨世界線索',to:'re_clear',requires:'re_saved_evidence',effect:{points:75,branch:'D',flags:['re_evidence_end']}},
      {label:'保全設施封鎖完成撤離',hint:'追加科技紀錄',to:'re_clear',requires:'re_containment',effect:{points:40,flags:['re_sealed_end']}},
      {label:'領取基本生存獎勵',hint:'完成 120 積分與經驗',to:'re_clear',effect:{flags:['re_normal_end']}}
    ]
  },
  re_clear:{
    id:'re_clear',title:'第一世界完成：返回主神空間',world:'生化危機（2002）',theme:'archive',speaker:'主神系統',face:'system',
    moods:['resolve','joy'],
    lines:[
      '【回歸確認】蜂巢座標已封存。你回到熟悉嘅白色主神光球下，手上多咗一枚被血沾污嘅隊員識別牌。',
      '【跨世界成長】保留下來嘅實驗記錄、醫療資料同主神支線憑證將可以影響《Van Helsing》嘅調查同補給。'
    ],
    choices:[{label:'領取世界主線獎勵，解鎖范海辛',to:'movie_after_first',effect:{clearWorld:'生化危機2002',points:120,xp:45,items:['蜂巢任務識別牌'],mastery:'tech',journal:'電影世界 01《生化危機》已通關。第二世界 Van Helsing 已解鎖。'}}]
  },
  movie_after_first:{
    id:'movie_after_first',title:'主神空間：科技不能解決所有詛咒',world:'主神中轉站',theme:'nexus',speaker:'阿霧',face:'guide',
    moods:['joy','worried','resolve'],
    lines:[
      '阿霧仔細看住你帶出蜂巢嘅資料：「你已經唔只係一個知道電影劇情嘅觀眾。你喺嗰個世界留下咗紀錄。」',
      '佢將一張新任務卡交到你手：「第二套電影入面，你要面對嘅唔係病毒，而係狼人同吸血鬼。照原電影行落去，Anna 會死。」',
      '【世界 02 已解鎖】《Van Helsing》（2004）。'
    ],
    choices:[{label:'進入《Van Helsing》',to:'vh_arrival',needsCleared:'生化危機2002',notCleared:'VanHelsing2004'}, {label:'先去主神商店準備',action:'shop'},{label:'查看其他裝備同任務',to:'movie_portals'}]
  }
}
