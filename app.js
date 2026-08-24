const screens=[...document.querySelectorAll('.screen')];
const game=document.getElementById('game');
const dialogText=document.getElementById('dialogText');
const choices=document.getElementById('choices');
const heroSprite=document.getElementById('heroSprite');
const progress=document.getElementById('progress');

const state={gender:'male',name:'ゆうしゃ',answers:{},asked:[],step:0,sound:true,result:null};

// --- 8-bit-ish audio: no sound files required ---
let audioCtx=null;
function ensureAudio(){if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}
function tone(freq=440,dur=.06,type='square',vol=.035,delay=0){if(!state.sound)return;ensureAudio();const t=audioCtx.currentTime+delay;const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur)}
function sfx(name){if(!state.sound)return;const m={cursor:[[660,.045],[880,.045]],ok:[[523,.05],[659,.05],[784,.09]],no:[[220,.07],[165,.1]],king:[[147,.055],[131,.07]],fanfare:[[523,.09],[659,.09],[784,.09],[1047,.22]],warp:[[330,.05],[440,.05],[660,.06],[880,.07],[1320,.12]]};(m[name]||[]).forEach((n,i)=>tone(n[0],n[1],'square',.04,i*.055))}

const services={
  chatgpt:{name:'ChatGPT',tagline:'万能型の 王道AI',url:'https://chatgpt.com/',reason:'何でも一通りこなし、考える・作る・調べるを一つの相棒にまとめたい勇者向け。迷った時の総合装備。',stats:{'万能さ':5,'コード':5,'手軽さ':5,'探索':4}},
  claude:{name:'Claude',tagline:'思考と長文に強い 賢者AI',url:'https://claude.ai/',reason:'文章・長い資料・設計や推敲をじっくり扱いたい勇者向け。品質重視の知性派装備。',stats:{'文章':5,'思考':5,'コード':4,'手軽さ':4}},
  gemini:{name:'Gemini',tagline:'Google王国と縁深きAI',url:'https://gemini.google.com/',reason:'Google系サービスをよく使い、日常の検索・整理・作業を広く任せたい勇者向け。',stats:{'Google':5,'探索':5,'手軽さ':5,'万能さ':4}},
  perplexity:{name:'Perplexity',tagline:'探索を得意とする 斥候AI',url:'https://www.perplexity.ai/',reason:'まず調べる、出典を追う、最新情報を探す――そんな情報探索の旅を重く見る勇者向け。',stats:{'探索':5,'調査':5,'手軽さ':4,'文章':3}},
  copilot:{name:'Microsoft Copilot',tagline:'仕事場に潜む 実務支援AI',url:'https://copilot.microsoft.com/',reason:'Microsoft系の道具を日々使い、仕事の延長線でAIを使いたい勇者向け。',stats:{'仕事':5,'MS連携':5,'手軽さ':4,'万能さ':4}},
  grok:{name:'Grok',tagline:'騒がしき広場を駆ける 情報AI',url:'https://grok.com/',reason:'世の中の話題やスピード感ある情報収集を楽しみつつ、気軽にAIと付き合いたい勇者向け。',stats:{'話題性':5,'探索':4,'気軽さ':5,'万能さ':4}},
  local:{name:'ローカルLLM',tagline:'己の城に AIを宿す者',url:'https://lmstudio.ai/',reason:'秘密を外へ出したくない。そして設定という魔物とも戦える。そなたには「自前AI工房」が似合う。',stats:{'ひみつ':5,'自由さ':5,'オフライン':5,'手軽さ':2}}
};

const baseQuestions=[
  {id:'budget',text:'まず聞こう。\nそなたは AIごときに毎月たくさんの金を\n払うのは できれば避けたいか？'},
  {id:'quality',text:'ほう……では そなた。\n多少の金がかかっても\n答えの質には こだわりたいか？'},
  {id:'privacy',text:'これは大事じゃ。\n仕事や秘密の話を どこぞの雲の城へ預けるのは\nなるべく避けたいか？'},
  {id:'search',text:'世界は毎日かわる。\n最新の出来事を その場で探しながら答える力を\n重く見るか？'},
  {id:'google',text:'そなたの旅袋には\nGmail・Drive・Docsなど Googleの道具が\nいつも入っておるか？'},
  {id:'microsoft',text:'では Microsoftの城――\nWord・Excel・Teams・Windowsとは\n縁が深いほうか？'},
  {id:'coding',text:'コードという呪文を\nAIに書かせたり 技術の相談をしたりすることが\n多そうか？'},
  {id:'longform',text:'長い文書や資料を\nじっくり読ませて 考えを整理させる仕事を\nよく頼みたいか？'},
  {id:'trends',text:'世の中の話題やSNSの空気を\nすばやく拾って話せる相棒は\n魅力的に見えるか？'}
];
const branches={
  privacy:{when:v=>v===true,q:{id:'setup',text:'なんと……用心深い勇者じゃ。\nならば聞く。己のPCにAIを住まわせるため\n設定という魔物と戦う覚悟はあるか？'}},
  budget:{when:v=>v===true,q:{id:'freeTolerance',text:'金は惜しい、と。\nでは無料のためなら 少々の制限や不便さを\n受け入れる覚悟はあるか？'}},
  quality:{when:v=>v===true,q:{id:'specialist',text:'品質にこだわるか。欲深いのう。\n万能な一本より 得意分野の尖ったAIを\n使い分けるのも苦ではないか？'}}
};

function show(id){screens.forEach(s=>s.classList.toggle('active',s.id===id))}
function heroMarkup(){return `<div class="pixel-hero ${state.gender==='female'?'hero-female':'hero-male'}"><span class="hair"></span><span class="head"></span><span class="body"></span><span class="belt"></span><span class="arm a1"></span><span class="arm a2"></span><span class="leg l1"></span><span class="leg l2"></span>${state.gender==='female'?'<span class="staff"></span>':'<span class="sword"></span>'}</div>`}
function renderHero(){heroSprite.innerHTML=heroMarkup()}

let typingTimer=null,typingToken=0;
function typeLine(text,done){clearInterval(typingTimer);const token=++typingToken;dialogText.textContent='';choices.innerHTML='';let i=0;typingTimer=setInterval(()=>{if(token!==typingToken)return clearInterval(typingTimer);dialogText.textContent+=text[i++]||'';if(i%3===0&&text[i-1]&&text[i-1]!=='\n')tone(175+((i%4)*18),.018,'square',.012);if(i>=text.length){clearInterval(typingTimer);done?.()}},16)}
function addChoices(items){choices.innerHTML='';items.forEach(({label,onClick})=>{const btn=document.createElement('button');btn.className='pixel-btn choice-btn';btn.textContent=label;btn.onclick=()=>{sfx('cursor');onClick()};choices.appendChild(btn)})}

function buildQueue(){const q=[];for(const item of baseQuestions){q.push(item);const b=branches[item.id];if(b&&b.when(state.answers[item.id]))q.push(b.q)}return q}
function nextQuestion(){
  const queue=buildQueue();
  const next=queue.find(q=>!state.asked.includes(q.id));
  if(!next)return finishDiagnosis();
  state.current=next;state.asked.push(next.id);state.step++;
  progress.textContent=`しつもん ${state.step}`;
  typeLine(next.text,()=>addChoices([{label:'はい',onClick:()=>answer(next.id,true)},{label:'いいえ',onClick:()=>answer(next.id,false)}]));
}
function answer(id,value){state.answers[id]=value;const reactions=value?['ほほう……。','なんと！ そう来たか。','ふむ。欲が見えてきたぞ。','よかろう。覚えておこう。']:['そうか……。','ふむ、そこは違うか。','なるほど。では次じゃ。','よかろう。'];if((id==='privacy'&&value)||(id==='quality'&&value)){game.classList.add('shake');setTimeout(()=>game.classList.remove('shake'),450);sfx('king')}else sfx(value?'ok':'no');typeLine(reactions[Math.floor(Math.random()*reactions.length)],()=>setTimeout(nextQuestion,260))}

function scoreAll(){const a=state.answers;const s={chatgpt:0,claude:0,gemini:0,perplexity:0,copilot:0,grok:0,local:0};
  if(a.budget){s.gemini+=2;s.perplexity+=2;s.grok+=1;s.local+=2}else{s.chatgpt+=2;s.claude+=2;s.copilot+=1}
  if(a.quality){s.chatgpt+=3;s.claude+=4;s.gemini+=2}else{s.grok+=1;s.gemini+=1}
  if(a.privacy){s.local+=5} else Object.keys(s).filter(k=>k!=='local').forEach(k=>s[k]+=1);
  if(a.setup)s.local+=5; else {s.chatgpt+=1;s.gemini+=1;s.copilot+=1}
  if(a.search){s.perplexity+=5;s.gemini+=3;s.grok+=3;s.chatgpt+=1}
  if(a.google)s.gemini+=6;
  if(a.microsoft)s.copilot+=6;
  if(a.coding){s.chatgpt+=4;s.claude+=3;s.gemini+=2}
  if(a.longform){s.claude+=5;s.chatgpt+=2}
  if(a.trends){s.grok+=5;s.perplexity+=2}
  if(a.freeTolerance){s.gemini+=2;s.perplexity+=1;s.grok+=1}
  if(a.specialist){s.claude+=2;s.perplexity+=2;s.local+=1}
  // Strong rule: privacy + setup means local, but scores still power runner-up display.
  if(a.privacy&&a.setup)s.local+=8;
  return s;
}
function getType(key,a){if(key==='local')return '秘密工房の魔導士型';if(key==='perplexity')return '探索特化の斥候型';if(key==='claude')return a.coding?'設計を詰める賢者型':'長文を読む賢者型';if(key==='gemini')return 'Google王国の騎士型';if(key==='copilot')return '実務ギルドの騎士型';if(key==='grok')return '情報酒場の遊撃手型';return a.coding?'万能剣士・開発者型':'王道オールラウンダー型'}
function diagnose(){const scores=scoreAll();const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);return{key:sorted[0][0],scores,sorted}}

function startDialog(){show('screen-dialog');renderHero();state.answers={};state.asked=[];state.step=0;const intro=`おお、勇者 ${state.name} よ。\nよくぞ まいった。\n\nAIせんごくじだいを 生きぬくには\nよき相棒が 必要じゃ。\nそなたの性分を 少しばかり見せてもらおう。`;typeLine(intro,()=>addChoices([{label:'こたえる',onClick:nextQuestion}]))}
function finishDiagnosis(){state.result=diagnose();const result=services[state.result.key];const finalText=`よし……見えたぞ、勇者 ${state.name} よ。\nそなたの旅に もっとも似合うAIは――`;typeLine(finalText,()=>addChoices([{label:'運命を見る',onClick:()=>showResult(result)}]))}
function showResult(result){show('screen-result');sfx('fanfare');document.getElementById('resultName').textContent=result.name;document.getElementById('resultTagline').textContent=result.tagline;document.getElementById('resultReason').textContent=result.reason;document.getElementById('heroType').textContent=getType(state.result.key,state.answers);const stats=document.getElementById('stats');stats.innerHTML='';Object.entries(result.stats).forEach(([label,value])=>{const row=document.createElement('div');row.className='stat-row';row.innerHTML=`<span>${label}</span><div class="stat-bar"><div class="stat-fill" style="width:${value*20}%"></div></div><span class="stat-value">${'★'.repeat(value)}</span>`;stats.appendChild(row)});const second=state.result.sorted.find(([k])=>k!==state.result.key);document.getElementById('runnerUp').textContent=second?`次点装備：${services[second[0]].name}　― 旅の目的によっては こちらも有力じゃ。`:'';document.getElementById('warpBtn').onclick=()=>{sfx('warp');game.classList.add('flash');setTimeout(()=>{window.location.href=result.url},720)}}

// controls
document.getElementById('soundBtn').onclick=e=>{state.sound=!state.sound;e.currentTarget.textContent=state.sound?'♪ ON':'♪ OFF';e.currentTarget.classList.toggle('off',!state.sound);if(state.sound){ensureAudio();sfx('ok')}};
document.getElementById('startBtn').onclick=()=>{ensureAudio();sfx('fanfare');show('screen-hero')};
document.querySelectorAll('.hero-card').forEach(btn=>{btn.onclick=()=>{state.gender=btn.dataset.gender;sfx('ok');show('screen-name');document.getElementById('nameInput').focus()}});
document.getElementById('nameBtn').onclick=()=>{state.name=(document.getElementById('nameInput').value||'ゆうしゃ').trim().slice(0,12)||'ゆうしゃ';sfx('ok');startDialog()};
document.getElementById('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('nameBtn').click()});
document.getElementById('restartBtn').onclick=()=>{sfx('ok');state.answers={};state.asked=[];state.step=0;state.name='ゆうしゃ';state.result=null;document.getElementById('nameInput').value='';show('screen-title')};
