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
vm.runInContext(html.slice(start,end)+'\nthis.api={products:dcProducts,nord:dcNord,rivals:dcRivals,config:dcConfig,setNord:dcSetNord,compare:dcCompare,range:dcRange,makers:dcManufacturers,spec:dcSpec,findings:dcFindings,assess:dcAssess,byId:dcById};',context);
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

test('Every feature finding has primary evidence and unknown never means unavailable',()=>{
 const states=new Set(['standard','option','variant','licence','system','external','absent','unknown']);
 for(const p of api.products){
  for(const key of ['networks','positioning','safety','regeneration']){
   const f=p.evidence[key];assert.ok(f,`${p.id}: ${key}`);
   assert.ok(states.has(f.state));assert.ok(f.label&&f.text);
   assert.equal(new URL(f.url).protocol,'https:');
  }
  if(p.maker!=='NORD')assert.ok(p.briefing?.text&&p.briefing?.url);
 }
 for(const state of states)for(const pair of [['unknown',state],[state,'unknown']]){
  const f=api.assess({state:pair[0]},{state:pair[1]});
  assert.equal(f.kind,'check');assert.equal(f.label,'Evidence gap');
 }
 // A separate regenerative unit is not an integrated capability advantage.
 for(const pair of [['absent','external'],['external','absent'],['external','standard']]){
  assert.equal(api.assess({state:pair[0]},{state:pair[1]}).kind,'different');
 }
});

test('G120C comparison explains both POSICON and the different STO provision',()=>{
 const n=api.byId('pro500p'),c=api.byId('siemens-g120c'),f=api.findings(n,c);
 assert.equal(f.find(x=>x.key==='positioning').kind,'nord');
 assert.equal(f.find(x=>x.key==='safety').kind,'rival');
 const output=api.compare(n,c);
 assert.match(output,/No drive-integrated position control/);
 assert.match(output,/optional dual-channel CU5-STO/);
 assert.match(output,/not a claim that NORD cannot do it/);
 assert.ok(output.indexOf('What is missing or needs adding?')<output.indexOf('All specifications'));
 assert.match(output,/<details class="dc-disclosure dc-full-specs">/);
});

test('Regeneration remains scoped to the actual topology and variant',()=>{
 const n=api.byId('flex');
 const g=api.findings(n,api.byId('siemens-g120d')).find(f=>f.key==='regeneration');
 assert.equal(g.kind,'rival');assert.equal(g.b.state,'standard');
 const abb=api.findings(n,api.byId('abb-acs880')).find(f=>f.key==='regeneration');
 assert.equal(abb.b.state,'variant');assert.match(abb.b.text,/-11\/-14\/-17/);
 const fc=api.findings(n,api.byId('danfoss-fc302')).find(f=>f.key==='regeneration');
 assert.equal(fc.kind,'different');assert.equal(fc.b.state,'external');
});

test('Safe-speed capability is distinct from STO and qualified to its manual',()=>{
 const n=api.byId('pro500p'),atv320=api.byId('schneider-atv320');
 const speed=api.findings(n,atv320).find(f=>f.key==='safeMotion');
 assert.equal(speed.kind,'rival');assert.equal(speed.a.state,'absent');
 assert.match(speed.a.label,/BU 0630 en-0322/);assert.match(speed.a.text,/CU5-MLT/);
 assert.match(speed.b.text,/SLS and SMS/);
 const atv340=api.byId('schneider-atv340');
 assert.equal(atv340.evidence.safeMotion.state,'option');
 assert.match(atv340.evidence.safeMotion.text,/VW3A3802/);
 assert.match(api.byId('danfoss-fc302').evidence.positioning.text,/48\.XX.*S067/);
});

test('All 180 pairings retain readable, independently sourced findings',()=>{
 for(const n of api.nord())for(const c of api.rivals()){
  const findings=api.findings(n,c),output=api.compare(n,c);
  assert.ok(findings.length>=4);
  for(const f of findings){
   assert.ok(output.includes(`data-dc-finding="${f.key}"`));
   assert.ok(output.includes(esc(f.a.url))&&output.includes(esc(f.b.url)));
   if(f.a.state==='unknown'||f.b.state==='unknown')assert.equal(f.kind,'check');
  }
  assert.equal((output.match(/class="dc-fact"/g)||[]).length,findings.length*2);
  assert.equal((output.match(/<details /g)||[]).length,(findings.some(f=>f.kind==='check')?1:0)+3);
 }
});

test('Invalid stored sections recover to the comparison view',()=>{
 context.settings={dcSection:'missing-section'};
 assert.equal(api.config().section,'compare');
});

test('ON extended safety is model-scoped and is not inherited by ON PURE',()=>{
 const on=api.byId('on'),pure=api.byId('nord-on-pure');
 assert.equal(on.evidence.safeMotion.state,'variant');
 assert.match(on.evidence.safeMotion.text,/SK 3x2P/);
 assert.match(on.evidence.safeMotion.label,/BU 0840/);
 assert.equal(pure.evidence.safeMotion.state,'absent');
 assert.equal(pure.evidence.safety.state,'absent');
});

test('The folded architecture does not schedule hidden animation frames',()=>{
 const a=html.indexOf('function dcArchitectureLayout('),b=html.indexOf('function dcMount()',a);
 let scheduled=0;
 const disclosure={open:false};
 const element={setAttribute(){},closest:()=>disclosure};
 const elements={'dc-architecture':element,'dc-arch-placement':{},'dc-architecture-description':{},'dc-flow-toggle':element,'dc-experience':{querySelectorAll:()=>[]}};
 const ctx=vm.createContext({$:id=>elements[id],settings:{dcArchitecture:'cabinet'},dcConfig:()=>({nord:{placement:'cabinet'}}),dcArchitectureTarget:null,dcArchitectureRaf:0,dcArchitectureLast:100,dcArchitectureRun:false,requestAnimationFrame:()=>++scheduled});
 vm.runInContext(html.slice(a,b)+';this.sync=dcArchitectureSync;this.frame=dcArchitectureFrame;',ctx);
 ctx.sync();assert.equal(scheduled,0);
 ctx.frame(200);assert.equal(ctx.dcArchitectureLast,0);assert.equal(scheduled,0);
 disclosure.open=true;ctx.sync();assert.equal(scheduled,1);
});
