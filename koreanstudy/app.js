// ─── Config ─────────────────────────────────────────────────────────────────
// Static deployment under whatisjamesdoing.com/koreanstudy — no backend.
// Data is served as static files: a sets.json manifest plus per-set
// sentences.json + .m4a audio clips under sets/<name>/.
const BASE = '/koreanstudy';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  sentences: [],        // current round's sentence list
  allSentences: [],     // full loaded set
  videoId: null,
  idx: 0,
  revealed: false,
  settings: { writeKorean: true, translateEnglish: true },
  scores: {},           // { id: true | false }
  koreanCorrect: null,
  englishCorrect: null,
  resultRecorded: false,
  roundCorrect: 0,
  // Cloud sync
  roundResumable: false,  // true only for prefix rounds we persist (not retry rounds)
  selectedCount: 0,       // how many sentences the current resumable round covers
  progressBySet: {},      // set_name -> saved progress row (resume + mastery)
  setLabels: {},          // set id (name) -> display label, e.g. "Level 1"
  setTotals: {},          // set id (name) -> total sentence count
  seen: {},               // sentence id -> true, for the active set (ever practiced)
  correct: {},            // sentence id -> true, for the active set (ever correct)
};

// ─── Cloud sync (Supabase auth + per-set resume) ─────────────────────────────
// Reuses the same Supabase project as geostudy, so signing in here is the same
// Google account. Public client-side keys — safe to ship in the static bundle.
const SUPABASE_URL = 'https://sofrzvspjrvtovksjdvi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Zh07DXhCr6jAcy1ZDAiviQ_XPFjings';
const sb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
let currentUser = null; // Supabase user when signed in, else null

const GOOGLE_SVG = `
  <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
  </svg>`;

async function signIn() {
  if (!sb) return;
  // Land back on this exact page (strip any hash/query) after the Google round-trip.
  const redirectTo = window.location.href.split('#')[0].split('?')[0];
  await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
}

async function signOut() {
  if (sb) await sb.auth.signOut();
}

function renderAuthWidget() {
  const w = el('auth-widget');
  if (!sb) { w.classList.add('hidden'); return; }
  w.classList.remove('hidden');

  if (!currentUser) {
    w.className = 'auth-widget';
    w.innerHTML = `<button class="auth-google-btn" id="auth-signin-btn">${GOOGLE_SVG}<span>Sign in with Google</span></button>`;
    el('auth-signin-btn').addEventListener('click', signIn);
    return;
  }

  const meta   = currentUser.user_metadata || {};
  const name   = meta.full_name || meta.name || currentUser.email || 'Account';
  const avatar = meta.avatar_url;
  w.className = 'auth-widget auth-widget--signedin';
  w.innerHTML = `
    ${avatar
      ? `<img class="auth-avatar" src="${escHtml(avatar)}" alt="" referrerpolicy="no-referrer">`
      : `<span class="auth-avatar auth-avatar-fallback">${escHtml(name.charAt(0).toUpperCase())}</span>`}
    <span class="auth-user-name" title="${escHtml(name)}">${escHtml(name)}</span>
    <button class="auth-signout-btn" id="auth-signout-btn">Sign out</button>`;
  el('auth-signout-btn').addEventListener('click', signOut);
}

// Number of sentences ever answered correctly in a set's saved row.
function correctCount(row) {
  return row?.correct ? Object.values(row.correct).filter(Boolean).length : 0;
}

// A saved row is "resumable" when it has an active round paused mid-way.
function isResumable(row) {
  const n = row?.round_ids?.length || 0;
  return n > 0 && row.current_index > 0 && row.current_index < n;
}

async function loadAllProgress() {
  state.progressBySet = {};
  if (!sb || !currentUser) return;
  const { data, error } = await sb
    .from('korean_progress')
    .select('set_name, round_ids, current_index, scores, seen, correct')
    .eq('user_id', currentUser.id);
  if (error) { console.warn('Progress load failed:', error.message); return; }
  (data || []).forEach(r => { state.progressBySet[r.set_name] = r; });
}

// Persist the active set: the in-progress round (for resume) plus the cumulative
// seen/correct maps (which survive finishing a round and drive the menu counts).
async function persistSet() {
  if (!state.videoId) return;
  const row = {
    set_name: state.videoId,
    round_ids:     state.roundResumable ? state.sentences.map(s => s.id) : [],
    current_index: state.roundResumable ? state.idx : 0,
    scores:        state.roundResumable ? state.scores : {},
    seen:    state.seen,
    correct: state.correct,
  };
  state.progressBySet[state.videoId] = row;
  refreshSetList();

  if (!sb || !currentUser) return;
  const { error } = await sb
    .from('korean_progress')
    .upsert(
      { ...row, selected_count: row.round_ids.length, user_id: currentUser.id,
        updated_at: new Date().toISOString() },
      { onConflict: 'user_id,set_name' }
    );
  if (error) console.warn('Progress save failed:', error.message);
}

// Refresh both the resume badge and the ✓ count on every set button.
function refreshSetList() { refreshSetListBadges(); renderSetCounts(); }

function refreshSetListBadges() {
  document.querySelectorAll('.local-set-btn').forEach(btn => {
    const right = btn.querySelector('.local-set-right');
    if (!right) return;
    let badge = right.querySelector('.resume-badge');
    if (isResumable(state.progressBySet[btn.dataset.name])) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'resume-badge';
        right.prepend(badge);
      }
      badge.textContent = 'Resume';
    } else if (badge) {
      badge.remove();
    }
  });
}

function renderSetCounts() {
  document.querySelectorAll('.local-set-btn').forEach(btn => {
    const span = btn.querySelector('.local-set-correct');
    if (!span) return;
    const name  = btn.dataset.name;
    const total = state.setTotals[name] || 0;
    const n     = correctCount(state.progressBySet[name]);
    span.textContent = `✓ ${n}/${total}`;
    span.classList.toggle('none', n === 0);
  });
}

function initAuth() {
  if (!sb) { el('auth-widget').classList.add('hidden'); return; }

  // Initial session (also resolves the OAuth redirect when returning from Google).
  sb.auth.getSession().then(async ({ data }) => {
    currentUser = data.session?.user || null;
    renderAuthWidget();
    if (currentUser) await loadAllProgress();
    refreshSetList();
  });

  // React to sign-in / sign-out.
  sb.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    renderAuthWidget();
    if (currentUser) await loadAllProgress();
    else state.progressBySet = {};
    refreshSetList();
  });
}

// ─── Audio player ─────────────────────────────────────────────────────────────
function setPlayBtn(playing) {
  el('play-btn').textContent = playing ? '⏸' : '▶';
}

// Fetch and cache one clip on demand. Returns true once a playable blob exists.
async function ensureAudio(s) {
  if (s.audio_blob) return true;
  if (!s.audio_url) return false;
  try {
    const res = await fetch(s.audio_url);
    if (res.ok) { s.audio_blob = URL.createObjectURL(await res.blob()); return true; }
  } catch (_) { /* still offline */ }
  return false;
}

// Reflect a clip's offline availability on the card. If it isn't cached (e.g. it
// failed to download during prefetch), try to load it now — landing on the card,
// or returning to it after a skip, retries the fetch.
async function updateAudioStatus(s) {
  const status = el('audio-status');
  if (s.audio_blob) { hide('audio-status'); return; }

  status.textContent = '⏳ Loading audio…';
  status.className = 'audio-status loading';
  show('audio-status');

  const ok = await ensureAudio(s);
  if (state.sentences[state.idx] !== s) return; // user moved on while fetching

  if (ok) {
    hide('audio-status');
  } else {
    status.textContent = '⚠ Audio not saved — tap to retry when online';
    status.className = 'audio-status';
  }
}

async function playSegment() {
  const audio = el('audio-player');
  if (!audio.paused) { audio.pause(); return; }
  const s = state.sentences[state.idx];
  if (!s.audio_blob) {
    const ok = await ensureAudio(s);
    if (state.sentences[state.idx] !== s) return;
    updateAudioStatus(s);
    if (!ok) return;
  }
  if (audio.dataset.sentenceId !== String(s.id)) {
    audio.src = s.audio_blob || s.audio_url;
    audio.dataset.sentenceId = s.id;
  }
  audio.play();
}

async function replaySegment() {
  const s = state.sentences[state.idx];
  if (!s.audio_blob) {
    const ok = await ensureAudio(s);
    if (state.sentences[state.idx] !== s) return;
    updateAudioStatus(s);
    if (!ok) return;
  }
  const audio = el('audio-player');
  audio.src = s.audio_blob || s.audio_url;
  audio.dataset.sentenceId = s.id;
  audio.currentTime = 0;
  audio.play();
}

function initAudioListeners() {
  const audio = el('audio-player');
  audio.addEventListener('play',  () => setPlayBtn(true));
  audio.addEventListener('pause', () => setPlayBtn(false));
  audio.addEventListener('ended', () => setPlayBtn(false));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const el = id => document.getElementById(id);

function show(...ids) { ids.forEach(id => el(id).classList.remove('hidden')); }
function hide(...ids) { ids.forEach(id => el(id).classList.add('hidden')); }

function normalize(text) {
  return (text || '').normalize('NFC').trim().replace(/\s+/g, ' ');
}

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Korean diff (character-level LCS + optional jamo hint) ──────────────────
const HANGUL_BASE = 0xAC00;
const HANGUL_END  = 0xD7A3;
const HANGUL_INITIALS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const HANGUL_MEDIALS  = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const HANGUL_FINALS   = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function decomposeHangul(ch) {
  const code = ch.codePointAt(0);
  if (code < HANGUL_BASE || code > HANGUL_END) return null;
  const offset = code - HANGUL_BASE;
  return {
    i: HANGUL_INITIALS[Math.floor(offset / (21 * 28))],
    m: HANGUL_MEDIALS[Math.floor((offset % (21 * 28)) / 28)],
    f: HANGUL_FINALS[offset % 28],
  };
}

function lcsDiff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 && j > 0) {
    if (a[i-1] === b[j-1])           { ops.push({ op:'eq',  char:a[i-1] }); i--; j--; }
    else if (dp[i-1][j] >= dp[i][j-1]) { ops.push({ op:'del', char:a[i-1] }); i--; }
    else                              { ops.push({ op:'ins', char:b[j-1] }); j--; }
  }
  while (i > 0) { ops.push({ op:'del', char:a[i-1] }); i--; }
  while (j > 0) { ops.push({ op:'ins', char:b[j-1] }); j--; }
  ops.reverse();
  return ops;
}

// Merge adjacent del+ins (or ins+del) runs into substitution blocks so we can
// render them as paired "you wrote X / expected Y" with an optional jamo hint.
function consolidateDiff(ops) {
  const out = [];
  let k = 0;
  while (k < ops.length) {
    const here = ops[k].op;
    if (here === 'del' || here === 'ins') {
      let kEnd = k;
      while (kEnd < ops.length && ops[kEnd].op === here) kEnd++;
      const otherOp = here === 'del' ? 'ins' : 'del';
      let mEnd = kEnd;
      while (mEnd < ops.length && ops[mEnd].op === otherOp) mEnd++;
      if (mEnd > kEnd) {
        const dels = here === 'del' ? ops.slice(k, kEnd) : ops.slice(kEnd, mEnd);
        const ins  = here === 'del' ? ops.slice(kEnd, mEnd) : ops.slice(k, kEnd);
        out.push({
          op: 'sub',
          u: dels.map(o => o.char).join(''),
          e: ins.map(o => o.char).join(''),
        });
        k = mEnd;
        continue;
      }
    }
    out.push(ops[k]);
    k++;
  }
  return out;
}

function jamoHint(uChar, eChar) {
  const dU = decomposeHangul(uChar);
  const dE = decomposeHangul(eChar);
  if (!dU || !dE) return '';
  const parts = [];
  if (dU.i !== dE.i) parts.push(`${dU.i} → ${dE.i}`);
  if (dU.m !== dE.m) parts.push(`${dU.m} → ${dE.m}`);
  if (dU.f !== dE.f) {
    if (!dU.f)      parts.push(`+받침 ${dE.f}`);
    else if (!dE.f) parts.push(`−받침 ${dU.f}`);
    else            parts.push(`받침 ${dU.f} → ${dE.f}`);
  }
  return parts.join(' · ');
}

function renderKoreanDiff(userText, expectedText) {
  const ops = consolidateDiff(lcsDiff([...userText], [...expectedText]));

  // Preserve whitespace as actual spaces; use NBSP inside highlight spans so
  // the background swatch stays visible for space-only diffs.
  const keepSpace = s => s.replace(/ /g, ' ');
  let userHtml = '';
  let expectedHtml = '';

  for (const op of ops) {
    if (op.op === 'eq') {
      const e = escHtml(op.char);
      userHtml     += `<span class="diff-ok">${e}</span>`;
      expectedHtml += `<span class="diff-ok">${e}</span>`;
    } else if (op.op === 'del') {
      userHtml += `<span class="diff-extra" title="extra — remove this">${escHtml(keepSpace(op.char))}</span>`;
    } else if (op.op === 'ins') {
      expectedHtml += `<span class="diff-missing" title="you missed this">${escHtml(keepSpace(op.char))}</span>`;
    } else if (op.op === 'sub') {
      const hint = (op.u.length === 1 && op.e.length === 1) ? jamoHint(op.u, op.e) : '';
      const hintSpan = hint ? `<span class="diff-jamo-hint">${escHtml(hint)}</span>` : '';
      userHtml     += `<span class="diff-extra" title="you wrote this — expected ${escHtml(op.e)}">${escHtml(keepSpace(op.u))}</span>`;
      expectedHtml += `<span class="diff-missing" title="you wrote ${escHtml(op.u)}">${escHtml(keepSpace(op.e))}</span>${hintSpan}`;
    }
  }

  if (!userText) userHtml = '<span class="diff-empty">(nothing typed)</span>';
  return { userHtml, expectedHtml };
}

function saveSettings() {
  localStorage.setItem('kp-settings', JSON.stringify(state.settings));
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('kp-settings') || '{}');
    if (typeof s.writeKorean    === 'boolean') state.settings.writeKorean    = s.writeKorean;
    if (typeof s.translateEnglish === 'boolean') state.settings.translateEnglish = s.translateEnglish;
  } catch (_) {}
}

// ─── Score tracking ───────────────────────────────────────────────────────────
function recordResult() {
  if (state.resultRecorded) return;
  state.resultRecorded = true;

  const listenOnly = !state.settings.writeKorean && !state.settings.translateEnglish;
  let correct;

  if (listenOnly) {
    correct = true;
  } else {
    const koreanOk = state.settings.writeKorean ? (state.koreanCorrect === true) : true;
    const englishOk = (state.settings.translateEnglish && state.englishCorrect !== null)
      ? state.englishCorrect : true;
    correct = koreanOk && englishOk;
  }

  const s = state.sentences[state.idx];
  state.scores[s.id] = correct;
  state.seen[s.id] = true;            // cumulative: practiced this sentence
  if (correct) state.correct[s.id] = true; // cumulative: mastered it (sticky)
  if (correct) state.roundCorrect++;
  updateScoreCounter();
  persistSet();
}

function updateScoreCounter() {
  el('score-text').textContent = `✓ ${state.roundCorrect} / ${state.sentences.length}`;
}

// ─── Offline audio prefetch ─────────────────────────────────────────────────
// Audio clips are normally fetched lazily when ▶ is pressed, so they fail once
// service drops. Before a round starts we download every selected clip into an
// in-memory blob URL so the whole round plays offline (e.g. on the subway).
async function prefetchAudio(sentences, onProgress) {
  const pending = sentences.filter(s => s.audio_url && !s.audio_blob);
  let done = 0;
  onProgress(0, pending.length);
  await Promise.all(pending.map(async s => {
    try {
      const res = await fetch(s.audio_url);
      if (res.ok) s.audio_blob = URL.createObjectURL(await res.blob());
    } catch (_) { /* leaves audio_url as a (network) fallback */ }
    onProgress(++done, pending.length);
  }));
  return pending.filter(s => !s.audio_blob).length; // clips that failed to cache
}

// ─── Round management ─────────────────────────────────────────────────────────
// opts: { resumable, startIdx, savedScores } — resumable rounds (the prefix rounds
// picked from the configure screen) persist progress to the user's account.
async function startRound(sentences, opts = {}) {
  // Download all clips up front so losing service mid-round doesn't break playback.
  if (sentences.some(s => s.audio_url && !s.audio_blob)) {
    hide('load-screen', 'configure-screen', 'round-complete-screen', 'practice-screen');
    show('loading-audio-screen');
    const failed = await prefetchAudio(sentences, (done, total) => {
      el('loading-audio-fill').style.width = total ? `${(done / total) * 100}%` : '100%';
      el('loading-audio-text').textContent = `${done} / ${total} clips saved`;
    });
    hide('loading-audio-screen');
    if (failed) {
      console.warn(`${failed} audio clip(s) could not be cached; they may not play offline.`);
    }
  }

  state.sentences = sentences;
  state.scores = {};
  sentences.forEach(s => { state.scores[s.id] = null; });

  // Restore saved per-sentence results when resuming.
  if (opts.savedScores) {
    sentences.forEach(s => {
      if (opts.savedScores[s.id] !== undefined && opts.savedScores[s.id] !== null) {
        state.scores[s.id] = opts.savedScores[s.id];
      }
    });
  }
  state.idx = Math.min(opts.startIdx || 0, sentences.length - 1);
  state.roundCorrect = sentences.filter(s => state.scores[s.id] === true).length;
  state.roundResumable = !!opts.resumable;
  state.selectedCount  = sentences.length;

  hide('load-screen', 'configure-screen', 'round-complete-screen');
  show('practice-screen');
  el('play-btn').disabled  = false;
  el('replay-btn').disabled = false;
  updateScoreCounter();
  renderCard();
}

function finishRound() {
  hide('practice-screen');

  // Round complete — clear the resume point but keep cumulative mastery.
  state.roundResumable = false;
  persistSet();

  const wrongSentences = state.sentences.filter(s => state.scores[s.id] === false);
  el('round-result-text').textContent =
    `You got ${state.roundCorrect} out of ${state.sentences.length} correct.`;

  if (wrongSentences.length === 0) {
    el('round-badge').textContent = '🎉 All correct!';
    hide('retry-wrong-btn');
    show('round-done-btn');
  } else {
    el('round-badge').textContent = `${wrongSentences.length} to retry`;
    el('retry-wrong-btn').textContent = `Retry ${wrongSentences.length} missed →`;
    el('retry-wrong-btn').onclick = () => startRound(wrongSentences);
    show('retry-wrong-btn');
    hide('round-done-btn');
  }
  show('round-complete-screen');
}

// Pick `count` sentences, preferring ones never practiced before, then filling
// with already-seen ones (original order preserved within each group).
function pickRoundSentences(all, count) {
  const unseen = all.filter(s => !state.seen[s.id]);
  const seen   = all.filter(s =>  state.seen[s.id]);
  return unseen.concat(seen).slice(0, count);
}

// ─── Configure screen ─────────────────────────────────────────────────────────
function showConfigure(name, sentences) {
  state.allSentences = sentences;
  state.videoId = name;

  // Load this set's cumulative mastery so seen/correct accrue across rounds.
  const saved = state.progressBySet[name];
  state.seen    = { ...(saved?.seen || {}) };
  state.correct = { ...(saved?.correct || {}) };

  el('configure-set-name').textContent = state.setLabels[name] || name;
  const total = sentences.length;
  const counts = [10, 25, 50].filter(n => n < total);
  counts.push(total);

  const resumeHtml = isResumable(saved)
    ? `<button class="count-option-btn resume-btn" id="resume-btn">
         ▶ Resume — sentence ${saved.current_index + 1} / ${saved.round_ids.length}
       </button>`
    : '';

  const container = el('count-options');
  container.innerHTML = resumeHtml + counts.map(n =>
    `<button class="count-option-btn" data-count="${n}">
       ${n === total ? `All (${n})` : n}
     </button>`
  ).join('');

  // Picking a count starts a fresh round of mostly-unseen sentences.
  container.querySelectorAll('.count-option-btn[data-count]').forEach(btn => {
    btn.addEventListener('click', () =>
      startRound(pickRoundSentences(state.allSentences, parseInt(btn.dataset.count)), { resumable: true })
    );
  });

  if (isResumable(saved)) {
    el('resume-btn').addEventListener('click', () => {
      // Rebuild the paused round from its saved sentence ids, in order.
      const byId = new Map(state.allSentences.map(s => [s.id, s]));
      const roundSentences = saved.round_ids.map(id => byId.get(id)).filter(Boolean);
      startRound(roundSentences, {
        resumable: true,
        startIdx: saved.current_index,
        savedScores: saved.scores,
      });
    });
  }

  hide('load-screen', 'practice-screen', 'round-complete-screen');
  show('configure-screen');
}

function showLoadError(msg) {
  el('load-error').textContent = msg;
  show('load-error');
}

// ─── Practice ─────────────────────────────────────────────────────────────────
function renderCard() {
  state.revealed = false;
  state.koreanCorrect  = null;
  state.englishCorrect = null;
  state.resultRecorded = false;

  el('audio-player').pause();
  setPlayBtn(false);

  const s     = state.sentences[state.idx];
  const total = state.sentences.length;

  updateAudioStatus(s); // show offline state / retry the fetch on landing

  el('progress-fill').style.width  = `${(state.idx / total) * 100}%`;
  el('progress-text').textContent  = `${state.idx + 1} / ${total}`;

  el('korean-input').value     = '';
  el('english-input').value    = '';
  el('korean-input').className  = '';
  el('english-input').className = '';

  state.settings.writeKorean      ? show('korean-group')  : hide('korean-group');
  state.settings.translateEnglish ? show('english-group') : hide('english-group');

  if (!s.english && state.settings.translateEnglish) {
    el('english-group-label').textContent = 'Translate to English (not available)';
    el('english-input').disabled = true;
  } else {
    el('english-group-label').textContent = 'Translate to English';
    el('english-input').disabled = false;
  }

  hide('answer-reveal', 'self-assess-row', 'next-btn');
  show('check-btn', 'skip-btn');

  const listenOnly = !state.settings.writeKorean && !state.settings.translateEnglish;
  el('check-btn').textContent = listenOnly ? 'Reveal' : 'Check Answer';

  if (state.settings.writeKorean) el('korean-input').focus();
  else if (state.settings.translateEnglish) el('english-input').focus();

  persistSet(); // persist current position whenever a card is shown
}

function checkAnswer() {
  if (state.revealed) return;
  state.revealed = true;

  const s = state.sentences[state.idx];
  hide('check-btn', 'skip-btn');

  let revealHTML = '';
  let needSelfAssess = false;

  if (state.settings.writeKorean) {
    const input    = normalize(el('korean-input').value);
    const expected = normalize(s.korean);
    state.koreanCorrect = input === expected;
    el('korean-input').className = state.koreanCorrect ? 'correct' : 'incorrect';

    if (state.koreanCorrect) {
      revealHTML += `
        <div class="answer-block korean">
          <span class="answer-label">Korean</span>
          <span class="answer-text">${escHtml(s.korean)}</span>
          <span class="feedback-tag correct">✓ Correct</span>
        </div>`;
    } else {
      const { userHtml, expectedHtml } = renderKoreanDiff(input, expected);
      revealHTML += `
        <div class="answer-block korean">
          <span class="answer-label">Your answer</span>
          <span class="answer-text diff-line">${userHtml}</span>
          <span class="feedback-tag incorrect">✗ Incorrect</span>
        </div>
        <div class="answer-block korean">
          <span class="answer-label">Expected</span>
          <span class="answer-text diff-line">${expectedHtml}</span>
        </div>`;
    }
  } else {
    revealHTML += `
      <div class="answer-block korean">
        <span class="answer-label">Korean</span>
        <span class="answer-text">${escHtml(s.korean)}</span>
      </div>`;
  }

  if (s.english) {
    revealHTML += `
      <div class="answer-block">
        <span class="answer-label">English</span>
        <span class="answer-text">${escHtml(s.english)}</span>
      </div>`;
    if (state.settings.translateEnglish && el('english-input').value.trim()) {
      needSelfAssess = true;
    }
  }

  el('answer-reveal').innerHTML = revealHTML;
  show('answer-reveal');
  el('answer-reveal').scrollTop = 0;

  if (needSelfAssess) {
    show('self-assess-row');
  } else {
    recordResult();
    show('next-btn');
  }
}

function selfAssess(correct) {
  state.englishCorrect = correct;
  recordResult();
  hide('self-assess-row');
  show('next-btn');
}

function nextCard() {
  recordResult(); // no-op if already recorded
  state.idx++;
  if (state.idx >= state.sentences.length) finishRound();
  else renderCard();
}

function goToLoadScreen() {
  hide('practice-screen', 'round-complete-screen', 'configure-screen');
  show('load-screen');
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function applySettingsToUI() {
  el('setting-write-korean').checked = state.settings.writeKorean;
  el('setting-translate').checked    = state.settings.translateEnglish;
}

function onSettingChange() {
  state.settings.writeKorean      = el('setting-write-korean').checked;
  state.settings.translateEnglish = el('setting-translate').checked;
  saveSettings();
  if (state.sentences.length > 0 && !state.revealed) renderCard();
}

// ─── Pre-processed sets (static) ──────────────────────────────────────────────
async function fetchLocalSets() {
  try {
    const res = await fetch(`${BASE}/sets.json`);
    const sets = await res.json();
    if (!sets?.length) return;

    // `name` stays the stable id (folder path + progress key); `label` is shown.
    sets.forEach(s => {
      state.setLabels[s.name] = s.label || s.name;
      state.setTotals[s.name] = s.sentence_count;
    });

    const list = el('local-sets-list');
    list.innerHTML = sets.map(s => `
      <button class="local-set-btn" data-name="${escHtml(s.name)}">
        <span class="local-set-name">${escHtml(s.label || s.name)}</span>
        <span class="local-set-right">
          ${s.difficulty ? `<span class="difficulty-badge difficulty-${escHtml(s.difficulty)}">${escHtml(s.difficulty)}</span>` : ''}
          <span class="local-set-correct none"></span>
          <span class="local-set-count">${s.sentence_count} sentences</span>
        </span>
      </button>
    `).join('');

    list.querySelectorAll('.local-set-btn').forEach(btn => {
      btn.addEventListener('click', () => loadLocalSet(btn.dataset.name));
    });

    show('local-sets-area');
    refreshSetList();
  } catch (_) {}
}

async function loadLocalSet(name) {
  hide('load-error');
  // Release any blobs cached for the previously loaded set.
  state.allSentences.forEach(s => { if (s.audio_blob) URL.revokeObjectURL(s.audio_blob); });
  try {
    const res  = await fetch(`${BASE}/sets/${encodeURIComponent(name)}/sentences.json`);
    if (!res.ok) { showLoadError('Failed to load this set.'); return; }
    const data = await res.json();
    const sentences = Array.isArray(data) ? data : (data.sentences || []);
    if (!sentences.length) { showLoadError('No sentences found.'); return; }

    // Build static audio URLs from each clip's filename.
    sentences.forEach(s => {
      if (s.audio_file && !s.audio_url) {
        s.audio_url = `${BASE}/sets/${encodeURIComponent(name)}/${s.audio_file}`;
      }
    });

    showConfigure(name, sentences);
  } catch (e) {
    showLoadError('Network error: ' + e.message);
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettingsToUI();
  fetchLocalSets();
  initAuth();

  initAudioListeners();
  el('play-btn').addEventListener('click',   playSegment);
  el('replay-btn').addEventListener('click', replaySegment);
  el('audio-status').addEventListener('click', () => updateAudioStatus(state.sentences[state.idx]));

  el('check-btn').addEventListener('click', checkAnswer);
  el('skip-btn').addEventListener('click',  checkAnswer);

  el('got-it-btn').addEventListener('click', () => selfAssess(true));
  el('missed-btn').addEventListener('click', () => selfAssess(false));

  el('next-btn').addEventListener('click', nextCard);

  el('setting-write-korean').addEventListener('change', onSettingChange);
  el('setting-translate').addEventListener('change',    onSettingChange);

  el('main-menu-btn').addEventListener('click',    goToLoadScreen);
  el('change-video-btn').addEventListener('click',  goToLoadScreen);
  el('restart-btn').addEventListener('click', () => showConfigure(state.videoId, state.allSentences));

  el('round-done-btn').addEventListener('click',      goToLoadScreen);
  el('round-new-video-btn').addEventListener('click', goToLoadScreen);

  el('configure-back-btn').addEventListener('click', () => {
    hide('configure-screen');
    show('load-screen');
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); playSegment(); }
    if (e.code === 'Enter') {
      if (!state.revealed) checkAnswer();
      else if (!el('next-btn').classList.contains('hidden')) nextCard();
    }
  });
});
