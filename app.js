const screens=[...document.querySelectorAll('.screen')];
const game=document.getElementById('game');
const dialogText=document.getElementById('dialogText');
const choices=document.getElementById('choices');
const heroSprite=document.getElementById('heroSprite');
const progress=document.getElementById('progress');

const state={gender:'male',name:'ゆうしゃ',answers:{},asked:[],step:0,sound:true};

const QUEST_PROMPT='右、右、下、右、上、左、上、右、下と進んだら、最初の場所から何マス、どの方向にいる？';
const CHATGPT_URL='https://chatgpt.com/';

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

const baseQuestions=[{id:'ready',text:'勇者よ。\nAIで ちょっと遊んでみるか？'}];

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
    if(i>=text.length){clearInterval(typingTimer);done?.()}
  },16)
}
function addChoices(items){choices.innerHTML='';items.forEach(({label,onClick})=>{const btn=document.createElement('button');btn.className='pixel-btn choice-btn';btn.textContent=label;btn.onclick=()=>{sfx('cursor');onClick()};choices.appendChild(btn)})}

function buildQueue(){return baseQuestions}
function nextQuestion(){
  const queue=buildQueue();
  const next=queue.find(q=>!state.asked.includes(q.id));
  if(!next)return finishQuest();
  state.current=next;state.asked.push(next.id);state.step++;
  progress.textContent=`しつもん ${state.step}`;
  sfx('question');
  typeLine(next.text,()=>addChoices([{label:'はい',onClick:()=>answer(next.id,true)},{label:'いいえ',onClick:()=>answer(next.id,false)}]));
}
function answer(id,value){state.answers[id]=value;const reaction=value?'ほほう！ その気じゃな。':'ふむ……まずは 見てみるだけでもよい。';sfx(value?'confirm':'cancel');typeLine(reaction,()=>setTimeout(nextQuestion,260))}

function startDialog(){show('screen-dialog');renderHero();state.answers={};state.asked=[];state.step=0;const intro=`おお、勇者 ${state.name} よ。\n今日は AIで ひと遊びじゃ。\n準備は よいか？`;typeLine(intro,()=>addChoices([{label:'はい、遊ぶ',onClick:nextQuestion}]))}
function finishQuest(){const finalText=`よし、遊びのお題を 授けよう。\nこのプロンプトを持って ChatGPTへ行くのじゃ。`;typeLine(finalText,()=>addChoices([{label:'お題を受け取る',onClick:showQuestResult}]))}
function showQuestResult(){const resultScreen=document.getElementById('screen-result');resultScreen.classList.remove('result-enter');show('screen-result');document.getElementById('resultName').textContent='方向感覚の迷宮';document.getElementById('resultTagline').textContent='AIがどう答えるか、そなたの目で確かめるのじゃ。';document.getElementById('heroType').textContent='遊びのプロンプト';document.getElementById('questPrompt').value=QUEST_PROMPT;document.getElementById('promptStatus').textContent='';requestAnimationFrame(()=>resultScreen.classList.add('result-enter'));audioManager.playResultSequence();document.getElementById('copyPromptBtn').onclick=copyPrompt;document.getElementById('warpBtn').onclick=launchChatGPT}
async function copyPrompt(){const prompt=document.getElementById('questPrompt');try{await navigator.clipboard.writeText(QUEST_PROMPT);document.getElementById('promptStatus').textContent='プロンプトを うつしたぞ。ChatGPTへ貼り付けるのじゃ。'}catch(error){prompt.focus();prompt.select();document.getElementById('promptStatus').textContent='自動コピーできぬ。選択された文字をコピーするのじゃ。'}}
function launchChatGPT(){sfx('gate');game.classList.add('flash');const chatTab=window.open(CHATGPT_URL,'_blank');if(chatTab)chatTab.opener=null;if(navigator.clipboard)navigator.clipboard.writeText(QUEST_PROMPT).catch(()=>{});setTimeout(()=>game.classList.remove('flash'),720)}

// controls
function handleUserGesture(event){audioManager.unlock();const target=event.target instanceof Element?event.target:null;if(state.sound&&currentScreenId()==='screen-title'&&!target?.closest('#startBtn'))audioManager.playBgm('title',.16)}
document.addEventListener('pointerdown',handleUserGesture,{passive:true});
document.addEventListener('keydown',handleUserGesture);
document.getElementById('soundBtn').onclick=e=>{state.sound=!state.sound;e.currentTarget.textContent=state.sound?'♪ ON':'♪ OFF';e.currentTarget.classList.toggle('off',!state.sound);if(state.sound){audioManager.unlock();audioManager.syncScreen(currentScreenId());sfx('confirm')}else audioManager.stopAll()};
document.getElementById('startBtn').onclick=()=>{audioManager.unlock();audioManager.playBgm('title',.16);sfx('confirm');show('screen-hero')};
document.querySelectorAll('.hero-card').forEach(btn=>{btn.onclick=()=>{document.querySelectorAll('.hero-card').forEach(card=>card.classList.toggle('selected',card===btn));state.gender=btn.dataset.gender;sfx('confirm');show('screen-name');document.getElementById('nameInput').focus()}});
document.getElementById('nameBtn').onclick=()=>{state.name=(document.getElementById('nameInput').value||'ゆうしゃ').trim().slice(0,12)||'ゆうしゃ';sfx('confirm');startDialog()};
document.getElementById('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('nameBtn').click()});
document.getElementById('restartBtn').onclick=()=>{sfx('confirm');state.answers={};state.asked=[];state.step=0;state.name='ゆうしゃ';document.getElementById('nameInput').value='';show('screen-title')};
