import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {WebSocket} from 'ws';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const port=15182;let server;const clients=[];
async function start(dir,npcInterval='3600000'){server=spawn(process.execPath,['server.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),DATA_DIR:dir,NPC_INTERVAL_MS:npcInterval,EVENT_CYCLE_MS:'100000',EVENT_ACTIVE_MS:'100000'},stdio:['ignore','pipe','pipe']});let errors='';server.stderr.on('data',b=>errors+=b);for(let i=0;i<100;i++){try{const r=await fetch(`http://localhost:${port}/api/rooms`);if(r.ok)return}catch{}await pause(50)}throw Error('Server start failed: '+errors)}
async function stop(){if(!server||server.exitCode!==null)return;const s=server;await new Promise(r=>{s.once('exit',r);s.kill()})}
async function connect(name,token,room='Sài Gòn 01'){const ws=new WebSocket(`ws://localhost:${port}`);const inbox=[];ws.on('message',b=>inbox.push(JSON.parse(b)));await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)});const c={ws,inbox,send:m=>ws.send(JSON.stringify(m)),async wait(type,predicate=()=>true){for(let i=0;i<120;i++){const n=inbox.findIndex(m=>m.type===type&&predicate(m));if(n>=0)return inbox.splice(n,1)[0];await pause(25)}throw Error(`Timeout ${type}: ${JSON.stringify(inbox.filter(m=>m.type!=='players'))}`)},async action(m,type='state'){await pause(280);inbox.length=0;this.send(m);return this.wait(type)}};clients.push(c);c.send({type:'join',name,token,room,color:0});c.welcome=await c.wait('welcome');return c}
async function walk(c,x,z){let px=0,pz=13;const n=Math.ceil(Math.hypot(x-px,z-pz)/.5);for(let i=1;i<=n;i++){await pause(85);c.send({type:'move',x:px+(x-px)*i/n,z:pz+(z-pz)*i/n})}await pause(120)}
test('economy: conservation, bargaining, persistence, validation and room isolation', {timeout:45000},async()=>{const dir=await mkdtemp(path.join(os.tmpdir(),'cho-coc-test-'));try{
await start(dir);const a=await connect('Cô Ba'),b=await connect('Khách mua'),other=await connect('Khu khác',null,'Sài Gòn 02');const token=a.welcome.token;const seller=a.welcome.id;
let m=await a.action({type:'claim'});assert.equal(m.profile.stall.level,0);
m=await a.action({type:'stock',item:'mango',qty:5});assert.equal(m.profile.coins,110);assert.equal(m.profile.bag.mango,5);
m=await a.action({type:'list',item:'mango',qty:3,price:15});assert.equal(m.profile.bag.mango,2);assert.equal(m.profile.stall.listings.mango.qty,3);const lotVersion=m.profile.stall.listings.mango.version;
assert.match((await a.action({type:'stock',item:'mango',qty:-10},'error')).message,/Số lượng/);assert.match((await a.action({type:'stock',item:'__proto__',qty:1},'error')).message,/không tồn tại/);assert.match((await a.action({type:'stock',item:'flower',qty:20},'error')).message,/đủ vốn/);
assert.match((await b.action({type:'directBuy',seller,item:'mango',price:15,version:lotVersion},'error')).message,/gần sạp/);
assert.match((await other.action({type:'directBuy',seller,item:'mango',price:15,version:lotVersion},'error')).message,/rời khu chợ/);
await walk(b,-5,10);assert.match((await b.action({type:'directBuy',seller,item:'mango',price:1,version:lotVersion},'error')).message,/đã đổi/);m=await b.action({type:'directBuy',seller,item:'mango',price:15,version:lotVersion});assert.equal(m.profile.coins,135);assert.equal(m.profile.bag.mango,1);const stateA=await a.wait('state',m=>m.profile.sales===1);assert.equal(stateA.profile.coins,155);assert.equal(stateA.profile.stall.listings.mango.qty,2);
m=await b.action({type:'offer',seller,item:'mango',price:9},'offer');const offer=m.offer;await a.wait('offer',m=>m.offer.id===offer.id);
m=await a.action({type:'counter',id:offer.id,price:12},'offer');assert.equal(m.offer.turn,b.welcome.id);await b.wait('offer',m=>m.offer.price===12);
assert.match((await other.action({type:'accept',id:offer.id},'error')).message,/không tham gia/);
m=await b.action({type:'accept',id:offer.id});assert.equal(m.profile.coins,123);assert.equal(m.profile.bag.mango,2);
assert.match((await b.action({type:'accept',id:offer.id},'error')).message,/hết hạn/);
// A replacement lot must invalidate an old negotiated price.
m=await b.action({type:'offer',seller,item:'mango',price:10},'offer');const stale=m.offer.id;await a.action({type:'unlist',item:'mango'});await a.action({type:'list',item:'mango',qty:2,price:18});assert.match((await a.action({type:'accept',id:stale},'error')).message,/thay đổi/);
m=await a.action({type:'upgrade'});assert.equal(m.profile.stall.level,1);assert.equal(m.profile.coins,67);
await a.action({type:'stock',item:'coffee',qty:5,event:true});assert.match((await a.action({type:'stock',item:'coffee',qty:1,event:true},'error')).message,/5 món/);
const privateUrl=await fetch(`http://localhost:${port}/data/market.json`);assert.equal(privateUrl.status,404);
for(const c of clients)c.ws.close();await pause(150);await stop();await start(dir);const restored=await connect('Tên mới',token);assert.equal(restored.welcome.profile.name,'Cô Ba');assert.equal(restored.welcome.profile.stall.level,1);assert.equal(restored.welcome.profile.coins,52);assert.equal(restored.welcome.profile.bag.coffee,5);assert.equal(restored.welcome.profile.sales,2);
const same=await connect('Tab khác',token);assert.equal(same.welcome.id,seller);await pause(100);assert.notEqual(restored.ws.readyState,WebSocket.OPEN);
}finally{for(const c of clients)c.ws.terminate();await stop();await rm(dir,{recursive:true,force:true})}});


test('NPC buys a single listed item, pays once and grants the first-sale reward once',{timeout:12000},async()=>{const dir=await mkdtemp(path.join(os.tmpdir(),'cho-coc-npc-'));let c;try{await start(dir,'1000');c=await connect('Sạp thử NPC');await c.action({type:'claim'});await c.action({type:'stock',item:'coffee',qty:1});await c.action({type:'list',item:'coffee',qty:1,price:12});const sold=await c.wait('state',m=>m.profile.sales===1);assert.equal(sold.profile.coins,186);assert.equal(sold.profile.stall.listings.coffee.qty,0);await pause(1200);const token=c.welcome.token;c.ws.close();await pause(100);const restored=await connect('NPC restore',token);assert.equal(restored.welcome.profile.coins,186);assert.equal(restored.welcome.profile.sales,1)}finally{for(const c of clients)c.ws.terminate();await stop();await rm(dir,{recursive:true,force:true})}});

