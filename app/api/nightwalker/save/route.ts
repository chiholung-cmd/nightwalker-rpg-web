import {NextRequest,NextResponse} from 'next/server'
import {createHash} from 'node:crypto'
import {getMongoClient} from '../../../../lib/mongodb'
import {normalizeGame} from '../../../../lib/nightwalkerGame'
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
 }catch{return NextResponse.json({error:'雲端讀取失敗，本地存檔未受影響'}, {status:503})}
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
 }catch{return NextResponse.json({error:'雲端保存失敗；本地存檔未受影響'}, {status:503})}
}

