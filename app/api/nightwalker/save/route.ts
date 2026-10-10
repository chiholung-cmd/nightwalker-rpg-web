import {NextRequest,NextResponse} from 'next/server'
import {createHash} from 'node:crypto'
import {getMongoClient} from '../../../../lib/mongodb'
import {normalizeGame} from '../../../../lib/nightwalkerGame'
const dbFailure=(e:unknown)=>{
 // Never log or return connection URI, Atlas hostnames, user names or passwords.
 const reason=e&&typeof e==='object'&&'name' in e?String(e.name):'Unknown'
 const code=e&&typeof e==='object'&&'code' in e?String(e.code):''
 if(reason==='MongoParseError'||reason==='MongoInvalidArgumentError'||reason==='MongoAPIError')
  return {error:'MongoDB 連線字串格式不正確，請檢查 Vercel MONGODB_URI 的完整內容。',code:'MONGO_URI_INVALID'}
 if(code==='18'||reason==='MongoAuthenticationError')
  return {error:'MongoDB 身份驗證失敗。請核對 Atlas Database Access 使用者、密碼及權限。',code:'MONGO_AUTH_FAILED'}
 if(reason==='MongoServerSelectionError'||reason==='MongoNetworkError'||reason==='MongoNetworkTimeoutError')
  return {error:'MongoDB 連接失敗，請檢查 Atlas Network Access IP Allowlist、Cluster 狀態及連線字串。',code:'MONGO_NETWORK_UNREACHABLE'}
 if(reason==='MongoServerError'&&code==='8000')
  return {error:'Atlas 認證失敗。請核對 MONGODB_URI 使用嘅 Database User 密碼、使用者名稱及 URL 編碼。',code:'MONGO_AUTH_FAILED',mongoCode:'8000'}
 if(reason==='MongoServerError'&&(code==='13'||code==='11'))
  return {error:'資料庫使用者冇足夠權限。請檢查 Atlas Database Access 對 nightwalker 資料庫嘅 readWrite 角色。',code:'MONGO_ACCESS_DENIED',mongoCode:code}
 const safeType=/^[A-Za-z][A-Za-z0-9]{0,49}$/.test(reason)?reason:'Unknown'
 const safeCode=/^[0-9]{1,6}$/.test(code)?code:'none'
 return {error:'MongoDB 存檔失敗。此診斷只回傳錯誤類型，唔會暴露連線密碼或主機資料。',code:'MONGO_OPERATION_FAILED',errorType:safeType,mongoCode:safeCode}
}
export const runtime='nodejs'
export const dynamic='force-dynamic'
const headers=(req:NextRequest)=>{
 const id=req.headers.get('x-nightwalker-player')||''
 const secret=req.headers.get('x-nightwalker-save-token')||''
 if(!/^[a-zA-Z0-9-]{24,90}$/.test(id)||!/^[a-f0-9]{48,128}$/i.test(secret))return null
 return {id,hash:createHash('sha256').update(secret).digest('hex')}
}
const config=()=>Boolean(process.env.MONGODB_URI)
export async function GET(req:NextRequest){
 if(!config())return NextResponse.json({error:'雲端存檔未配置；目前瀏覽器本地存檔仍有效',code:'NO_DATABASE'}, {status:503})
 const auth=headers(req);if(!auth)return NextResponse.json({error:'缺少私人存檔憑證'}, {status:401})
 try{
  const client=await getMongoClient()
  const record=await client.db('nightwalker').collection('game_saves_v2').findOne({playerId:auth.id,tokenHash:auth.hash})
  if(!record)return NextResponse.json({error:'雲端仲未有你嘅存檔',code:'NOT_FOUND'}, {status:404})
  return NextResponse.json({state:normalizeGame(record.state),revision:record.revision||1,updatedAt:record.updatedAt})
 }catch(e){return NextResponse.json({...dbFailure(e),detail:'本地存檔未受影響'}, {status:503})}
}
export async function POST(req:NextRequest){
 if(!config())return NextResponse.json({error:'雲端存檔未配置',code:'NO_DATABASE'}, {status:503})
 const auth=headers(req);if(!auth)return NextResponse.json({error:'缺少私人存檔憑證'}, {status:401})
 const size=Number(req.headers.get('content-length')||0);if(size>650000)return NextResponse.json({error:'存檔太大'}, {status:413})
 try{
  const data=await req.json() as {state?:unknown;revision?:number}
  const state=normalizeGame(data.state)
  if(state.heroId!==auth.id)return NextResponse.json({error:'角色身份不一致'}, {status:403})
  const db=(await getMongoClient()).db('nightwalker')
  const collection=db.collection('game_saves_v2')
  const existing=await collection.findOne({playerId:auth.id})
  if(existing&&existing.tokenHash!==auth.hash)return NextResponse.json({error:'雲端存檔憑證不符'}, {status:403})
  if(existing&&Number(data.revision)!==existing.revision)return NextResponse.json({error:'雲端已有更新嘅存檔，請先讀取再選擇',code:'REVISION_CONFLICT'}, {status:409})
  const revision=(existing?.revision||0)+1
  await collection.updateOne({playerId:auth.id,tokenHash:auth.hash},
   {$set:{state,revision,updatedAt:new Date()},$setOnInsert:{playerId:auth.id,tokenHash:auth.hash,createdAt:new Date()}},
   {upsert:true})
  return NextResponse.json({success:true,revision})
 }catch(e){return NextResponse.json({...dbFailure(e),detail:'本地存檔未受影響'}, {status:503})}
}

