import {catalog} from './catalog.js';
const $=id=>document.getElementById(id);
const goods=catalog;
let me=null,stalls=[],eventInfo=null,tab='mine';const offers=new Map();
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function button(text,fn,cls='market-button'){const b=el('button',text,cls);b.type='button';b.onclick=fn;return b}
function send(m){window.choMarket?.send(m)}
function notice(message){window.choMarket?.toast(message)}
const dock=el('nav',undefined,'market-dock hidden');dock.id='marketDock';dock.append(button('▧ Sạp của tôi',()=>open('mine')),button('⇄ Dạo chợ',()=>open('browse')),button('♧ Mặc cả · 0',()=>open('offers')));dock.children[2].id='offersCount';document.body.append(dock);
const banner=el('button','', 'event-banner hidden');banner.onclick=()=>open('stock');document.body.append(banner);
const panel=el('section',undefined,'market-panel hidden');panel.setAttribute('aria-label','Kinh doanh trong chợ');const head=el('div',undefined,'market-head');head.append(el('span','CHỢ CÓC · THUẬN MUA VỪA BÁN','eyebrow'),button('×',()=>panel.classList.add('hidden'),'market-close'));const title=el('h2','Sạp của tôi');const tabs=el('div',undefined,'market-tabs');for(const [key,name] of [['mine','Sạp của tôi'],['stock','Nhập hàng'],['browse','Dạo chợ'],['offers','Mặc cả']]){const b=button(name,()=>open(key));b.dataset.tab=key;tabs.append(b)}const body=el('div',undefined,'market-body');panel.append(head,title,tabs,body);document.body.append(panel);
function open(key){if(!me)return notice('Vào chợ trước nhé!');tab=key;panel.classList.remove('hidden');$('shop').classList.add('hidden');$('bag').classList.add('hidden');render()}
function numberInput(value,min,max,label){const n=el('input');n.type='number';n.value=value;n.min=min;n.max=max;n.setAttribute('aria-label',label);return n}
function itemSelect(){const s=el('select');s.setAttribute('aria-label','Chọn mặt hàng');for(const [key,g] of Object.entries(goods)){const o=el('option',`${g.icon} ${g.name}`);o.value=key;s.append(o)}return s}
function hint(text){return el('p',text,'market-hint')}
function card(){const c=el('div',undefined,'market-card');body.append(c);return c}
function render(){if(!me)return;title.textContent={mine:'Mở hàng lấy hên',stock:'Nhập hàng đầu mối',browse:'Bà con đang bán gì?',offers:'Bớt chút đi chị!'}[tab];for(const b of tabs.children)b.classList.toggle('active',b.dataset.tab===tab);body.replaceChildren();
if(tab==='mine'){
const summary=card();summary.append(el('b',`${me.coins} xu vốn · ${me.sales} đơn đã bán`),hint(`Doanh thu ${me.earned} xu · ${me.reward?'Đã nhận thưởng mở hàng':'Bán đơn đầu tiên để nhận thưởng 30 xu'}`));
if(!me.stall){const c=card();c.append(el('h3','Từ một chiếc mẹt nhỏ…'),hint('Nhận chỗ bán miễn phí, nhập hàng rồi đặt mức giá đầu tiên.'),button('Nhận mẹt miễn phí',()=>send({type:'claim'}),'primary'));return}
const s=me.stall,c=card();c.append(el('h3',`${['Mẹt','Xe đẩy','Sạp lớn'][s.level]} · Ô ${s.slot+1}`),hint(`${s.room} · Sức chứa ${[10,30,80][s.level]} món. Sạp được giữ khi bạn rời chợ.`));const f=el('form',undefined,'market-row'),name=el('input');name.value=s.title;name.maxLength=28;name.setAttribute('aria-label','Tên sạp');f.append(name,button('Đổi tên',()=>send({type:'rename',title:name.value})));f.onsubmit=e=>{e.preventDefault();send({type:'rename',title:name.value})};c.append(f);if(s.level<2)c.append(button(`Nâng lên ${s.level===0?'xe đẩy · 100':'sạp lớn · 250'} xu`,()=>send({type:'upgrade'})));c.append(button('Đi tới sạp của tôi ↗',()=>window.choMarket.gotoStall(s.slot)));
const list=card();list.append(el('h3','Bày hàng lên sạp'));const form=el('form',undefined,'list-form'),item=itemSelect(),qty=numberInput(1,1,80,'Số lượng bày bán'),price=numberInput(15,1,10000,'Giá bán mỗi món');item.onchange=()=>price.value=goods[item.value].retail;form.append(el('label','Mặt hàng'),item,el('label','Số lượng'),qty,el('label','Giá mỗi món (xu)'),price);const submit=el('button','Bày hàng','primary');form.append(submit);form.onsubmit=e=>{e.preventDefault();send({type:'list',item:item.value,qty:Number(qty.value),price:Number(price.value)})};list.append(form,hint('Nhập hàng vào túi trước. Hàng đang bày được tách khỏi túi đồ.'));
const inv=card();inv.append(el('h3','Hàng đang bày'));let n=0;for(const [key,l] of Object.entries(s.listings)){if(!l.qty)continue;n++;const row=el('div',undefined,'market-product');row.append(el('span',`${goods[key].icon} ${goods[key].name} × ${l.qty}`),el('b',`${l.price} xu`),button('Thu hồi',()=>send({type:'unlist',item:key})));inv.append(row)}if(!n)inv.append(hint('Chưa có hàng trên sạp.'));const bagCard=card();bagCard.append(el('h3','Hàng trong túi'));for(const [key,g] of Object.entries(goods))bagCard.append(hint(`${g.icon} ${g.name}: ${me.bag[key]||0}`));
}else if(tab==='stock'){
body.append(hint('Nhập trực tiếp từ đầu mối để bổ sung hàng cho sạp. Giá dưới đây là vốn cho mỗi món.'));
if(!me.stall){body.append(button('Mở sạp trước',()=>open('mine'),'primary'));return}
if(me.stall.room!==$('roomLabel').textContent){body.append(hint(`Sạp của bạn ở ${me.stall.room}. Vào đúng khu chợ để nhập và bày hàng.`));return}
for(const [key,g] of Object.entries(goods)){const c=card(),qty=numberInput(1,1,20,`Số lượng nhập ${g.name}`);c.append(el('h3',`${g.icon} ${g.name}`),hint(`Giá vốn ${g.cost} xu · Giá bán tham khảo ${g.retail} xu`));const row=el('div',undefined,'market-row');row.append(qty,button('Nhập hàng',()=>send({type:'stock',item:key,qty:Number(qty.value)})));c.append(row);if(eventInfo?.active)c.append(button(`Nhập từ xe · ${Math.max(1,Math.floor(g.cost*.65))} xu/món`,()=>send({type:'stock',item:key,qty:Number(qty.value),event:true}),'event-buy'))}
body.append(hint('Xe về mỗi 3 phút, ở lại 45 giây. Mỗi chuyến tối đa 5 món/loại/người và 40 món/loại/khu chợ.'));
}else if(tab==='browse'){
body.append(hint('Bấm “Ghé sạp” để nhân vật đi tới. Bạn cần ở gần sạp khi chốt giao dịch.'));
if(!stalls.length)body.append(hint('Chưa ai mở hàng. Bạn sẽ là tiểu thương đầu tiên?'));
for(const s of stalls){const c=card();c.append(el('h3',`${s.title}${s.owner===me.id?' · Của bạn':''}`),hint(`${s.name} · ${['Mẹt','Xe đẩy','Sạp lớn'][s.level]} · ${s.online?'Đang bán':'Đã nghỉ, ghé lại sau'}`),hint(s.brand?.motto||''),hint('Uy tín: '+(s.brand?.reputation||0)),button('Ghé sạp ↗',()=>window.choMarket.gotoStall(s.slot)));if(!s.listings.length)c.append(hint('Sạp đang chờ nhập hàng.'));for(const l of s.listings){const row=el('div',undefined,'market-product');row.append(el('b',`${goods[l.item].icon} ${goods[l.item].name}`),hint(`${l.qty} món · ${l.price} xu/món`));if(s.owner!==me.id&&s.online){const controls=el('div',undefined,'market-row'),price=numberInput(Math.max(1,l.price-2),1,10000,`Giá mặc cả ${goods[l.item].name}`);controls.append(button('Mua ngay',()=>send({type:'directBuy',seller:s.owner,item:l.item,price:l.price,version:l.version})),price,button('Trả giá',()=>send({type:'offer',seller:s.owner,item:l.item,price:Number(price.value)})));const quantity=numberInput(2,2,20,'Số lượng mua sỉ');controls.append(quantity,button('Mua cả lô',()=>send({type:'wholesale',requestId:crypto.randomUUID(),seller:s.owner,item:l.item,qty:Number(quantity.value),price:l.price,version:l.version})));row.append(controls)}c.append(row)}}
}else{
if(!offers.size)body.append(hint('Chưa có lời mặc cả. Ghé sạp của người chơi khác để hỏi giá nhé.'));
for(const o of offers.values()){const c=card(),myTurn=o.turn===me.id;c.append(el('h3',`${goods[o.item].icon} ${goods[o.item].name} · ${o.price} xu`),hint(`${o.buyerName} ↔ ${o.sellerName} · ${myTurn?'Tới lượt bạn':'Chờ bên kia trả lời'}`),hint(`Hết hạn lúc ${new Date(o.expires).toLocaleTimeString('vi-VN')}`));if(myTurn){const row=el('div',undefined,'market-row'),price=numberInput(o.price,1,10000,'Giá trả lại');row.append(button('Chốt giá',()=>send({type:'accept',id:o.id})),price,button('Trả lại',()=>send({type:'counter',id:o.id,price:Number(price.value)})));c.append(row)}c.append(button('Thôi, hẹn lần sau',()=>send({type:'reject',id:o.id})))}
}}
let wasActive=false;function updateEvent(){if(!eventInfo)return;window.choMarket?.setEvent(eventInfo.active);const left=Math.max(0,Math.ceil(((eventInfo.active?eventInfo.endsAt:eventInfo.nextAt)-Date.now())/1000));banner.textContent=eventInfo.active?`🚚 XE HÀNG VỀ! · Giá vốn ưu đãi · Còn ${left}s ↗`:`🚚 Chuyến hàng tiếp theo · ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;banner.classList.remove('hidden');if(wasActive!==eventInfo.active&&tab==='stock'&&!panel.classList.contains('hidden'))render();wasActive=eventInfo.active}
addEventListener('market-message',e=>{const m=e.detail;if(m.type==='welcome'){me=m.profile;try{localStorage.setItem('cho-coc-token',m.token);localStorage.setItem('cho-coc-name',me.name)}catch{}dock.classList.remove('hidden');offers.clear();$('offersCount').textContent='♧ Mặc cả · 0';updateWallet();render();notice('Tiến độ được tự lưu trên máy chủ. Chúc bạn mở hàng may mắn!')}
if(m.type==='state'){me=m.profile;updateWallet();if(!panel.classList.contains('hidden'))render()}
if(m.type==='market'){stalls=m.stalls;eventInfo=m.event;window.choMarket.updateStalls(stalls);updateEvent();if(tab==='browse'&&!panel.classList.contains('hidden'))render()}
if(m.type==='event'){eventInfo=m.event;updateEvent()}
if(m.type==='notice')notice(m.message);
if(m.type==='offer'){offers.set(m.offer.id,m.offer);$('offersCount').textContent=`♧ Mặc cả · ${offers.size}`;notice(`${m.offer.buyerName} ↔ ${m.offer.sellerName}: ${m.offer.price} xu`);if(tab==='offers')render()}
if(m.type==='offerEnd'){offers.delete(m.id);$('offersCount').textContent=`♧ Mặc cả · ${offers.size}`;notice(m.message);if(tab==='offers')render()}
});
addEventListener('market-disconnected',()=>{dock.classList.add('hidden');banner.classList.add('hidden');panel.classList.add('hidden');me=null;offers.clear()});
function updateWallet(){$('coins').textContent=me.coins;window.choMarket.updateBag(me.bag)}
setInterval(updateEvent,1000);
async function roomCounts(){try{const rooms=await(await fetch('/api/rooms')).json();for(const option of $('room').options){const r=rooms.find(r=>r.name===option.value);if(r){option.value=r.name;option.textContent=`${r.name} · ${r.count}/${r.capacity} người`}}}catch{}}
roomCounts();setInterval(roomCounts,10000);
try{$('name').value=localStorage.getItem('cho-coc-name')||''}catch{}
window.addEventListener('open-market',()=>open('browse'));




addEventListener('open-market-tab',e=>{if(['mine','stock','browse','offers'].includes(e.detail))open(e.detail)});

