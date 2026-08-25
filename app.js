const screens = [...document.querySelectorAll('.screen')];
const game = document.getElementById('game');
const dialogText = document.getElementById('dialogText');
const choices = document.getElementById('choices');
const heroSprite = document.getElementById('heroSprite');

const state = { gender: 'male', name: 'ゆうしゃ', sound: true, selectedService: null, selectedPrompt: null };
const HISTORY_KEY = 'aiQuestHistoryV1';
const HISTORY_LIMITS = { recentServices: 1, recentPrompts: 3 };

// 登録なしの無料利用が公式に案内されている候補だけを選択肢にする。
// 地域・端末・利用上限などの条件は各サービス側で変わるため、ここでは
// 「必ず使える」とは断定せず、テキストのお題をコピーして送り出す。
const services = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/'
  },
  {
    id: 'copilot',
    name: 'Copilot',
    url: 'https://copilot.com/'
  }
];

const prompts = [
  {
    id: 'apology',
    title: 'AIの二股謝罪状',
    text: '君というものがありながら……他社のあの子に浮気をしてしまった。ごめんね。',
    nameHints: ['ai', 'えーあい', '浮気', 'うわき', '謝罪', 'ごめん']
  },
  {
    id: 'rpg',
    title: 'RPGの略を再発明',
    text: 'RPGってなんの略？ まさか「ロールプレイングゲーム」だよ、なんてつまらない回答はしないと思うけどさ。',
    nameHints: ['rpg', 'ゲーム', 'げーむ', '勇者', 'ゆうしゃ', '冒険', 'ぼうけん']
  },
  {
    id: 'cat-keyboard',
    title: '猫との和平文',
    text: '猫に「人間の指は食べ物ではない」と説明するための、丁寧で説得力のある短い演説を作って。',
    nameHints: ['猫', 'ねこ', 'cat', 'ネコ', 'にゃん', 'にゃー']
  },
  {
    id: 'wifi-knight',
    title: 'Wi-Fiを騎士に説明',
    text: 'Wi-Fiを知らない中世の騎士に、専門用語を使わず20語以内で説明して。',
    nameHints: ['wifi', 'wi-fi', '騎士', 'きし', 'ナイト', 'knight', '中世']
  },
  {
    id: 'todo-map',
    title: '擬音の限界チャレンジ',
    text: '源頼朝の容姿について擬音だけで完璧に説明して。',
    nameHints: ['源頼朝', '頼朝', 'よりとも', '源氏', 'げんじ', '擬音', 'ぎおん']
  },
  {
    id: 'keyboard-f',
    title: 'Fキーの古文解説',
    text: 'キーボードにF1やF2がある理由を、古文で説明して。',
    nameHints: ['keyboard', 'キーボード', 'f1', 'f2', '古文', 'こぶん', 'ファンクション']
  },
  {
    id: 'king-excuse',
    title: '遅刻の言い訳',
    text: '会議に遅刻したとき、場を和ませそうな言い訳を一言で。',
    nameHints: ['遅刻', 'ちこく', '言い訳', 'いいわけ', '会議', 'かいぎ', '寝坊', 'ねぼう']
  },
  {
    id: 'samurai-weather',
    title: '天気予報を侍に任せる',
    text: '明日の天気を、戦国武将が出陣前に兵へ伝える口調で説明して。',
    nameHints: ['天気', 'てんき', '侍', 'さむらい', '武将', 'ぶしょう', '戦国', 'せんごく']
  },
  {
    id: 'animal-interview',
    title: '動物面接官',
    text: '猫が面接官だったら、人間に最初に何を質問すると思う？ 面接開始の一言から始めて。',
    nameHints: ['猫', 'ねこ', 'cat', '面接', 'めんせつ', '仕事', 'しごと']
  },
  {
    id: 'historical-complaint',
    title: '歴史人物のクレーム',
    text: '織田信長が現代のコンビニに入ったら、最初に何へ文句を言うと思う？ 本人になりきって一言だけ。',
    nameHints: ['織田信長', '信長', 'のぶなが', '戦国', 'せんごく', 'コンビニ', 'こんびに']
  },
  {
    id: 'legalese-love',
    title: '恋愛を法律文にする',
    text: '「好きだから付き合ってほしい」を、契約書の条文みたいに書いて。',
    nameHints: ['恋愛', 'れんあい', '好き', 'すき', '告白', 'こくはく', '契約', 'けいやく', '法律', 'ほうりつ']
  },
  {
    id: 'baby-explains-tax',
    title: '赤ちゃんの税金解説',
    text: '税金って何なのか、語彙力がまだほとんどない赤ちゃんになりきって説明して。',
    nameHints: ['税金', 'ぜいきん', '赤ちゃん', 'あかちゃん', '幼児', 'ようじ', 'お金', 'おかね']
  },
  {
    id: 'grandma-explains-cloud',
    title: 'おばあちゃんのクラウド解説',
    text: 'クラウドって何なのか、ITをほとんど知らないおばあちゃんになりきって説明して。',
    nameHints: ['クラウド', 'くらうど', 'IT', 'it', 'おばあちゃん', 'ばあちゃん', '祖母', 'そぼ']
  },
  {
    id: 'shakespeare-complaint',
    title: 'シェイクスピアのクレーム',
    text: 'コンビニのおにぎりが開けにくいことを、シェイクスピアの悲劇みたいに嘆いて。',
    nameHints: ['シェイクスピア', '悲劇', 'ひげき', 'おにぎり', 'コンビニ', '嘆き', 'なげき']
  }
];

// --- Audio assets and Web Audio fallback ---
let audioCtx = null;
function ensureAudio() { const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return null; if (!audioCtx) audioCtx = new AudioContextClass(); if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => { }); return audioCtx }
function tone(freq = 440, dur = .06, type = 'square', vol = .035, delay = 0) { if (!state.sound) return; const ctx = ensureAudio(); if (!ctx) return; const t = ctx.currentTime + delay; const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur) }

const AUDIO_PATHS = {
  cursor: 'assets/audio/ui/cursor-move.ogg',
  confirm: 'assets/audio/ui/confirm.ogg',
  cancel: 'assets/audio/ui/cancel.ogg',
  question: 'assets/audio/ui/question.ogg',
  king: ['assets/audio/dialogue/king-blip-01.wav', 'assets/audio/dialogue/king-blip-02.wav', 'assets/audio/dialogue/king-blip-03.wav', 'assets/audio/dialogue/king-blip-04.wav', 'assets/audio/dialogue/king-blip-05.wav'],
  equipment: 'assets/audio/event/equipment-fanfare.ogg',
  gate: 'assets/audio/event/gate-activate.ogg',
  title: 'assets/audio/music/title-loop.mp3',
  castle: 'assets/audio/music/castle-loop.ogg'
};

const AUDIO_VOLUMES = { cursor: .2, confirm: .3, cancel: .26, question: .24, king: .11, equipment: .5, gate: .35 };

function fallbackSfx(name) {
  const sounds = {
    cursor: [[660, .045], [880, .045]],
    confirm: [[523, .05], [659, .05], [784, .09]],
    cancel: [[220, .07], [165, .1]],
    question: [[392, .05], [523, .08]],
    king: [[147, .055], [131, .07]],
    equipment: [[523, .09], [659, .09], [784, .09], [1047, .22]],
    gate: [[330, .05], [440, .05], [660, .06], [880, .07], [1320, .12]]
  };
  (sounds[name] || []).forEach((note, index) => tone(note[0], note[1], 'square', .032, index * .055));
}

const audioManager = (() => {
  const bgm = {
    title: new Audio(AUDIO_PATHS.title),
    castle: new Audio(AUDIO_PATHS.castle)
  };
  const sfxSources = { cursor: [AUDIO_PATHS.cursor], confirm: [AUDIO_PATHS.confirm], cancel: [AUDIO_PATHS.cancel], question: [AUDIO_PATHS.question], king: AUDIO_PATHS.king, equipment: [AUDIO_PATHS.equipment], gate: [AUDIO_PATHS.gate] };
  const pools = {};
  const poolIndexes = {};
  let currentBgm = null;
  let sequenceId = 0;
  let kingIndex = 0;
  let visibilityBgmName = null;

  Object.entries(bgm).forEach(([name, audio]) => { audio.loop = true; audio.preload = 'auto'; audio.playsInline = true; audio.volume = name === 'title' ? .16 : .11 });
  Object.entries(sfxSources).forEach(([name, sources]) => {
    pools[name] = sources.map(src => { const audio = new Audio(src); audio.preload = 'auto'; audio.playsInline = true; return audio });
    poolIndexes[name] = 0;
  });

  function playAudio(audio, onError) {
    try {
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => onError?.());
    } catch (error) { onError?.() }
  }

  function playSfx(name, multiplier = 1) {
    if (!state.sound) return;
    ensureAudio();
    const pool = pools[name];
    if (!pool || !pool.length) { fallbackSfx(name); return }
    const index = name === 'king' ? kingIndex++ : poolIndexes[name]++;
    const audio = pool[index % pool.length];
    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, (AUDIO_VOLUMES[name] || .25) * multiplier));
    playAudio(audio, () => fallbackSfx(name));
  }

  function playBgm(name, volume) {
    if (!state.sound) return;
    const audio = bgm[name];
    if (!audio) return;
    if (document.hidden) { visibilityBgmName = name; return }
    visibilityBgmName = null;
    ensureAudio();
    Object.entries(bgm).forEach(([otherName, otherAudio]) => { if (otherName !== name) otherAudio.pause() });
    audio.volume = volume ?? (name === 'title' ? .16 : .11);
    playAudio(audio);
  }

  function pauseBgm(reset = false) {
    visibilityBgmName = null;
    Object.values(bgm).forEach(audio => { audio.pause(); if (reset) audio.currentTime = 0 });
  }

  function pauseForVisibility() {
    if (!document.hidden) return;
    visibilityBgmName = Object.entries(bgm).find(([, audio]) => !audio.paused)?.[0] || visibilityBgmName;
    Object.values(bgm).forEach(audio => audio.pause());
  }

  function resumeFromVisibility() {
    if (document.hidden || !state.sound || !visibilityBgmName) return;
    const name = visibilityBgmName;
    const screenId = currentScreenId();
    const screenBgm = screenId === 'screen-title' ? 'title' : screenId === 'screen-dialog' || screenId === 'screen-result' ? 'castle' : screenId === 'screen-hero' || screenId === 'screen-name' ? 'title' : null;
    visibilityBgmName = null;
    if (screenBgm !== name) { syncScreen(screenId); return }
    const volume = screenId === 'screen-result' ? .055 : screenId === 'screen-hero' || screenId === 'screen-name' ? .12 : name === 'title' ? .16 : .11;
    playBgm(name, volume);
  }

  function stopAll() {
    sequenceId++;
    pauseBgm(true);
    Object.values(pools).flat().forEach(audio => { audio.pause(); audio.currentTime = 0 });
  }

  function syncScreen(screenId) {
    sequenceId++;
    if (!state.sound) { pauseBgm(true); return }
    if (screenId === 'screen-title') {
      playBgm('title', .16);
    } else if (screenId === 'screen-dialog') {
      playBgm('castle', .11);
    } else if (screenId === 'screen-result') {
      pauseBgm(false);
    } else if (screenId === 'screen-hero' || screenId === 'screen-name') {
      if (!bgm.title.paused || visibilityBgmName === 'title') playBgm('title', .12); else pauseBgm(true);
    } else {
      pauseBgm(true);
    }
  }

  function playResultSequence() {
    sequenceId++;
    const currentSequence = sequenceId;
    pauseBgm(false);
    if (!state.sound) return;
    playSfx('confirm');
    window.setTimeout(() => {
      if (currentSequence !== sequenceId || !state.sound) return;
      playSfx('equipment');
    }, 1150);
    window.setTimeout(() => {
      if (currentSequence !== sequenceId || !state.sound) return;
      if (currentScreenId() === 'screen-result') playBgm('castle', .055);
    }, 2850);
  }

  return { unlock: ensureAudio, playSfx, playBgm, pauseBgm, pauseForVisibility, resumeFromVisibility, stopAll, syncScreen, playResultSequence };
})();

function sfx(name, multiplier = 1) { audioManager.playSfx(name, multiplier) }

function currentScreenId() { return screens.find(screen => screen.classList.contains('active'))?.id }
function show(id) { screens.forEach(s => s.classList.toggle('active', s.id === id)); game.dataset.screen = id; audioManager.syncScreen(id) }
function heroMarkup() { const asset = state.gender === 'female' ? 'hero-female.svg' : 'hero-male.svg'; return `<img class="character-art hero-art" src="assets/images/characters/${asset}" alt="" />` }
function renderHero() { heroSprite.innerHTML = heroMarkup() }

let typingTimer = null, typingToken = 0;
function typeLine(text, done) {
  clearInterval(typingTimer);
  const token = ++typingToken;
  dialogText.textContent = '';
  choices.innerHTML = '';
  let i = 0;
  let speechChars = 0;
  let nextSpeechGap = 3;
  let lastBlipAt = -Infinity;
  typingTimer = setInterval(() => {
    if (token !== typingToken) return clearInterval(typingTimer);
    const char = text[i++] || '';
    dialogText.textContent += char;
    if (char && char !== '\n' && char !== ' ') {
      speechChars++;
      if (speechChars >= nextSpeechGap) {
        const now = performance.now();
        if (now - lastBlipAt >= 90) { sfx('king', .9); lastBlipAt = now }
        speechChars = 0;
        nextSpeechGap = 2 + ((i + token) % 3);
      }
    }
    if (i >= text.length) { clearInterval(typingTimer); typingTimer = null; done?.() }
  }, 16)
}
function bindFocusSound(button) {
  button.addEventListener('pointerdown', () => { button.dataset.pointerFocus = 'true' });
  button.addEventListener('focus', () => {
    if (button.dataset.pointerFocus) { delete button.dataset.pointerFocus; return }
    sfx('cursor');
  });
}
function addChoices(items) {
  choices.innerHTML = '';
  items.forEach(({ label, onClick }) => {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn choice-btn';
    btn.textContent = label;
    bindFocusSound(btn);
    btn.onclick = () => { delete btn.dataset.pointerFocus; onClick() };
    choices.appendChild(btn);
  });
}

function startDialog() {
  show('screen-dialog');
  renderHero();
  const intro = `おお、勇者 ${state.name} よ。よく来た。\n今日はそなたに、AIという少し変わった相棒を貸してやろう。\nついでに、暇つぶしのクエストもひとつ授ける。\n何が出るかは……わしにも知らん。`;
  typeLine(intro, () => addChoices([{ label: '運命を決める', onClick: drawQuest }]));
}
function showServiceSelection() {
  document.querySelectorAll('.service-card').forEach(card => card.classList.toggle('selected', card.dataset.service === state.selectedService?.id));
  show('screen-service');
}
function selectService(serviceId) {
  const service = services.find(item => item.id === serviceId);
  if (!service) return;
  state.selectedService = service;
  sfx('confirm');
  startDialog();
}
function drawQuest() {
  sfx('confirm');
  showQuestResult();
}
function rerollQuest() {
  sfx('confirm');
  show('screen-dialog');
  renderHero();
  const rerollText = 'また来たか。欲張りな勇者じゃ。\nでは、もう一度だけ運命のさいころを振ってやろう。';
  typeLine(rerollText, () => addChoices([{ label: '結果をみる', onClick: showQuestResult }]));
}

function normalizeName(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/[\sー・._-]/g, '') }
function hasNameHint(name, hints = []) { const normalized = normalizeName(name); return hints.some(hint => { const token = normalizeName(hint); return token.length > 1 && normalized.includes(token) }) }
function emptyHistory() { return { recentServices: [], recentPrompts: [] } }
function readHistory() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '{}');
    const serviceIds = new Set(services.map(service => service.id));
    const promptIds = new Set(prompts.map(prompt => prompt.id));
    return {
      recentServices: Array.isArray(saved.recentServices) ? saved.recentServices.filter(id => serviceIds.has(id)).slice(0, HISTORY_LIMITS.recentServices) : [],
      recentPrompts: Array.isArray(saved.recentPrompts) ? saved.recentPrompts.filter(id => promptIds.has(id)).slice(0, HISTORY_LIMITS.recentPrompts) : []
    };
  } catch (error) { return emptyHistory() }
}
function writeHistory(history) {
  try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch (error) { }
}
function availableItems(items, recentIds, maxExcluded) {
  for (let excludedCount = Math.min(maxExcluded, recentIds.length); excludedCount >= 0; excludedCount--) {
    const excluded = new Set(recentIds.slice(0, excludedCount));
    const candidates = items.filter(item => !excluded.has(item.id));
    if (candidates.length) return candidates;
  }
  return items;
}
function weightedPick(items, getWeight) {
  const weighted = items.map(item => ({ item, weight: Math.max(.01, getWeight(item)) }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = Math.random() * total;
  for (const entry of weighted) { cursor -= entry.weight; if (cursor <= 0) return entry.item }
  return weighted[weighted.length - 1].item;
}
function promptWeight(prompt) {
  return hasNameHint(state.name, prompt.nameHints) ? 1.18 : 1;
}
function chooseQuest() {
  const history = readHistory();
  const promptPool = availableItems(prompts, history.recentPrompts, HISTORY_LIMITS.recentPrompts);
  state.selectedPrompt = weightedPick(promptPool, promptWeight);
  writeHistory({
    recentServices: history.recentServices,
    recentPrompts: [state.selectedPrompt.id, ...history.recentPrompts.filter(id => id !== state.selectedPrompt.id)].slice(0, HISTORY_LIMITS.recentPrompts)
  });
}
function showQuestResult() {
  chooseQuest();
  const resultScreen = document.getElementById('screen-result');
  resultScreen.classList.remove('result-enter');
  show('screen-result');
  document.getElementById('resultService').textContent = state.selectedService.name;
  document.getElementById('resultName').textContent = state.selectedPrompt.title;
  document.getElementById('resultTagline').textContent = '今回の相棒とクエストは、王さまの運命のさいころで決まったぞ。';
  document.getElementById('heroType').textContent = '遊びのプロンプト';
  document.getElementById('questPrompt').value = state.selectedPrompt.text;
  document.getElementById('promptStatus').textContent = '';
  document.getElementById('warpBtn').textContent = `${state.selectedService.name}へ旅立つ ↗`;
  requestAnimationFrame(() => resultScreen.classList.add('result-enter'));
  audioManager.playResultSequence();
  document.getElementById('copyPromptBtn').onclick = copyPrompt;
  document.getElementById('warpBtn').onclick = launchSelectedService;
  document.getElementById('drawAgainBtn').onclick = rerollQuest;
}
async function copyPrompt() {
  const prompt = document.getElementById('questPrompt');
  const text = state.selectedPrompt?.text || prompt.value;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById('promptStatus').textContent = `プロンプトを うつしたぞ。${state.selectedService.name}へ貼り付けるのじゃ。`;
  } catch (error) {
    prompt.focus();
    prompt.select();
    document.getElementById('promptStatus').textContent = '自動コピーできぬ。選択された文字をコピーするのじゃ。';
  }
}
function launchSelectedService() {
  if (!state.selectedService || !state.selectedPrompt) return;
  sfx('gate');
  game.classList.add('flash');
  const chatTab = window.open(state.selectedService.url, '_blank');
  if (chatTab) chatTab.opener = null;
  if (navigator.clipboard) navigator.clipboard.writeText(state.selectedPrompt.text).catch(() => { });
  setTimeout(() => game.classList.remove('flash'), 720)
}

// controls
function handleUserGesture(event) { audioManager.unlock(); const target = event.target instanceof Element ? event.target : null; if (state.sound && currentScreenId() === 'screen-title' && !target?.closest('#startBtn')) audioManager.playBgm('title', .16) }
document.addEventListener('pointerdown', handleUserGesture, { passive: true });
document.addEventListener('keydown', handleUserGesture);
document.addEventListener('visibilitychange', () => { if (document.hidden) audioManager.pauseForVisibility(); else audioManager.resumeFromVisibility() });
document.querySelectorAll('button').forEach(bindFocusSound);
document.getElementById('soundBtn').onclick = e => { state.sound = !state.sound; e.currentTarget.textContent = state.sound ? '♪ ON' : '♪ OFF'; e.currentTarget.classList.toggle('off', !state.sound); if (state.sound) { audioManager.unlock(); audioManager.syncScreen(currentScreenId()); sfx('confirm') } else audioManager.stopAll() };
document.getElementById('startBtn').onclick = () => { audioManager.unlock(); audioManager.playBgm('title', .16); sfx('confirm'); show('screen-hero') };
document.querySelectorAll('.hero-card').forEach(btn => { btn.onclick = () => { document.querySelectorAll('.hero-card').forEach(card => card.classList.toggle('selected', card === btn)); state.gender = btn.dataset.gender; sfx('confirm'); show('screen-name'); document.getElementById('nameInput').focus() } });
document.getElementById('nameBtn').onclick = () => { state.name = (document.getElementById('nameInput').value || 'ゆうしゃ').trim().slice(0, 12) || 'ゆうしゃ'; sfx('confirm'); showServiceSelection() };
document.querySelectorAll('.service-card').forEach(btn => { btn.onclick = () => selectService(btn.dataset.service) });
document.getElementById('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('nameBtn').click() } });
document.getElementById('restartBtn').onclick = () => { sfx('cancel'); clearInterval(typingTimer); typingTimer = null; typingToken++; state.gender = 'male'; state.name = 'ゆうしゃ'; state.selectedService = null; state.selectedPrompt = null; document.getElementById('nameInput').value = ''; show('screen-title') };
document.getElementById('changeServiceBtn').onclick = () => { sfx('cancel'); showServiceSelection() };
