(function(global){
"use strict";
const E=global.NW_ENGINE,D=global.NW_DATA;
if(!E||!D)return;
const W={
busan:{opening:"車窗外掠過一排排灰白色的樓宇，列車的震動沿著椅背傳到你的肩上。乘客還在談笑，卻有一道不合時宜的低吼，從前方車廂的玻璃門後緩緩傳來。你抬起頭，望見一隻沾血的手掌貼在了門上。",npc:"世娜",voices:["「剛才那個人明明還能說話。」世娜抱緊背包，嗓音發顫，「現在為什麼會變成那個樣子？」","「拜託，先不要吵。」世娜努力平復呼吸，「車廂裡還有孩子，我們總得想一個辦法。」"],chapters:[
{p:"門縫間傳來越來越密集的撞擊聲。你注意到地上的行李還在輕輕搖晃，而那名倒地的列車員，正以極不自然的姿勢重新站起。此刻或許還能阻止恐慌擴散。",options:[["watch","觀察列車員的眼睛與動作","在動手之前判斷感染徵兆","observe",0,1,"infected"],["comfort","安撫身旁的乘客","讓車廂暫時保持秩序","talk",0,1,"calm"],["rush","趁混亂向前方車廂奔去","可能耗費體力，進入持續奔跑","run",11,1,"route"]]},
{p:"突然響起的金屬撞擊聲，讓玻璃門後幾個人影同時轉過頭。你本能地壓低了呼吸：那些失去理智的東西或許看不清你的位置，卻能準確追蹤聲音。",options:[["sound","利用掉落水瓶測試牠們的聽覺","可能發現感染者的行動弱點","observe",0,1,"sound"],["tell","低聲詢問世娜通往後車廂的道路","需要獲得她的信任","talk",0,1,"passage"],["block","將行李堆到搖晃的玻璃門前","需要體力，暫時阻隔危險","physical",9,1,"barrier"]]},
{p:"廣播裡的女聲重複了一句『列車運行正常』。七秒後，同一句話又響了一遍，尾音卻多出一個你的輪迴者編號。你忽然明白，這個世界裡存在不屬於原本劇情的東西。",options:[["trace","記住第二段廣播的間隔與來源","調查可能存在的隱藏線索","observe",0,1,"anomaly"],["protect","護送幾名乘客離開危險的車門","可能延續奔跑造成的體力消耗","run",9,1,"saved"],["silence","拉著世娜躲進無人的服務間","降低暴露風險，中止追逐","hide",0,1,"hideout"]]},
{p:"一名乘客指著別人衣袖上的血漬，聲稱對方已經感染。人群像被火星引燃的乾草，轉眼便劃分成互相戒備的兩邊。你看見一個孩子嚇得不敢哭出聲。",options:[["prove","冷靜查驗血漬來源，再向乘客解釋","嘗試以證據平息爭執","talk",0,1,"evidence"],["lead","組織大家一個接一個移向出口","需要維持隊伍秩序","physical",7,1,"evacuation"],["quiet","不參與爭辯，暗中觀察最可疑的人","可能掌握事件背後的異常","observe",0,1,"suspect"]]},
{p:"終於，前方那道厚重的玻璃門發出碎裂的脆響。你聽見有人大喊著逃跑，卻看見另一個人在通道裡跌倒。可怕的是，感染者並沒有第一時間朝那個人撲去，而是追向身後響起的尖叫。",options:[["lure","拋出金屬物品，將感染者引往另一邊","需要掌握聲音線索","physical",8,2,"lured","sound"],["rescue","折回扶起跌倒的乘客","冒險救人，可能受傷","risk",9,1,"rescued"],["escape","抓住空檔沿著通道全速奔跑","消耗體力並延續追逐","run",14,1,"escaped"]]},
{p:"列車開始減速，最後一道安全門就在十幾步外。身後的腳步聲卻絲毫沒有減少。你知道，現在做出的選擇，很可能決定自己將帶著怎樣的記憶離開這個世界。",options:[["leadexit","確認倖存者全部通過安全門","需要承擔最後一段風險","physical",8,1,"complete"],["cover","留下來掩護最後一名乘客","可能造成受傷，但能挽救別人","risk",8,1,"sacrifice"],["slip","趁所有人分神獨自穿過安全門","不需要消耗資源，但可能失去信任","talk",0,1,"alone"]]}]},
demon:{opening:"夜色如水，山路上的泥土混著一絲血腥味。村莊盡頭亮著零星的燈火，沒有一個人敢走出屋門。你忽然聽見樹林深處傳來帶著笑意的低語，像有什麼東西正在享受獵物恐懼的氣味。",npc:"受傷村民",voices:["「鬼殺隊還沒來！」受傷的村民壓低聲音，「你們千萬別往樹林裡走……那東西，被砍傷了還能恢復！」","「山裡有條舊路。」老人顫抖著指向東面，「如果能把牠引到那裡，也許能拖到天亮。」"],chapters:[
{p:"你看見村口的木欄被某種利爪撕開，碎屑間還有一段剛剛凝固的血跡。此刻夜色尚深，貿然與鬼正面衝突並不是唯一出路。",options:[["trace","檢查木欄上的爪痕與拖行印記","找出鬼出沒的路線","observe",0,1,"tracks"],["talk","向受傷村民詢問鬼的行動規律","需要仔細安撫對方","talk",0,1,"villager"],["stealth","借著樹影悄悄靠近林子","開始持續潛行，體力將逐步下降","sneak",5,1,"shadow"]]},
{p:"林間忽然響起一聲嘶啞的笑。瘦長的身影沿著樹幹緩緩滑下，像是在故意向躲藏的人展示自己的獵食範圍。鬼並沒有立刻發動攻擊，而是在仔細嗅聞某種氣味。",options:[["watch","觀察鬼的肩部與攻擊預備動作","尋找不必正面交鋒的破綻","observe",0,1,"pattern"],["evac","引導村民從小路避開鬼的視線","需要一定體力，可能吸引注意","physical",8,1,"evac"],["bait","丟出碎石，引牠離開村口","有危險，但能改變敵人的位置","risk",7,1,"lure"]]},
{p:"幾步之外，鬼的手臂像枯枝一樣彎折，隨後又在你面前恢復如初。你意識到，就算把牠打得骨斷筋折，也未必能真正結束這一切。遠處的天際仍然漆黑，距離黎明還有一段時間。",options:[["terrain","尋找通往朝陽方向的狹窄山道","利用環境而非直接拼命","observe",0,1,"sunpath"],["guardvill","與村民一起封住通往村莊的入口","持續用力，耗費體力","physical",10,1,"defence"],["challenge","趁鬼轉身時持武器迎上去","正式進入危險交戰，可能受傷","fight",14,1,"duel"]]},
{p:"山風吹得樹葉沙沙作響。鬼像是忽然嗅到了什麼，將目光投向藏身的村民。你看見那雙眼睛裡沒有半分猶豫，只有準備撲殺的興奮。這一次，你必須決定是救人、引開牠，還是尋找致命時機。",options:[["protect","搶先引開鬼，護住村民撤退","高風險護送，可能受傷","risk",10,1,"protected"],["distract","從側面製造聲響，將鬼誘向山路","消耗體力並開始追逐","run",11,1,"lured"],["position","守在石壁旁等待牠露出破綻","觀察與位置優勢","observe",0,1,"opening"]]},
{p:"夜色開始鬆動，遠處天空出現一絲極淡的灰白。鬼似乎也察覺到了什麼，動作變得越來越焦躁。你注意到牠總會避開山脊上的空曠地帶，似乎不願在那裡久留。",options:[["sun","把牠一步步誘向即將見光的山脊","利用已發現的道路線索","physical",9,2,"suntrap","sunpath"],["hold","留在村口維持最後一道防線","需要消耗體力","physical",12,1,"held"],["strike","瞄準關節，與鬼短暫交鋒","傷害鬼，亦會遭到反擊","fight",16,1,"strike"]]},
{p:"東方升起第一線日光。鬼的動作突然遲疑，眼神第一次流露出焦慮。只要再拖延片刻，村民就能活下來；可牠已經察覺你的真正意圖，猛地向最後一片陰影撲去。",options:[["waitsun","利用位置守住道路直到日出","拖延時間，保住村莊","physical",9,2,"dawn"],["block","與鬼正面交鋒阻止牠逃進陰影","高風險戰鬥","fight",18,1,"final"],["save","先送受傷的村民走出危險地帶","救援他人，放棄直接追擊","risk",9,1,"rescued"]]}]},
alice:{opening:"澀谷十字路口的紅燈剛剛亮起，街上卻一個人也沒有。廣告屏的色彩映在空蕩的柏油路上，像一場永遠不會散場的演出。你的手機忽然震動，顯示出一行冷冰冰的文字：請於規定時間內入場。",npc:"夏帆",voices:["「這裡根本不是正常的東京。」夏帆緊緊攥住自己的卡片，「剛才我還能聽見街上的人說話。」","「我不想靠猜的。」夏帆望向你，「如果把線索拼起來，或許大家都有機會走出去。」"],chapters:[
{p:"入口處站著幾名陌生人。沒有人知道彼此的名字，卻都在盯著電子屏上的倒數時間。你留意到其中一人始終把手插在口袋裡，像是在藏著某件東西。",options:[["read","先看清入場告示與規則","獲取遊戲規則，不消耗資源","observe",0,1,"rules"],["ask","向夏帆了解剛才發生的事","建立資訊交換","talk",0,1,"introduced"],["follow","跟隨沉默的人進入側門","可能進入另一條路線","sneak",5,1,"side"]]},
{p:"屋內的六名參加者各自收到一張不同的提示紙條。牆上有三道門，門牌下卻沒有任何可以辨認的指引。倒數器安靜地跳動著，讓每一秒都顯得格外漫長。",options:[["compare","觀察每張提示卡上重複的圖案","發現規則的共同點","observe",0,1,"symbols"],["share","主動公開自己的提示，邀請大家交換","信任可能增加，也可能遭到利用","talk",0,1,"share"],["withhold","暫時保留自己的卡片不說","降低曝光，但可能引起猜忌","conceal",0,0,"withhold"]]},
{p:"一名男子突然拍案而起，說有人交出了假的提示。原本平靜的房間迅速分成兩派，幾名參加者甚至開始後退，生怕自己成為下一個被推向出口的人。",options:[["proof","請大家把卡片並排，逐一驗證","用證據處理猜疑","observe",0,1,"proof"],["mediate","站出來平息爭執，聽完所有人的說法","改善信任，但不保證獲得情報","talk",0,1,"peace"],["listen","先退後一步，聽誰最急於掩蓋細節","嘗試辨認撒謊的人","conceal",0,1,"liar"]]},
{p:"其中一張卡片的角落留著不自然的折痕。你將幾張紙反過來，發現那些看似無關的數字，似乎能拼出一個完整的序列。可還差最後一塊，只有某個沉默的參加者沒有公開卡片。",options:[["reason","整理已公開的線索，推演正確出口","依靠觀察與邏輯","observe",0,1,"sequence"],["persuade","說服沉默的人交出最後一張卡片","透過對話取得資訊","talk",0,1,"lastcard"],["search","檢查出口門框是否藏著補充提示","有機會找到另一種解法","observe",0,1,"door"]]},
{p:"倒數只剩最後一分鐘。三道門忽然同時亮起警示燈，所有參加者都下意識朝你望來。你清楚知道，即使找出答案，也未必能讓所有人願意相信。",options:[["choose","根據線索宣布自己認定的出口","可能左右眾人的命運","talk",0,2,"answer"],["guide","先帶人避開錯誤門口，維持秩序","小幅體力消耗","physical",7,1,"order"],["expose","指出故意混淆提示的人","揭露隱藏意圖","talk",0,1,"traitor"]]},
{p:"最後的提示音響起。門後傳來機械鎖逐一解除的聲音，走廊裡卻依然一片寂靜。你望著其他參加者，突然明白這場遊戲真正考驗的不是誰算得最快，而是人在死亡面前究竟會不會相信別人。",options:[["all","盡力讓仍在場的所有人依次撤離","延續先前建立的合作","talk",0,1,"all"],["private","低聲與夏帆確認出口後先行離開","確保自己安全","talk",0,1,"pair"],["wait","留下來確認最後一人的情況","可能遭遇最後的風險","risk",6,1,"last"]]}]},
deathnote:{opening:"東京夜雨沿著便利店的玻璃緩緩滑落。螢幕裡的新聞正在播報一宗離奇死亡，而你桌面上那封沒有郵戳的信件，早在十分鐘前就已寫好了死者姓名。你忽然意識到，這個世界最危險的武器或許不是刀槍。",npc:"匿名調查員",voices:["「先不要相信你手上的任何一份資料。」電話那頭傳來經過處理的聲音，「有人正故意讓調查者暴露身份。」","「如果你的推斷是對的，我們需要更多證據。」對方停頓了一下，「尤其是那些不願意公開姓名的人。」"],chapters:[
{p:"信封裡的字跡工整得近乎機械。每一個姓名旁邊都列著死亡時間，最後一行卻只有空白。對面的玻璃映出一道人影，你不知道對方是普通路人，還是一直在等待你拆信的人。",options:[["date","核對新聞與信件的死亡時間","建立第一份可信證據","observe",0,1,"timeline"],["call","使用匿名電話聯絡調查員","試探對方的態度","talk",0,1,"contact"],["destroy","先撕下可能暴露自己身份的部分","隱藏資料來源","conceal",0,1,"safe"]]},
{p:"街對面的黑色雨衣始終沒有移動。你從玻璃反光裡看見，那人似乎正留意手錶上的時間。你的直覺告訴你，這並非巧合。",options:[["copy","先留下匿名副本，再保存原件","避免證據完全遺失","observe",0,1,"backup"],["watch","從另一側出口觀察雨衣人的舉動","謹慎追蹤，需要維持潛行","sneak",5,1,"shadow"],["ask","詢問店員是否見過那個人","透過一般對話取得證言","talk",0,1,"witness"]]},
{p:"沒有住戶的公寓裡，電腦螢幕突然亮了起來。第一行是一組陌生的編號，第二行卻精確寫出了你曾在另一個輪迴世界使用的代號。你感到某種無形的視線正落在自己背上。",options:[["system","查看檔案生成時間，確認是否來自主神","追查世界異常線索","observe",0,1,"system"],["leave","合上電腦，不在此處暴露更多資訊","減少暴露風險","conceal",0,1,"secret"],["probe","輸入假身份試探監視者反應","有精神壓力風險","risk",0,1,"probe"]]},
{p:"匿名調查員終於帶來一份新的時間線。裡面幾個關鍵日期，恰好與你手上資料重合。對方卻希望交換所有參與者的真實姓名，你注意到其中有人在這時不自然地低下頭。",options:[["verify","逐項核對線索，才決定是否合作","確保證據可信","observe",0,1,"verify"],["share","只交換匿名資料，不提供任何真名","維持合作，同時保護身份","talk",0,1,"anonymous"],["mislead","提供一份不涉及真名的試探性假線索","或可識破監視者，但可能破壞信任","conceal",0,1,"bait"]]},
{p:"公寓走廊裡的燈突然熄滅，口袋裡早已關機的手機微微震動。屏幕上顯示了一句不應該出現在這個世界的話：『輪迴者，你已經被發現。』你明白，在這裡繼續停留只會讓情況惡化。",options:[["secure","收起證據，沿安全通道離開","謹慎撤離，開始連續移動","run",9,1,"escape"],["hide","躲進無人辦公室，等待腳步聲離去","中止追蹤，保持匿名","hide",0,1,"hidden"],["callhelp","匿名聯絡可信人士，請對方接應","透過人脈解決危機","talk",0,1,"aid"]]},
{p:"雨聲終於小了一些。你攤開最後一張資料卡，目光沿著那些被寫下的名字逐一移動。每一個名字都曾代表一個活生生的人，而這場調查還遠遠沒有結束。",options:[["submit","匿名交出已核實的證據","保護身份並推進主線","talk",0,1,"complete"],["archive","把原件藏在安全的位置，留下記錄","為未來的任務保留線索","conceal",0,1,"archive"],["release","將資料交給可靠的第三方保存","建立較長期的合作關係","talk",0,1,"shared"]]}]}
};

const REACTIONS={
busan:{
watch:"你比其他乘客更早察覺那名列車員的瞳孔已經失去焦點。危險並非突然降臨，而是一直藏在人們不願面對的細節裡。",
comfort:"世娜終於停下顫抖，開始幫忙照顧身邊的孩子。人群並未完全平靜，卻不再只顧著互相推擠。",
rush:"你成功穿過擁擠的通道，卻在急促的奔跑中消耗了不少體力。身後有人驚叫著呼喚，聲音被車輪的轟鳴吞沒。",
sound:"瓶子落地的一瞬間，幾個感染者幾乎同時轉頭。你終於掌握了可以用來活下去的規則。",
block:"堆起來的行李擋住了一次撞擊，玻璃卻仍在震動。這道防線不是永久的，卻替乘客爭取了寶貴的時間。",
trace:"兩次廣播竟然相差整整七秒。這個數字似乎與主神印記上的異常閃爍同步，你把它牢牢記在心裡。",
silence:"服務間的門被輕輕帶上，外頭的腳步聲漸漸遠去。世娜看了你一眼，第一次沒有急著說話。",
prove:"你把血跡的來源說清楚後，叫嚷的人群終於安靜片刻。有人低下頭，似乎因剛才的指責感到羞愧。",
lure:"金屬物件在遠處撞出清脆的聲響，感染者果然改變了方向。你知道自己不是靠運氣賭對了。",
cover:"你留在最後一扇門前。那一刻，世娜的目光落在你身上，像是終於明白有人會為陌生人承擔風險。"
},
demon:{
trace:"爪痕的深淺證明那東西經常走同一條路。這並不是毫無規律的野獸，只要足夠耐心，總能找到牠的習慣。",
talk:"老人告訴你一個看似無關緊要的細節：鬼總在日出前回到杉樹後方的山洞。你立刻記住了那個方向。",
stealth:"你將身影藏進濕冷的杉木陰影裡。每走一步都必須繃緊肌肉，這種謹慎會慢慢奪走你的體力。",
watch:"你發現鬼每次撲擊前右肩都會先沉下半寸。這個幾乎微不可見的動作，可能救下你的性命。",
bait:"碎石在另一頭的樹根上彈了兩下。鬼果然偏過頭，露出藏在樹影裡那條狹窄的道路。",
terrain:"沿著山道向東走，樹木逐漸稀疏。你看見一道即將接住第一縷晨光的山脊。",
challenge:"你終於和鬼正面碰上。鐵器擊中的瞬間並不代表勝利，那道裂開的傷口竟然又慢慢癒合。",
sun:"你沒有追逐鬼的身影，而是提前堵住了通往陰影的退路。山脊另一端，日光正一點一點升起。",
waitsun:"你強迫自己留在原地，沒有被鬼的嘶吼逼得失去理智。最重要的一擊，或許根本不需要由你完成。"
},
alice:{
read:"你把入場告示上的規則逐字看完，發現其中一條措辭與其他說明不同。看似普通的細節，或許正是破解遊戲的入口。",
share:"當你主動放下卡片，夏帆猶豫了一下，也把自己的提示放到桌上。信任並非憑空出現，而是從有人先伸出手開始。",
withhold:"你沒有公開全部資訊，卻明顯感覺到旁人看向你的目光變得戒備。這份沉默正在產生代價。",
proof:"被指責的人終於有機會解釋。你讓所有卡片並排之後，幾處看似矛盾的地方反倒能互相印證。",
mediate:"原本打算動手的男子慢慢放下拳頭。夏帆鬆了一口氣，卻仍然緊盯著牆上的倒數器。",
listen:"你沒有插話，因此聽出了某個人的說辭先後不一。這種破綻比任何大聲指責都更有價值。",
reason:"重複的圖案連成了一個合理的序列。你終於意識到，遊戲真正要求的不是猜出門牌，而是確認誰願意分享最後一條線索。",
choose:"當你說出自己的判斷，整個房間安靜了片刻。人們終究要決定是否將命運交到你的推理上。"
},
deathnote:{
date:"死亡時間與新聞的細節一一吻合。你得到的不是答案，而是一份尚可用來繼續追查的可信起點。",
call:"對方並沒有立即回答你的問題，只要求你不要透露姓名。這種謹慎，至少證明他理解這個世界真正的危險。",
destroy:"你抹去了可能暴露身份的痕跡，卻同時失去了一部分可供核對的原始線索。保密往往也有代價。",
copy:"你用另一種方式保存了原始信件的內容。哪怕原件不幸遺失，也不至於令整條證據鏈就此中斷。",
watch:"你保持距離，尾隨那名雨衣人穿過街角。對方似乎沒有察覺，但你的腳步必須始終控制在極輕的程度。",
system:"畫面中的檔案建立時間比你進入這個世界還早。你第一次認真懷疑，有某個存在能預知輪迴者的到來。",
leave:"你沒有輸入任何資料，悄悄合上電腦。至少在這個瞬間，你成功守住了自己的真實身份。",
verify:"時間線中幾個不易察覺的矛盾被你找了出來。那些細小差異，足以證明調查員手上的資料不是全部。",
share:"你只交換匿名情報。對方雖然沒有得到真名，卻願意繼續合作，這讓後續調查多了一條道路。",
secure:"你把文件藏進衣內，離開那條傳來腳步聲的走廊。雨夜仍然危險，但你的身份暫時沒有暴露。"
}
};
const BRANCHES={
busan:[["sound",4,"先前那個金屬水瓶讓你明白，感染者更依賴聲音。如今通道裡有人跌倒，你忽然想到，也許不必正面與牠們搏命。"],["evacuation",5,"先前組織的撤離隊伍仍在維持秩序，有人看見你後立刻讓開一條通道。"]],
demon:[["pattern",3,"你還記得那道微不可見的右肩預備動作。當鬼再次伏低身形時，你已經知道牠接下來要做甚麼。"],["sunpath",4,"你先前找到的東面山路就在不遠處。日光仍未完全出現，但那裡確實比村口更適合封住鬼的退路。"]],
alice:[["share",3,"先前有幾個人因你主動交換情報而放下戒心。當最後一張卡片遲遲沒有出現時，他們開始願意替你說話。"],["liar",4,"你已經從那個參加者的話語裡聽出了矛盾。他此刻越是催促眾人選門，你便越覺得其中有問題。"]],
deathnote:[["backup",3,"你保存的匿名副本仍然完好。對方要求交出所有資料時，你知道自己至少還握著一條退路。"],["anonymous",4,"你此前堅持不透露姓名，因此電話那頭的人始終無法確認你的身份。這份謹慎此刻開始顯出價值。"]]
};

function ensure(m){if(!m.storyState)m.storyState={exertion:null,exposure:0,tension:0,last:null,notes:[],lastReply:"",flags:[],encounter:false};return m.storyState}
function distinct(a){return Array.from(new Set(a))}
function get(s){
const m=s.mission;if(!m)return null;
const st=ensure(m);
if(m.world==="custom"||m.director){const custom=m.aiOptions?.[m.phase]||[];const opts=custom.map((x,i)=>{
 const caps=m.narrativeCapabilities||{};
 const active=new Set([...(caps.skills||[]).map(z=>"skill:"+z.id),...(caps.items||[]).map(z=>"item:"+z.id),...(caps.bloodline?["bloodline:"+caps.bloodline]:[])]);
 let o={id:x.id||"ai-"+i,label:x.label,hint:x.hint,kind:x.kind,cost:m.narrativeMode?0:Number(x.cost)||0,progress:m.narrativeMode?0:Number(x.progress)||1,flag:x.flag||"ai-option-"+i,requires:x.requires||"",reasons:[]};
 if(m.narrativeMode&&o.requires&&!active.has(o.requires))o.reasons.push("當前人物未掌握所需能力");if(!m.narrativeMode&&["run","sneak","physical","risk","fight"].includes(o.kind)&&s.profile.sta<o.cost)o.reasons.push("體力不足");o.usable=!o.reasons.length;return o});return {world:{name:m.worldName},section:null,actions:opts,exertion:st.exertion,active:false,phase:m.phase,storyState:st}}
const data=W[m.world]||W.busan;let idx=Math.min(5,m.phase),section=data.chapters[idx];
let opts=section.options.map(([id,label,hint,kind,cost,progress,flag,require])=>({id,label,hint,kind,cost,progress,flag,require,reasons:[]}));
if(m.mode==="team"&&idx===2)opts[1]={id:"coordinate",label:"與隊友商量如何完成主神任務",hint:"共同推進目標，也許改變關係",kind:"talk",cost:0,progress:1,flag:"teamwork",reasons:[]};
if(m.mode==="versus"&&idx===3)opts[1]={id:"rival",label:"與敵隊接觸，試探他們真正的目的",hint:"可以談判，也可能暴露意圖",kind:"talk",cost:0,progress:1,flag:"parley",reasons:[]};
if(!m.narrativeMode&&idx>=3&&s.profile.sta<15){opts[2]={id:"rest",label:"尋找掩護，稍作喘息並整理思路",hint:"結束持續奔跑／潛行，恢復少量體力",kind:"rest",cost:0,progress:0,flag:"breath",reasons:[]}}
for(const o of opts){if(o.require&&!m.flags.includes(o.require)&&!st.flags.includes(o.require))o.reasons.push("仍未發現相關線索");if(!m.narrativeMode&&["run","sneak","physical","fight","risk"].includes(o.kind)&&s.profile.sta<o.cost)o.reasons.push("體力不足");o.usable=!o.reasons.length}
const active=!!st.encounter && (m.world==="demon"||m.world==="busan");
return {world:data,section,actions:opts,exertion:st.exertion,active,phase:idx,storyState:st};
}
function excerpt(s){const m=s.mission,g=get(s);if(!g)return null;const st=g.storyState,data=g.world,idx=g.phase;const playerText=m.mode==="solo"?"這次只有你一名輪迴者被送入這個世界。四周的人物有他們自己的恐懼與打算，並不會因為你的出現就自然信任你。":m.mode==="team"?"主神安排的隊友跟在不遠處，但每個人都在用自己的方式判斷局勢。你可以向他們求助，也可以選擇獨自處理眼前的事。":"另一組輪迴者就在這個世界裡。你們未必非要正面交戰，但彼此的任務目標很可能互相衝突。";
let story=idx===0?data.opening+"　"+g.section.p:g.section.p;
const branch=(BRANCHES[m.world]||[]).filter(([flag,phase])=>phase===idx&&m.flags.includes(flag)).map(x=>x[2]).join("\n\n");
if(branch)story+="\n\n"+branch;
let consequence=st.lastReply||"";
let person=m.mode==="team"&&m.crew.length&&idx%3===2?m.crew[idx%m.crew.length].name:data.npc;
let dialogue=m.mode==="team"&&m.crew.length&&idx%3===2?"「我能幫忙，但需要知道你的計畫。」那名隊友看著你，「我們之間的合作，不應該只是主神的一條命令。」":data.voices[idx%2];
if(m.mode==="versus"&&idx===3&&m.rival){person=m.rival.name;dialogue="「你也在尋找同一個目標？」對方沒有立即拔出武器，反倒露出一絲意味不明的笑意，「看來我們還有談談的餘地。」"}
let continuation=st.exertion==="run"?"你已經連續移動了一段距離，肺部開始傳來火辣辣的刺痛。倘若繼續保持速度，體力就會不斷流失。":st.exertion==="sneak"?"你仍在陰影間壓低身形移動，肌肉長時間繃緊。這樣可以避開許多目光，但不可能永遠不付出體力代價。":"";
let prior=st.last&&idx>0?"上一個抉擇的影響尚未散去。"+consequence:"";
return {title:idx===0?"傳送落點":idx===5?"抉擇前夜":"異變漸深",story,person,dialogue,mode:idx===0?playerText:"",continuation,prior,ending:idx===5?"不論主神會給出怎樣的評價，這個決定都會寫進你的輪迴記錄。":"此時仍有不止一條道路。你可以根據自己的情報和判斷行動，而不是每次都拔出武器。",mood:m.world==="demon"&&idx===3?"shock":m.world==="deathnote"&&idx===2?"eerie":idx===4?"suspense":idx===5?"resolve":"calm"}
}
// Story-first actions have consequences only in prose and long-term character memory.
// Legacy RPG battles stay readable in old saves; new novel worlds never spend HP/STA/MP.
function applyNovel(s,action,original){
 const m=s?.mission;if(!m||m.finished)return {error:"當前沒有進行中嘅故事"};
 if((m.world==="custom"||m.director)&&!m.aiOptions?.[m.phase]?.length)return {error:"請等目前章節完成先繼續"};
 const choice=String(original||action.label||"").trim();if(!choice)return {error:"請描述下一步"};
 const phase=m.phase,kind=String(action.kind||"open"),st=ensure(m);
 const report={action:choice,events:["主角決定："+choice],kind,
  delta:{hp:0,sta:0,mp:0,san:0,progress:0}};
 m.history||=[];m.log||=[];m.flags||=[];
 m.history.push(report);m.log.push("第"+(phase+1)+"章："+choice);
 st.last=action.id||"free-open";st.lastReply=choice;
 st.notes.push({choice,kind,reply:choice,at:phase});
 st.notes=st.notes.slice(-30);
 if(action.flag&&!m.flags.includes(action.flag))m.flags.push(action.flag);
 m.phase++;m.turn=(Number(m.turn)||0)+1;
 m.roundEvents=["主角上一個抉擇："+choice];
 // Quest evidence and NPC trust are derived from specific actions, not pretend combat rolls.
 global.NW_WORLD?.onAction?.(s,action,report);
 global.NW_WORLD?.recordDirectorAction?.(s,action,report);
 global.NW_BIBLE?.recordAction?.(s,report);
 if(!m.director&&m.phase>=6)E.end(s);
 if(m.director&&(m.phase>=28||(m.phase>=23&&global.NW_WORLD?.allowDirectorEnding?.(s))))E.end(s);
 return {error:null,report,finished:!!m.finished};
}
function apply(s,action,original){
const m=s.mission;if(!m||m.finished)return {error:"當前沒有正在進行的任務"};if(m.narrativeMode)return applyNovel(s,action,original);const st=ensure(m),o=action;
if(o.reasons?.length)return {error:o.reasons.join("、")};
const p=s.profile,weapon=E.item(s.loadout.weapon),before={hp:p.hp,sta:p.sta,mp:p.mp,san:p.san,progress:m.progress};let events=[],visible=o.kind==="run"||o.kind==="sneak"||o.kind==="physical"||o.kind==="risk"||o.kind==="fight";
if(o.cost>0){p.sta=Math.max(0,p.sta-o.cost);events.push("你為這次行動付出了 "+o.cost+" 點體力。")}
if(st.exertion&&["run","sneak","physical","risk","fight"].includes(o.kind)){
const rate=st.exertion==="run"?5:3;let drain=Math.min(rate,p.sta);
p.sta=Math.max(0,p.sta-drain);
if(drain)events.push((st.exertion==="run"?"持續奔跑":"長時間潛行")+"令體力再下降 "+drain+" 點。");
}
if(o.kind==="rest"||o.kind==="hide"||o.kind==="talk"||o.kind==="observe"||o.kind==="conceal")st.exertion=null;
if(o.kind==="run")st.exertion="run";
if(o.kind==="sneak")st.exertion="sneak";
if(o.kind==="rest"){p.sta=Math.min(100,p.sta+18);events.push("你借著短暫的安全空隙調整呼吸，恢復了部分體力。")}
if(o.kind==="risk"||o.kind==="fight"){
const danger=(m.world==="demon"?16:m.world==="busan"?10:5);
const mitigation=(E.item(s.loadout.armor)?.def||0);
const hurt=Math.max(0,danger-mitigation-(m.flags.includes("pattern")?3:0)-(st.shield||0));st.shield=0;
p.hp=Math.max(0,p.hp-hurt);events.push("這個冒險決定讓你承受了 "+hurt+" 點傷害。");
if(o.kind==="fight"){st.encounter=true;const damage=Math.max(2,(weapon?.dmg||3)+Math.floor(p.attrs.str/2));m.enemy.hp=Math.max(0,m.enemy.hp-damage);events.push("你逼退敵人，造成 "+damage+" 點傷害；但對方尚未失去威脅。")}
}
if(o.id==="coordinate"&&m.crew.length){const crew=m.crew[m.phase%m.crew.length];s.bonds[crew.id]=(s.bonds[crew.id]||0)+1;crew.bond++;events.push(crew.name+"理解了你的安排，開始更信任你的判斷。")}
if(o.kind==="talk"&&m.mode==="team"&&m.crew.length&&["share","leadexit","all","protect"].includes(o.id)){const c=m.crew[0];s.bonds[c.id]=(s.bonds[c.id]||0)+1;}
if(o.kind==="conceal")st.exposure=Math.max(0,st.exposure-1);
if(o.id==="rush"||o.id==="challenge")st.tension++;
global.NW_WORLD?.ability?.(s,o,events);
if(o.flag){if(!m.flags.includes(o.flag))m.flags.push(o.flag);st.flags.push(o.flag)}
m.progress+=o.progress||0;
if(o.kind==="observe"&&s.profile.bloodline==="sight"&&!m.flags.includes("bloodsight")){m.progress++;m.flags.push("bloodsight");events.push("靈視血脈讓你察覺了普通人忽略的細節。")}
if(o.id==="withhold"&&m.crew.length){st.exposure--;events.push("其他人沒有發現你保留了部分資訊。")}
if(m.mode==="versus"&&m.rival&&m.phase>=2&&m.phase%2===0&&!["rival","mislead"].includes(o.id)){m.rival.progress++;events.push("敵對輪迴小隊也在暗中推進自己的計畫。")}
if((o.flag==="pattern"||o.flag==="sound"||o.flag==="system")&&m.progress>=2&&!m.hidden){m.hidden=true;events.push("你發現了一條與主神隱藏目標相關的線索。")}
let reply={
talk:"你沒有急著動武，而是先讓對方把話說完。這次交流並非毫無收穫，對方的態度已經出現變化。",
observe:"你從不起眼的細節裡拼出了一條新的線索。事件的輪廓比剛才清晰了一些。",
conceal:"你把真正的想法藏了起來。至少此刻，還沒有人知道你打算做什麼。",
run:"你抓住混亂的瞬間向前衝去，身後的聲音很快被拉開了一段距離。",
sneak:"你收斂呼吸，沿著陰影慢慢移動，沒有立刻引起旁人的注意。",
physical:"你用實際行動改變了眼前的局面，但事情並不因此變得簡單。",
risk:"你成功做出了選擇，也真正承擔了它的代價。那些旁觀者看你的眼神已經不一樣。",
fight:"武器撞擊的震動沿著手臂傳來。你逼迫敵人後退，卻清楚知道這不代表危機已經解除。",
hide:"你躲進較為安全的位置，終於有機會重新思考下一步。",
rest:"你平緩了急促的呼吸。短暫的停頓並不丟人，很多時候正是活下去的關鍵。"
}[o.kind]||"這個決定讓周圍的局勢出現了新的變化。";
st.last=o.id;st.lastReply=global.NW_NOVEL?.reaction(m.world,o.id,o.kind)||REACTIONS[m.world]?.[o.id]||reply;st.notes.push({choice:original||o.label,kind:o.kind,reply,at:m.phase});
for(const id in m.cooldowns)m.cooldowns[id]=Math.max(0,m.cooldowns[id]-1);
m.turn++;m.phase++;
m.roundEvents=[st.lastReply,...events.slice(-2)];m.log.push(st.lastReply,...events);
const report={action:original||o.label,events:[st.lastReply,...events],delta:{hp:p.hp-before.hp,sta:p.sta-before.sta,mp:p.mp-before.mp,san:p.san-before.san,progress:m.progress-before.progress},kind:o.kind};
m.history.push(report);global.NW_WORLD?.onAction?.(s,o,report);global.NW_WORLD?.recordDirectorAction?.(s,o,report);global.NW_BIBLE?.recordAction?.(s,report);
const director=!!m.director;
if(p.hp<=0)E.end(s);
else if(!director&&m.phase>=6)E.end(s);
else if(director){
 const maxTurns=28;
 const coherentEnding=!!global.NW_WORLD?.allowDirectorEnding?.(s);
 if((m.phase>=23&&coherentEnding&&m.progress>=m.required)||m.phase>=maxTurns)E.end(s);
}

return {error:null,report,finished:!!m.finished}
}
function choose(s,i){const g=get(s);if(!g)return {error:"尚未進入輪迴世界"};const a=g.actions[i];if(!a)return {error:"沒有這個選擇"};return apply(s,a)}
const INTENT_RULES=[
 ["fight",/重擊|砍殺|砍|斬|揮刀|攻擊|射擊|拔刀攻擊|戰鬥|動手打|打架|打(?!聽|听|電話|招呼|算)|擊倒|刺殺|偷襲|揍|開槍|搏鬥/g],
 ["run",/逃跑|逃離|奔跑|跑開|跑走|快跑|衝出去|衝向|追上|追趕|趕往|撤離|撤退|奔向|衝刺/g],
 ["sneak",/潛行|悄悄|偷偷|尾隨|跟蹤|躡手躡腳|匿蹤|摸黑/g],
 ["rest",/休息|喘息|恢復體力|調整呼吸|稍作休整|歇息/g],
 ["hide",/藏匿|掩藏|躲藏|躲進|躲起來|躲避|隱藏身形/g],
 ["observe",/查看|查驗|檢查|分析|搜尋|搜查|比對|觀察|推理|研究|調查|細看|仔細看|確認|查看|偵查|偵察|留意|注視|打量|看看|查找/g],
 ["talk",/交談|聊天|安慰|說服|詢問|問問|問|傾偈|傾|聊|談|告訴|說|講|开口说|說出|開口說|開口問|問候|打聽|商量|請求|交換情報|談判|對話|講|打電話|致電/g],
 ["conceal",/隱瞞|假裝|保密|偽裝|裝作|藏起情報|不透露|唔透露|保留情報/g],
 ["physical",/扶起|搬運|推開|守住|堵住|築起|攔住|阻止|制止|攔下|擋住|救出|搬開|舉起|移動障礙|接住/g]
];
const INTENT_COST={fight:15,run:10,sneak:5,physical:7,observe:0,talk:0,conceal:0,rest:0,hide:0};
const INTENT_LABELS={fight:"戰鬥",run:"奔跑／逃離",sneak:"潛行",rest:"休息",hide:"躲藏",observe:"觀察／調查",talk:"對話／交涉",conceal:"隱瞞",physical:"實際行動"};
function isNegated(clause,index){
 const p=clause.slice(Math.max(0,index-17),index).replace(/\s+/g,"");
 if(/(?:不|唔|別|别|勿|無|没|沒|未|不想|唔想|不會|唔會|不要|唔好|不打算|拒絕|避免|防止|停止|取消|放棄|不準|先別|先唔)(?:要|想|會|主動|先|去|再|立刻|立即|直接|準備|打算|嘗試|試圖|繼續|進行|選擇|讓|使|被|對方|敵人|他|她|佢){0,6}$/.test(p))return true;
 return /(?:拒絕|避免|阻止|制止|防止|停止|放棄|不要讓|唔好畀|不讓)(?:.{0,5})$/.test(p);
}
function parseFreeIntent(text){
 const raw=String(text||"").trim();
 if(raw.length<2)return {error:"請先輸入想採取的行動"};
 if(raw.length>180)return {error:"請將行動縮短至 180 字以內"};
 // Dialogue text and titles are not instructions to execute violent acts.
 const textWithoutQuotes=raw.replace(/「[^」]*」|『[^』]*』|“[^”]*”|"[^"]*"|'[^']*'/g," ");
 if(/(?:嗎|么|呢|？|\?|能不能|可否|能否|可唔可以|會唔會|能夠嗎|可以嗎)\s*$/.test(textWithoutQuotes))return {error:"呢句係問題而非確定行動；請清楚描述主角下一步要做乜"};
 const clauses=textWithoutQuotes.split(/[，,。；;！!？?\n]|然後|接著|之後|跟住/).map(x=>x.trim()).filter(Boolean);
 const hits=[];
 for(const clause of clauses){
  for(const [kind,re] of INTENT_RULES){
   re.lastIndex=0;
   for(const m of clause.matchAll(re)){
    if(!isNegated(clause,m.index))hits.push({kind,term:m[0],clause});
   }
  }
 }
 const kinds=Array.from(new Set(hits.map(h=>h.kind)));
 if(!kinds.length)return {error:"未能確定具體行動；請寫明想交談、觀察、潛行、撤退或其他單一步驟。未扣除任何資源。"};
 if(kinds.length>1)return {error:"偵測到多個可能行動（"+kinds.map(k=>INTENT_LABELS[k]).join("、")+"）。請一次只執行一步，避免誤扣體力或錯誤觸發戰鬥。"};
 const kind=kinds[0];
 return {kind,cost:INTENT_COST[kind],label:INTENT_LABELS[kind],text:raw};
}
function parseFreePlan(text){
 const raw=String(text||"").trim();
 if(raw.length<2||raw.length>180)return {error:"請輸入 2 至 180 字的行動計劃"};
 // Keep each step separate: the game will NEVER auto-execute future steps.
 const parts=raw.replace(/(?:先)(?=.{1,60}?(?:然後|接著|跟住|之後|再))/g,"")
  .split(/(?:然後|接著|跟住|之後|隨後|再去|再來|再)(?!次)|[；;。]/).map(t=>t.trim()).filter(Boolean);
 if(parts.length<2||parts.length>3)return {error:"請以「先……然後……」描述兩至三個獨立步驟"};
 const steps=[];
 for(const part of parts){
  const intent=parseFreeIntent(part);
  if(intent.error)return {error:"步驟「"+part.slice(0,30)+"」尚未清楚，請分開描述每一步。未扣除任何資源。"};
  steps.push({text:part,kind:intent.kind,label:intent.label,cost:intent.cost});
 }
 return {steps,mode:"review-only",message:"只會執行已確認的第一步；之後每一步必須按新情節重新確認"};
}
function analyzeFree(s,text){
 const m=s.mission;
 if(!m||m.finished)return {error:"當前沒有正在進行的任務"};
 if((m.world==="custom"||m.director)&&!m.aiOptions?.[m.phase]?.length)return {error:"AI 正在續寫本章，請等劇情生成後再行動"};
 if(m.narrativeMode){
  const raw=String(text||"").trim();if(raw.length<2)return {error:"請輸入你想主角採取嘅行動"};
  if(raw.length>350)return {error:"行動描述最多 350 字；可以先寫最重要嘅決定"};
  const recognized=parseFreeIntent(raw),kind=recognized.error?"open":recognized.kind;
  const intent={kind,cost:0,label:recognized.error?"自由行動":recognized.label,text:raw};
  const action={id:"free-"+kind,label:raw,hint:"主角自由決定",kind,cost:0,progress:0,flag:"free-"+kind,reasons:[]};
  return {...intent,action,effects:[],phase:m.phase,missionSeed:m.seed}
 }
 const intent=parseFreeIntent(text);if(intent.error)return intent;
 if(s.profile.sta<intent.cost)return {error:"體力不足：需要 "+intent.cost+"，目前只有 "+s.profile.sta+"。未執行任何行動。"};
 const action={id:"free-"+intent.kind,label:intent.text,hint:"玩家自訂行動",kind:intent.kind,cost:intent.cost,progress:intent.kind==="rest"?0:1,flag:"free-"+intent.kind,reasons:[]};
 return {...intent,action,effects:preview(action),phase:m.phase,missionSeed:m.seed};
}
function free(s,text,confirmedKind){
 const intent=analyzeFree(s,text);
 if(intent.error)return {error:intent.error};
 if(confirmedKind!==intent.kind)return {error:"行動分類已更改或未經確認，沒有執行；請重新預覽"};
 return apply(s,intent.action,intent.text);
}
function skills(s){const m=s.mission;if(!m)return [];let list=s.loadout.active;return list.map(id=>{let sk=E.skill(id),avail=E.availability(s,id);return {id,name:sk?.name||id,sta:sk?.sta||0,mp:sk?.mp||0,desc:sk?.desc||"",ok:avail.ok,reasons:avail.reasons}})}
function useSkill(s,id){if((s.mission?.world==="custom"||s.mission?.director)&&!s.mission.aiOptions?.[s.mission.phase]?.length)return {error:"AI 世界仍未載入，不可跳過劇情"};const sk=E.skill(id),check=E.availability(s,id);if(!check.ok)return {error:check.reasons.join("、")};let kind=sk?.power?"fight":sk?.effect==="reveal"?"observe":sk?.effect==="persuade"?"talk":sk?.effect==="heal"?"rest":"physical";
const r=apply(s,{id:"skill-"+id,label:"施展「"+sk.name+"」",kind,cost:sk.sta||0,progress:sk.effect==="reveal"?2:sk.effect==="persuade"?2:sk.power?1:0,flag:"skill-"+id,reasons:[]}, "施展「"+sk.name+"」");
if(!r.error){global.NW_WORLD?.skillUse?.(s,id);s.profile.mp=Math.max(0,s.profile.mp-(sk.mp||0));if(sk.effect==="heal")s.profile.hp=Math.min(100,s.profile.hp+22);if(sk.effect==="shield"){s.profile.san=Math.min(100,s.profile.san+8);if(s.mission)s.mission.storyState.shield=14}if(sk.effect==="evade"&&s.mission)s.mission.storyState.shield=10;if(sk.cooldown&&s.mission&&!s.mission.finished)s.mission.cooldowns[id]=sk.cooldown+1;
if(sk.power&&s.mission&&!s.mission.finished){const extra=Math.round(sk.power*.65);s.mission.enemy.hp=Math.max(0,s.mission.enemy.hp-extra);r.report.events.push("招式額外造成 "+extra+" 點傷害。");}}
return r;
}
function useItem(s,id){
const m=s.mission,st=m&&ensure(m),it=E.item(id);
if(!m||m.finished)return "目前不在可使用道具的輪迴場景";
if(!it||(m.bag[id]||0)<1)return "行囊沒有這件物品";
if(it.type!=="consumable"&&it.type!=="tool")return "這件物品不能直接使用";
m.bag[id]--;
const p=s.profile;const old={hp:p.hp,sta:p.sta,mp:p.mp,san:p.san};
p.hp=Math.min(100,p.hp+(it.heal||0));
p.sta=Math.min(100,p.sta+(it.restoreSta||0));
p.mp=Math.min(60,p.mp+(it.restoreMp||0));
p.san=Math.min(100,p.san+(it.restoreSan||0));
if(it.stun&&m.enemy)m.enemy.stunned=Math.max(m.enemy.stunned||0,1);
if(id==="recorder"){m.progress++;m.evidence.push("錄音證據");m.flags.push("recorded")}
if(id==="badge"){m.progress++;m.flags.push("identity")}
if(st.exertion)st.exertion=null;
const changes=["hp","sta","mp","san"].map(k=>({hp:"HP",sta:"STA",mp:"MP",san:"SAN"}[k])+" "+(p[k]-old[k]>=0?"+":"")+(p[k]-old[k])).filter(x=>!x.endsWith(" +0"));
let lines=["你從行囊中取出「"+it.name+"」，仔細使用。"+(changes.length?"狀態變化："+changes.join("、"):"已記錄道具效果。")];
if(st.encounter&&m.enemy.hp>0){let harm=Math.max(0,Math.round((E.world(m.world)?.dmg||12)*.5)-(E.item(s.loadout.armor)?.def||0));p.hp=Math.max(0,p.hp-harm);lines.push("敵人沒有給你充足準備時間，你受到 "+harm+" 點傷害。")}
m.roundEvents=lines;m.log.push(...lines);
if(p.hp<=0)E.end(s);
return null
}
function preview(a){const p=[];if(a.cost>0)p.push("STA −"+a.cost);
if(a.kind==="run")p.push("後續奔跑每幕 STA −5");
if(a.kind==="sneak")p.push("持續潛行每幕 STA −3");
if(a.kind==="rest")p.push("STA +18");
if(a.kind==="fight"||a.kind==="risk")p.push("可能受傷");
return p}
global.NW_STORY={get,excerpt,choose,free,analyzeFree,parseFreeIntent,parseFreePlan,skills,useSkill,useItem,preview,ensure};
})(window);
