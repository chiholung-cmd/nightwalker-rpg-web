# Nightwalker AI Adventure — 純文字 AI 無限流 v1

## 正式方向
Nightwalker 是單人手機文字冒險：真實電影世界觀做底層設定；玩家可以點選 AI 生成的建議，亦可以完全自由輸入任何行動、對話或計劃。AI 即時寫新劇情、NPC 反應和選項。故事後果不再依靠預先寫死的 A/B/C 分支。

影像、動畫與角色圖並非必需；集中預算／開發資源在敘事模型、電影世界設定、長期記憶、角色因果、手機文字閱讀體驗。

## 主要介面
新模式網址：/ai
舊版固定劇情：/
存檔獨立，不覆寫舊進度。純文字長段劇情、角色獨立對白、歷史、任務、屬性、背包、2–3個建議選擇與自由輸入約550字。角色仍會有獨立關係與受傷／死亡狀態。

## AI 金鑰（必須自行配置）
Vercel → Project nightwalker-rpg-web → Settings → Environment Variables

Groq：
- GROQ_API_KEY = 你的 Groq 個人 API Key
- AI_MODEL = llama-3.3-70b-versatile （供應商更換模型時請自行調整）
- 預設 API Base URL = https://api.groq.com/openai/v1
- 不保證無限免費：取決於 Groq 當時的額度和限速。

OpenAI：
- OPENAI_API_KEY = 你的 OpenAI API Key
- AI_MODEL = gpt-4.1-mini （預設，可改）
- ChatGPT 訂閱不等於 API 額度，API 另行按實際用量收費。

其他 OpenAI-compatible：
- AI_API_KEY
- AI_BASE_URL（末尾為 /v1；唔加 /chat/completions）
- AI_MODEL（必須支援 JSON mode）

私人遊戲建議同時加入 ADVENTURE_ACCESS_CODE，自訂秘密存取碼。訪問 /ai 後喺遊戲設定輸入相同存取碼。唔應將 API Key 複製到前端或 GitHub。

完成配置後需要重新部署 Vercel。若缺少密鑰，API 會返回 MODEL_NOT_CONFIGURED，不會假裝 AI 已經成功生成劇情。

## 第一階段真實電影世界
1. Resident Evil（2002）——《生化危機》蜂巢、Alice、Rain、Red Queen 等。
2. Van Helsing（2004）——Van Helsing、Anna、Carl、Dracula、Frankenstein 造物等。
3. The Storm Riders（1998）——電影版《風雲雄霸天下》的聶風、步驚雲、雄霸、秦霜、孔慈等；唔混入漫畫後期或電影續集。

同原作角色對話會係全新文字，不會抄原劇本。玩家可以合理改變原作命運，但行動有成功、失敗、代價與NPC自主反應。

## AI 與遊戲規則分工
- lib/aiAdventure.ts：電影設定、記憶、NPC、血量、理智、物品、獎勵、世界解鎖、行動成敗驗證。
- app/api/ai-adventure/route.ts：server-side AI 模型接口，JSON mode 驗證，輕量限流。
- app/ai/page.tsx：手機版純文字選項+自由輸入 UI。
- scripts/check-ai.cjs：檢查 instant win、數值上限、NPC傷亡及電影解鎖。
- 本地 localStorage 儲存 AI 模式，提供存檔 JSON 匯入匯出。

## 現階段限制
- 冇 API 金鑰 = 無法真正即時生成文本；只可以試 UI 及規則測試。
- 暫時只提供前三套電影的世界資料，唔係任何影視作品都有完整資料。
- NPC重要事實用摘要及結構化欄位保存；長篇無限遊戲仍要改善多層記憶以減少模型遺忘／矛盾。
- AI 關卡完成仍需充足劇情證據與最少八回合；應人工測試多種非預設玩家行為。
- 免費模型可有速率及長度上限；唔承諾真正零成本或無限回合。
- 以第三方電影角色作非官方互動故事仍可能涉及原作權利，公開商業發行需要檢查授權。
