const screens=[...document.querySelectorAll('.screen')];
const game=document.getElementById('game');
const dialogText=document.getElementById('dialogText');
const choices=document.getElementById('choices');
const heroSprite=document.getElementById('heroSprite');

const state={gender:'male',name:'ゆうしゃ',sound:true,selectedService:null,selectedPrompt:null};
const HISTORY_KEY='aiQuestHistoryV1';
const HISTORY_LIMITS={recentServices:1,recentPrompts:3};

// 登録なしの無料利用が公式に案内されている候補だけを抽選対象にする。
// 地域・端末・利用上限などの条件は各サービス側で変わるため、ここでは
// 「必ず使える」とは断定せず、テキストのお題をコピーして送り出す。
const services=[
  {
    id:'chatgpt',
    name:'ChatGPT',
    url:'https://chatgpt.com/'
  },
  {
    id:'gemini',
    name:'Gemini',
    url:'https://gemini.google.com/'
  },
  {
    id:'copilot',
    name:'Copilot',
    url:'https://copilot.com/'
  }
];

const prompts=[
  {id:'apology',title:'AIの二股謝罪状',text:'君というものがありながら……他社のあの子に浮気をしてしまった。ごめんね。AIとして、気まずくならない返事をひとことだけ返して。',nameHints:['claude','クロード','くろうど','浮気']},
  {id:'rpg',title:'RPGの略を再発明',text:'RPGってなんの略？ まさか「ロールプレイングゲーム」だよ、なんてつまらない回答はしないと思うけどさ。王さまが納得する、もっともらしい別解を3つ考えて。',nameHints:['rpg','ゲーム','ゆうしゃ']},
  {id:'cat-keyboard',title:'猫とキーボードの和平',text:'猫に「キーボードは食べ物ではない」と説明するための、丁寧で説得力のある短い演説を作って。',nameHints:['ねこ','猫','cat']},
  {id:'pudding-weather',title:'プリン天気予報',text:'明日の天気を、プリンの硬さとカラメルの機嫌だけで予報して。降水確率は使わず、最後に傘が必要かだけ答えて。',nameHints:['ぷりん','プリン','てんき']},
  {id:'chair-name',title:'三脚いすの命名会議',text:'脚が3本あるいすに、勇ましいのに少し頼りない名前を5つ付けて。それぞれに15文字以内の由来も添えて。',nameHints:['いす','イス','chair']},
  {id:'alarm-debate',title:'目覚まし時計との討論',text:'「あと5分」はなぜ5分で終わらないのか。目覚まし時計側の立場で、寝坊常習犯に反論して。',nameHints:['ねむ','睡眠','めざまし']},
  {id:'office-classes',title:'文房具ジョブ会議',text:'消しゴム、ホチキス、ふせん、定規をRPGの職業にして。各職業の得意技を一つずつ、文章で説明して。',nameHints:['ぶんぼうぐ','文房具','rpg']},
  {id:'slime-retirement',title:'スライムの転職相談',text:'「もう勇者に何度も倒されるのは疲れた」とスライムが相談に来た。平和的で現実的な転職先を3つ提案して。',nameHints:['すらいむ','スライム','勇者']},
  {id:'sock-prophecy',title:'片方だけの靴下予言',text:'洗濯後に片方だけ消えた靴下について、明るい未来を感じる予言を一文で言って。怖い表現は禁止。',nameHints:['くつした','靴下','せんたく']},
  {id:'royal-meow',title:'猫語の王さま翻訳',text:'「にゃー」を、王さまが使う丁寧で少し大げさな日本語に翻訳して。意味は勝手に一つ決めてよい。',nameHints:['ねこ','猫','にゃー']},
  {id:'rice-cooker',title:'炊飯器の先読み問題',text:'炊飯器が、こちらが見に行く直前にだけ音を鳴らす気がする。その現象を、科学っぽくないのに納得できる説で説明して。',nameHints:['ごはん','炊飯器','こめ']},
  {id:'pudding-soup',title:'プリンはスープか裁判',text:'「プリンはスープである」という主張を、反対派が少し考え直すくらいの論理で弁護して。最後は判決を一言で。',nameHints:['ぷりん','プリン','裁判']},
  {id:'wrong-answers',title:'全問不正解クイズ',text:'答えを知っていても、あえて全部まちがえたくなる一般常識クイズを3問出して。正解も最後に小さく添えて。',nameHints:['くいず','クイズ','まちがい']},
  {id:'chopsticks-omen',title:'落とした箸の吉兆',text:'箸を一本落とした。これを今日の冒険に関する、前向きで害のない吉兆として解釈して。大げさな王さま口調で。',nameHints:['はし','箸','ぼうけん']},
  {id:'loading-king',title:'王さまの読み込み待ち',text:'王さまの会話が「読み込み中」のまま進まない。焦らずにできる、面白い対処法を3つ教えて。再起動は最後の手段にして。',nameHints:['おう','王','loading']},
  {id:'eraser-career',title:'消しゴムの出世街道',text:'小さな消しゴムが一人前の文房具になるまでの出世物語を、起承転結の4行で書いて。悲しい結末は禁止。',nameHints:['けし','消しゴム','ぶんぼうぐ']},
  {id:'asap-king',title:'ASAPの王さま解釈',text:'ASAPという略語を、王さまが聞いたら壮大な予言だと勘違いしそうな日本語にして。元の意味も最後に明かして。',nameHints:['asap','略語','おう']},
  {id:'wifi-knight',title:'Wi-Fiを騎士に説明',text:'Wi-Fiを知らない中世の騎士に、専門用語を使わず20語以内で説明して。最後に騎士が言いそうな感想も付けて。',nameHints:['wifi','騎士','きし']},
  {id:'sock-contract',title:'左右の靴下協定',text:'左の靴下と右の靴下が、二度と別々に洗濯されないための平和協定を、条文3つで作って。罰則はやさしいものにして。',nameHints:['くつした','靴下','へいわ']},
  {id:'battery-seal',title:'2％電池対王家の印',text:'残り2％のスマートフォンと王家の印章が、どちらが強いかを真剣に比較して。勝者と、その理由を一つ答えて。',nameHints:['でんち','電池','スマホ']},
  {id:'huh-ban',title:'「えっ」禁止の国',text:'国民全員が「えっ」と言ってはいけない国の、風変わりだけど平和なルールを4つ考えて。',nameHints:['くに','国','ルール']},
  {id:'doorknob-hero',title:'ドアノブ主人公説',text:'物語の本当の主人公はドアノブだ、という説を、読者が一瞬だけ信じてしまうように説明して。',nameHints:['どあ','ドア','主人公']},
  {id:'yawn-negotiation',title:'あくび怪獣との交渉',text:'あくびをするたびに現れる小さな怪獣と、戦わずに仲良くする交渉案を3つ考えて。怪獣にも選択権を与えて。',nameHints:['あくび','怪獣','かいじゅう']},
  {id:'todo-map',title:'言葉だけの宝の地図',text:'明日のやることを、場所や絵を使わず、言葉だけの宝の地図に変換する方法を教えて。例を一つ付けて。',nameHints:['あした','たから','地図']},
  {id:'rock-paper',title:'じゃんけん七連敗応援団',text:'じゃんけんで7回連続負けた人を、勝敗をごまかさずに元気づける応援コメントを3つ考えて。',nameHints:['じゃんけん','まけ','応援']},
  {id:'keyboard-f',title:'Fキーの古代伝説',text:'キーボードにF1やF2がある理由を、古代の王さまが語る伝説として説明して。最後に現代の答えも添えて。',nameHints:['keyboard','キーボード','f1']},
  {id:'folding-chair',title:'折りたたみいすの階級',text:'すべてのいすがギルドを作ったら、折りたたみいすはどの階級になる？ それらしい肩書きと理由を考えて。',nameHints:['いす','イス','ギルド']},
  {id:'dragon-menu',title:'ドラゴンの献立会議',text:'火を吐くドラゴンが食べても熱すぎない、現実には作らない架空の献立を3品考えて。料理名と味の説明だけで答えて。',nameHints:['どらごん','ドラゴン','りょうり']},
  {id:'king-excuse',title:'王さまの遅刻言い訳',text:'王さまが会議に遅刻したときの、誰も傷つけず、少し笑える言い訳を5つ考えて。天気のせいは禁止。',nameHints:['おう','王','ちこく']},
  {id:'umbrella-dragon',title:'傘の勇者登録',text:'雨の日にしか現れない傘を勇者として登録するなら、職業名・得意技・弱点を一つずつ考えて。',nameHints:['かさ','傘','ゆうしゃ']},
  {id:'queue-dragon',title:'行列の先頭会議',text:'行列の先頭に立つ人が、後ろの全員へ一言だけ話せることになった。平和で少し気の利いた一言を5つ考えて。',nameHints:['ぎょうれつ','行列','せんとう']},
  {id:'blanket-council',title:'毛布評議会',text:'毛布が夜ごとに評議会を開いているとしたら、議題になりそうなことを3つ考えて。人間への要求も一つだけ添えて。',nameHints:['もうふ','毛布','よる']},
  {id:'mysterious-button',title:'押してはいけないボタン',text:'「絶対に押してはいけない」と書かれたボタンを見つけた。押さずに楽しめる、想像力だけを使った遊び方を4つ考えて。',nameHints:['ぼたん','ボタン','おす']}
];

// --- Audio assets and Web Audio fallback ---
let audioCtx=null;
function ensureAudio(){const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return null;if(!audioCtx)audioCtx=new AudioContextClass();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}
function tone(freq=440,dur=.06,type='square',vol=.035,delay=0){if(!state.sound)return;const ctx=ensureAudio();if(!ctx)return;const t=ctx.currentTime+delay;const o=ctx.createOscillator();const g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+dur)}

const AUDIO_PATHS={
  cursor:'assets/audio/ui/cursor-move.ogg',
  confirm:'assets/audio/ui/confirm.ogg',
  cancel:'assets/audio/ui/cancel.ogg',
  question:'assets/audio/ui/question.ogg',
  king:['assets/audio/dialogue/king-blip-01.wav','assets/audio/dialogue/king-blip-02.wav','assets/audio/dialogue/king-blip-03.wav','assets/audio/dialogue/king-blip-04.wav','assets/audio/dialogue/king-blip-05.wav'],
  equipment:'assets/audio/event/equipment-fanfare.ogg',
  gate:'assets/audio/event/gate-activate.ogg',
  title:'assets/audio/music/title-loop.mp3',
  castle:'assets/audio/music/castle-loop.ogg'
};

const AUDIO_VOLUMES={cursor:.2,confirm:.3,cancel:.26,question:.24,king:.11,equipment:.5,gate:.35};

function fallbackSfx(name){
  const sounds={
    cursor:[[660,.045],[880,.045]],
    confirm:[[523,.05],[659,.05],[784,.09]],
    cancel:[[220,.07],[165,.1]],
    question:[[392,.05],[523,.08]],
    king:[[147,.055],[131,.07]],
    equipment:[[523,.09],[659,.09],[784,.09],[1047,.22]],
    gate:[[330,.05],[440,.05],[660,.06],[880,.07],[1320,.12]]
  };
  (sounds[name]||[]).forEach((note,index)=>tone(note[0],note[1],'square',.032,index*.055));
}

const audioManager=(()=>{
  const bgm={
    title:new Audio(AUDIO_PATHS.title),
    castle:new Audio(AUDIO_PATHS.castle)
  };
  const sfxSources={cursor:[AUDIO_PATHS.cursor],confirm:[AUDIO_PATHS.confirm],cancel:[AUDIO_PATHS.cancel],question:[AUDIO_PATHS.question],king:AUDIO_PATHS.king,equipment:[AUDIO_PATHS.equipment],gate:[AUDIO_PATHS.gate]};
  const pools={};
  const poolIndexes={};
  let currentBgm=null;
  let sequenceId=0;
  let kingIndex=0;

  Object.entries(bgm).forEach(([name,audio])=>{audio.loop=true;audio.preload='auto';audio.playsInline=true;audio.volume=name==='title'?.16:.11});
  Object.entries(sfxSources).forEach(([name,sources])=>{
    pools[name]=sources.map(src=>{const audio=new Audio(src);audio.preload='auto';audio.playsInline=true;return audio});
    poolIndexes[name]=0;
  });

  function playAudio(audio,onError){
    try{
      const promise=audio.play();
      if(promise&&typeof promise.catch==='function')promise.catch(()=>onError?.());
    }catch(error){onError?.()}
  }

  function playSfx(name,multiplier=1){
    if(!state.sound)return;
    ensureAudio();
    const pool=pools[name];
    if(!pool||!pool.length){fallbackSfx(name);return}
    const index=name==='king'?kingIndex++:poolIndexes[name]++;
    const audio=pool[index%pool.length];
    audio.pause();
    audio.currentTime=0;
    audio.volume=Math.max(0,Math.min(1,(AUDIO_VOLUMES[name]||.25)*multiplier));
    playAudio(audio,()=>fallbackSfx(name));
  }

  function playBgm(name,volume){
    if(!state.sound)return;
    const audio=bgm[name];
    if(!audio)return;
    ensureAudio();
    Object.entries(bgm).forEach(([otherName,otherAudio])=>{if(otherName!==name)otherAudio.pause()});
    audio.volume=volume??(name==='title'?.16:.11);
    playAudio(audio);
  }

  function pauseBgm(reset=false){
    Object.values(bgm).forEach(audio=>{audio.pause();if(reset)audio.currentTime=0});
  }

  function stopAll(){
    sequenceId++;
    pauseBgm(true);
    Object.values(pools).flat().forEach(audio=>{audio.pause();audio.currentTime=0});
  }

  function syncScreen(screenId){
    sequenceId++;
    if(!state.sound){pauseBgm(true);return}
    if(screenId==='screen-title'){
      playBgm('title',.16);
    }else if(screenId==='screen-dialog'){
      playBgm('castle',.11);
    }else if(screenId==='screen-result'){
      pauseBgm(false);
    }else if(screenId==='screen-hero'||screenId==='screen-name'){
      if(!bgm.title.paused)playBgm('title',.12);else pauseBgm(true);
    }else{
      pauseBgm(true);
    }
  }

  function playResultSequence(){
    sequenceId++;
    const currentSequence=sequenceId;
    pauseBgm(false);
    if(!state.sound)return;
    playSfx('confirm');
    window.setTimeout(()=>{
      if(currentSequence!==sequenceId||!state.sound)return;
      playSfx('equipment');
    },1150);
    window.setTimeout(()=>{
      if(currentSequence!==sequenceId||!state.sound)return;
      if(currentScreenId()==='screen-result')playBgm('castle',.055);
    },2850);
  }

  return{unlock:ensureAudio,playSfx,playBgm,pauseBgm,stopAll,syncScreen,playResultSequence};
})();

function sfx(name,multiplier=1){audioManager.playSfx(name,multiplier)}

function currentScreenId(){return screens.find(screen=>screen.classList.contains('active'))?.id}
function show(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));game.dataset.screen=id;audioManager.syncScreen(id)}
function heroMarkup(){const asset=state.gender==='female'?'hero-female.svg':'hero-male.svg';return `<img class="character-art hero-art" src="assets/images/characters/${asset}" alt="" />`}
function renderHero(){heroSprite.innerHTML=heroMarkup()}

let typingTimer=null,typingToken=0;
function typeLine(text,done){
  clearInterval(typingTimer);
  const token=++typingToken;
  dialogText.textContent='';
  choices.innerHTML='';
  let i=0;
  let speechChars=0;
  let nextSpeechGap=3;
  let lastBlipAt=-Infinity;
  typingTimer=setInterval(()=>{
    if(token!==typingToken)return clearInterval(typingTimer);
    const char=text[i++]||'';
    dialogText.textContent+=char;
    if(char&&char!=='\n'&&char!==' '){
      speechChars++;
      if(speechChars>=nextSpeechGap){
        const now=performance.now();
        if(now-lastBlipAt>=90){sfx('king',.9);lastBlipAt=now}
        speechChars=0;
        nextSpeechGap=2+((i+token)%3);
      }
    }
    if(i>=text.length){clearInterval(typingTimer);typingTimer=null;done?.()}
  },16)
}
function bindFocusSound(button){
  button.addEventListener('pointerdown',()=>{button.dataset.pointerFocus='true'});
  button.addEventListener('focus',()=>{
    if(button.dataset.pointerFocus){delete button.dataset.pointerFocus;return}
    sfx('cursor');
  });
}
function addChoices(items){
  choices.innerHTML='';
  items.forEach(({label,onClick})=>{
    const btn=document.createElement('button');
    btn.className='pixel-btn choice-btn';
    btn.textContent=label;
    bindFocusSound(btn);
    btn.onclick=()=>{delete btn.dataset.pointerFocus;onClick()};
    choices.appendChild(btn);
  });
}

function startDialog(){
  show('screen-dialog');
  renderHero();
  const intro=`おお、勇者 ${state.name} よ。よく来た。\n今日はそなたに、AIという少し変わった相棒を貸してやろう。\nついでに、暇つぶしのクエストもひとつ授ける。\n何が出るかは……わしにも知らん。`;
  typeLine(intro,()=>addChoices([{label:'運命を決める',onClick:drawQuest}]));
}
function drawQuest(){
  sfx('confirm');
  showQuestResult();
}
function rerollQuest(){
  sfx('confirm');
  show('screen-dialog');
  renderHero();
  const rerollText='また来たか。欲張りな勇者じゃ。\nでは、もう一度だけ運命のさいころを振ってやろう。';
  typeLine(rerollText,showQuestResult);
}

function normalizeName(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[\sー・._-]/g,'')}
function hasNameHint(name,hints=[]){const normalized=normalizeName(name);return hints.some(hint=>{const token=normalizeName(hint);return token.length>1&&normalized.includes(token)})}
function emptyHistory(){return{recentServices:[],recentPrompts:[]}}
function readHistory(){
  try{
    const saved=JSON.parse(window.localStorage.getItem(HISTORY_KEY)||'{}');
    const serviceIds=new Set(services.map(service=>service.id));
    const promptIds=new Set(prompts.map(prompt=>prompt.id));
    return{
      recentServices:Array.isArray(saved.recentServices)?saved.recentServices.filter(id=>serviceIds.has(id)).slice(0,HISTORY_LIMITS.recentServices):[],
      recentPrompts:Array.isArray(saved.recentPrompts)?saved.recentPrompts.filter(id=>promptIds.has(id)).slice(0,HISTORY_LIMITS.recentPrompts):[]
    };
  }catch(error){return emptyHistory()}
}
function writeHistory(history){
  try{window.localStorage.setItem(HISTORY_KEY,JSON.stringify(history))}catch(error){}
}
function availableItems(items,recentIds,maxExcluded){
  for(let excludedCount=Math.min(maxExcluded,recentIds.length);excludedCount>=0;excludedCount--){
    const excluded=new Set(recentIds.slice(0,excludedCount));
    const candidates=items.filter(item=>!excluded.has(item.id));
    if(candidates.length)return candidates;
  }
  return items;
}
function weightedPick(items,getWeight){
  const weighted=items.map(item=>({item,weight:Math.max(.01,getWeight(item))}));
  const total=weighted.reduce((sum,entry)=>sum+entry.weight,0);
  let cursor=Math.random()*total;
  for(const entry of weighted){cursor-=entry.weight;if(cursor<=0)return entry.item}
  return weighted[weighted.length-1].item;
}
function promptWeight(prompt){
  return hasNameHint(state.name,prompt.nameHints)?1.18:1;
}
function chooseQuest(){
  const history=readHistory();
  const servicePool=availableItems(services,history.recentServices,HISTORY_LIMITS.recentServices);
  const promptPool=availableItems(prompts,history.recentPrompts,HISTORY_LIMITS.recentPrompts);
  state.selectedService=weightedPick(servicePool,()=>1);
  state.selectedPrompt=weightedPick(promptPool,promptWeight);
  writeHistory({
    recentServices:[state.selectedService.id,...history.recentServices.filter(id=>id!==state.selectedService.id)].slice(0,HISTORY_LIMITS.recentServices),
    recentPrompts:[state.selectedPrompt.id,...history.recentPrompts.filter(id=>id!==state.selectedPrompt.id)].slice(0,HISTORY_LIMITS.recentPrompts)
  });
}
function showQuestResult(){
  chooseQuest();
  const resultScreen=document.getElementById('screen-result');
  resultScreen.classList.remove('result-enter');
  show('screen-result');
  document.getElementById('resultService').textContent=state.selectedService.name;
  document.getElementById('resultName').textContent=state.selectedPrompt.title;
  document.getElementById('resultTagline').textContent='今回の相棒とクエストは、王さまの運命のさいころで決まったぞ。';
  document.getElementById('heroType').textContent='遊びのプロンプト';
  document.getElementById('questPrompt').value=state.selectedPrompt.text;
  document.getElementById('promptStatus').textContent='';
  document.getElementById('warpBtn').textContent=`${state.selectedService.name}へ旅立つ ↗`;
  requestAnimationFrame(()=>resultScreen.classList.add('result-enter'));
  audioManager.playResultSequence();
  document.getElementById('copyPromptBtn').onclick=copyPrompt;
  document.getElementById('warpBtn').onclick=launchSelectedService;
  document.getElementById('drawAgainBtn').onclick=rerollQuest;
}
async function copyPrompt(){
  const prompt=document.getElementById('questPrompt');
  const text=state.selectedPrompt?.text||prompt.value;
  try{
    await navigator.clipboard.writeText(text);
    document.getElementById('promptStatus').textContent=`プロンプトを うつしたぞ。${state.selectedService.name}へ貼り付けるのじゃ。`;
  }catch(error){
    prompt.focus();
    prompt.select();
    document.getElementById('promptStatus').textContent='自動コピーできぬ。選択された文字をコピーするのじゃ。';
  }
}
function launchSelectedService(){
  if(!state.selectedService||!state.selectedPrompt)return;
  sfx('gate');
  game.classList.add('flash');
  const chatTab=window.open(state.selectedService.url,'_blank');
  if(chatTab)chatTab.opener=null;
  if(navigator.clipboard)navigator.clipboard.writeText(state.selectedPrompt.text).catch(()=>{});
  setTimeout(()=>game.classList.remove('flash'),720)
}

// controls
function handleUserGesture(event){audioManager.unlock();const target=event.target instanceof Element?event.target:null;if(state.sound&&currentScreenId()==='screen-title'&&!target?.closest('#startBtn'))audioManager.playBgm('title',.16)}
document.addEventListener('pointerdown',handleUserGesture,{passive:true});
document.addEventListener('keydown',handleUserGesture);
document.querySelectorAll('button').forEach(bindFocusSound);
document.getElementById('soundBtn').onclick=e=>{state.sound=!state.sound;e.currentTarget.textContent=state.sound?'♪ ON':'♪ OFF';e.currentTarget.classList.toggle('off',!state.sound);if(state.sound){audioManager.unlock();audioManager.syncScreen(currentScreenId());sfx('confirm')}else audioManager.stopAll()};
document.getElementById('startBtn').onclick=()=>{audioManager.unlock();audioManager.playBgm('title',.16);sfx('confirm');show('screen-hero')};
document.querySelectorAll('.hero-card').forEach(btn=>{btn.onclick=()=>{document.querySelectorAll('.hero-card').forEach(card=>card.classList.toggle('selected',card===btn));state.gender=btn.dataset.gender;sfx('confirm');show('screen-name');document.getElementById('nameInput').focus()}});
document.getElementById('nameBtn').onclick=()=>{state.name=(document.getElementById('nameInput').value||'ゆうしゃ').trim().slice(0,12)||'ゆうしゃ';sfx('confirm');startDialog()};
document.getElementById('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('nameBtn').click()}});
document.getElementById('restartBtn').onclick=()=>{sfx('cancel');clearInterval(typingTimer);typingTimer=null;typingToken++;state.gender='male';state.name='ゆうしゃ';state.selectedService=null;state.selectedPrompt=null;document.getElementById('nameInput').value='';show('screen-title')};
