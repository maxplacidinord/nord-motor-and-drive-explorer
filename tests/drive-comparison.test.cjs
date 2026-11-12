// Run with node --test tests/*.test.cjs. No browser or packages required.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const vm=require('node:vm');
const html=readFileSync(resolve(__dirname,'../NORD-motor-and-drive-explorer.html'),'utf8');
const start=html.indexOf('// BEGIN DRIVE COMPARISON');
const end=html.indexOf('let dcRenderKey',start);
assert.ok(start>0&&end>start);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context=vm.createContext({settings:{},maEscape:esc,maLink:(url,label)=>`<a href="${esc(url)}">${esc(label)}</a>`});
vm.runInContext(html.slice(start,end)+'\nthis.api={products:dcProducts,nord:dcNord,rivals:dcRivals,config:dcConfig,setNord:dcSetNord,compare:dcCompare,range:dcRange,makers:dcManufacturers,spec:dcSpec};',context);
const api=context.api;

test('Portfolio records resolve to credited offline photographs and primary evidence',()=>{
 const ids=new Set(api.products.map(p=>p.id));
 assert.equal(ids.size,api.products.length);
 assert.equal(api.nord().length,9);assert.equal(api.rivals().length,20);
 assert.equal(new Set(api.rivals().map(p=>p.maker)).size,7);
 for(const p of api.products){
  for(const key of ['id','maker','name','architecture','powerRange','control','motors','networks','safety','positioning','regeneration','fit','tradeoff'])assert.ok(p[key],`${p.id}: ${key}`);
  assert.match(p.photo.data,/^data:image\/webp;base64,/);
  const bytes=Buffer.from(p.photo.data.split(',')[1],'base64');
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(p.photo.credit&&p.photo.width>0&&p.photo.height>0);
  assert.ok(p.sources.length>0);for(const s of p.sources)assert.equal(new URL(s.url).protocol,'https:');
  for(const id of p.comparators)assert.ok(ids.has(id)&&api.rivals().some(c=>c.id===id),`${p.id}: unresolved comparator ${id}`);
 }
});
test('Every NORD selection resets the rival to a valid recommendation or fallback',()=>{
 for(const n of api.nord()){
  context.settings={dcNord:'missing',dcRival:'missing'};api.setNord(n.id);
  const q=api.config();assert.equal(q.nord.id,n.id);assert.ok(q.rival.maker!=='NORD');
  if(n.comparators.length)assert.ok(n.comparators.includes(q.rival.id));
 }
 context.settings={dcNord:'siemens-g120c',dcRival:'pro500p'};
 assert.equal(api.config().nord.maker,'NORD');assert.notEqual(api.config().rival.maker,'NORD');
});
test('Every comparison preserves all nine engineering rows and product-specific evidence',()=>{
 for(const n of api.nord())for(const rival of api.rivals()){
  const output=api.compare(n,rival);
  assert.equal((output.match(/<th scope="row">/g)||[]).length,9);
  assert.ok(output.includes(esc(n.name))&&output.includes(esc(rival.name)));
  assert.ok(output.includes(esc(n.tradeoff))&&output.includes(esc(rival.tradeoff)));
  assert.ok(output.includes(esc(n.sources[0].url))&&output.includes(esc(rival.sources[0].url)));
  assert.equal((output.match(/<img /g)||[]).length,2);
  if(!n.comparators.includes(rival.id))assert.ok(output.includes('cross-category'));
 }
});
test('Unqualified or negative prose cannot acquire a positive standard-feature badge',()=>{
 for(const value of ['No integrated functional safety','Optional Ethernet interface','SK 550P only: integrated Ethernet']){
  const output=api.spec(value);assert.ok(output.includes(value));assert.ok(!output.includes('Standard / integrated'));
 }
});
test('Range and manufacturer articles expose every product without temporary file URLs',()=>{
 const range=api.range(),makers=api.makers();
 assert.equal((range.match(/<img /g)||[]).length,9);assert.equal((makers.match(/<img /g)||[]).length,29);
 for(const p of api.products)assert.ok(makers.includes(esc(p.name)));
 for(const output of [range,makers])assert.ok(!output.includes('/tmp/'));
 assert.match(makers,/editorial inferences/);
});
