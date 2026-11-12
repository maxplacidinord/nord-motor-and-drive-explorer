const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../NORD-motor-and-drive-explorer.html'),'utf8');
const code=html.slice(html.indexOf('// BEGIN CONFIGURATION TRANSITIONS'),html.indexOf('// END CONFIGURATION TRANSITIONS'));
function shape(tag,attrs,text=''){
 return {tagName:tag,textContent:text,id:attrs.id||'',attrs:{...attrs},get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}));},getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},hasAttribute(k){return k in this.attrs;},closest(){return null;}};
}
function harness(nodes){
 let next,clock=0;
 const root={querySelectorAll:()=>nodes};
 const ctx=vm.createContext({S:root,matchMedia:()=>({matches:false,addEventListener(){}}),document:{addEventListener(){}},performance:{now:()=>clock},requestAnimationFrame:fn=>{next=fn;return 1;},cancelAnimationFrame:()=>{next=null;},draw(){},Map,console});
 vm.runInContext(code+';this.api={configSnapshot,configMorph,configCancel};',ctx);
 return {api:ctx.api,frame(t){clock=t;const f=next;next=null;f?.(t);},pending:()=>!!next};
}
test('configuration geometry moves through an intermediate state and restores exact targets',()=>{
 const n=shape('line',{x1:'0',y1:'20',x2:'50',y2:'20',stroke:'blue'}),h=harness([n]);const before=h.api.configSnapshot({querySelectorAll:()=>[n]});n.setAttribute('x2','250');h.api.configMorph(before);
 assert.equal(n.attrs.x2,'50');h.frame(260);assert.equal(n.attrs.x2,'150');h.frame(520);assert.equal(n.attrs.x2,'250');assert.equal(h.pending(),false);
});
test('cancelling a transition restores the final geometry',()=>{
 const n=shape('circle',{cx:'0',cy:'0',r:'10'}),h=harness([n]);const before=h.api.configSnapshot({querySelectorAll:()=>[n]});n.setAttribute('cx','100');h.api.configMorph(before);h.frame(100);h.api.configCancel();assert.equal(n.attrs.cx,'100');assert.equal(h.pending(),false);
});
test('introduced components fade in without retaining an artificial opacity',()=>{
 const n=shape('rect',{x:'0',y:'0',width:'10',height:'20'}),h=harness([n]);h.api.configMorph(new Map());assert.equal(n.attrs.opacity,'0');h.frame(520);assert.equal(n.hasAttribute('opacity'),false);
});
test('transform interpolation follows the actual winding orientation',()=>{
 const n=shape('g',{transform:'translate(10 20) rotate(0)'}),h=harness([n]);const before=h.api.configSnapshot({querySelectorAll:()=>[n]});n.setAttribute('transform','translate(30 40) rotate(120)');h.api.configMorph(before);h.frame(260);assert.equal(n.attrs.transform,'translate(20 30) rotate(60)');h.frame(520);assert.equal(n.attrs.transform,'translate(30 40) rotate(120)');
});
