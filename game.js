'use strict';

// ─── State ──────────────────────────────────────────────────────────────────
const state = {
  data: null,
  currentBoard: 0,
  teams: [
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
    { name: 'Team 3', score: 0 },
    { name: 'Team 4', score: 0 },
  ],
  activeTeam: 0,
  // usedCells[boardIndex][categoryIndex][clueIndex] = true/false
  usedCells: [],
  currentClue: null,   // { boardIdx, catIdx, clueIdx, value }
  answerRevealed: false,
  // scoredTeams: tracks which teams have been scored for the current clue
  // { teamIdx: 'awarded' | 'deducted' }
  scoredTeams: {},
};

// ─── DOM Refs ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

let dom = {};

// ─── Init ────────────────────────────────────────────────────────────────────
async function init() {
  cacheDOM();

  try {
    const res = await fetch('questions.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
  } catch (e) {
    showError(`Could not load questions.json.<br><br><code>${e.message}</code><br><br>Make sure you open index.html from the jeopardy folder (not a different location).`);
    return;
  }

  // Init usedCells
  state.data.boards.forEach((board, bi) => {
    state.usedCells[bi] = board.categories.map(cat => cat.clues.map(() => false));
  });

  // Load saved state if present
  loadSavedState();

  hideLoading();
  buildTabs();
  buildTeams();
  renderBoard();
  renderFinalScores();
  attachGlobalListeners();
}

function cacheDOM() {
  dom = {
    loadingScreen:    $('loading-screen'),
    errorScreen:      $('error-screen'),
    errorMsg:         $('error-msg'),
    gameArea:         $('game-area'),
    boardTabs:        $('board-tabs'),
    teamsBar:         $('teams-bar'),
    boardWrapper:     $('board-wrapper'),
    board:            $('board'),
    modalOverlay:     $('modal-overlay'),
    modalCategory:    $('modal-category'),
    modalValue:       $('modal-value'),
    modalQuestion:    $('modal-question'),
    modalAnswerSec:   $('modal-answer-section'),
    modalAnswer:      $('modal-answer'),
    revealBtn:        $('reveal-btn'),
    scoreBtnsRow:     $('score-btns-row'),
    closeModalBtn:    $('close-modal-btn'),
    toast:            $('toast'),
    finalScores:      $('final-scores'),
    resetBtn:         $('reset-btn'),
    editScoresBtn:    $('edit-scores-btn'),
    editScoresOverlay:$('edit-scores-overlay'),
    editScoresForm:   $('edit-scores-form'),
    editScoresClose:  $('edit-scores-close'),
  };
}

function hideLoading() {
  dom.loadingScreen.style.display = 'none';
  dom.gameArea.style.display = 'block';
}

function showError(msg) {
  dom.loadingScreen.style.display = 'none';
  dom.errorScreen.style.display = 'flex';
  dom.errorMsg.innerHTML = msg;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function buildTabs() {
  dom.boardTabs.innerHTML = '';
  state.data.boards.forEach((board, i) => {
    const btn = document.createElement('button');
    btn.className = 'board-tab' + (i === state.currentBoard ? ' active' : '');
    btn.textContent = board.name;
    btn.addEventListener('click', () => switchBoard(i));
    dom.boardTabs.appendChild(btn);
  });
}

function switchBoard(idx) {
  state.currentBoard = idx;
  buildTabs();
  renderBoard();
  saveState();
}

// ─── Teams ────────────────────────────────────────────────────────────────────
function buildTeams() {
  dom.teamsBar.innerHTML = '';
  state.teams.forEach((team, i) => {
    const card = document.createElement('div');
    card.className = 'team-card' + (i === state.activeTeam ? ' active' : '');
    card.dataset.team = i;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'team-name-input';
    input.value = team.name;
    input.maxLength = 20;
    input.placeholder = `Team ${i + 1}`;
    input.addEventListener('input', e => {
      state.teams[i].name = e.target.value || `Team ${i + 1}`;
      renderFinalScores();
      updateScoreBtns();
      saveState();
    });
    input.addEventListener('click', e => e.stopPropagation());

    const scoreEl = document.createElement('div');
    scoreEl.className = 'team-score' + (team.score < 0 ? ' negative' : '');
    scoreEl.id = `team-score-${i}`;
    scoreEl.textContent = formatScore(team.score);

    card.appendChild(input);
    card.appendChild(scoreEl);

    card.addEventListener('click', () => setActiveTeam(i));
    dom.teamsBar.appendChild(card);
  });
}

function setActiveTeam(idx) {
  state.activeTeam = idx;
  document.querySelectorAll('.team-card').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  saveState();
}

function updateTeamScore(teamIdx) {
  const score = state.teams[teamIdx].score;
  const el = $(`team-score-${teamIdx}`);
  if (el) {
    el.textContent = formatScore(score);
    el.className = 'team-score' + (score < 0 ? ' negative' : '');
  }
}

function formatScore(n) {
  if (n < 0) return `-$${Math.abs(n).toLocaleString()}`;
  return `$${n.toLocaleString()}`;
}

// ─── Board ────────────────────────────────────────────────────────────────────
function renderBoard() {
  const board = state.data.boards[state.currentBoard];
  const grid = dom.board;
  grid.innerHTML = '';

  // Category headers
  board.categories.forEach(cat => {
    const header = document.createElement('div');
    header.className = 'category-header';
    header.textContent = cat.name;
    grid.appendChild(header);
  });

  // Clue rows (5 rows)
  for (let row = 0; row < 5; row++) {
    board.categories.forEach((cat, colIdx) => {
      const clue = cat.clues[row];
      const used = state.usedCells[state.currentBoard][colIdx][row];

      const displayValue = clue.value * boardMultiplier(state.currentBoard);
      const cell = document.createElement('div');
      cell.className = 'clue-cell' + (used ? ' used' : '');
      cell.textContent = used ? '✓' : `$${displayValue}`;
      cell.dataset.board = state.currentBoard;
      cell.dataset.cat   = colIdx;
      cell.dataset.clue  = row;

      if (!used) {
        cell.addEventListener('click', () => openModal(state.currentBoard, colIdx, row));
      }

      grid.appendChild(cell);
    });
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function boardMultiplier(boardIdx) {
  return boardIdx === 0 ? 1 : 2;
}

function openModal(boardIdx, catIdx, clueIdx) {
  const board = state.data.boards[boardIdx];
  const cat   = board.categories[catIdx];
  const clue  = cat.clues[clueIdx];
  const value = clue.value * boardMultiplier(boardIdx);

  state.currentClue = { boardIdx, catIdx, clueIdx, value };
  state.answerRevealed = false;
  state.scoredTeams = {};  // reset per-team lock for this clue

  dom.modalCategory.textContent = cat.name;
  dom.modalValue.textContent = `$${clue.value}`;
  dom.modalQuestion.textContent = clue.question;
  dom.modalAnswer.textContent = clue.answer;
  dom.modalAnswerSec.classList.remove('visible');
  dom.revealBtn.style.display = 'block';

  updateScoreBtns();

  dom.modalOverlay.classList.add('visible');
}

function closeModal() {
  dom.modalOverlay.classList.remove('visible');
  state.currentClue = null;
  state.answerRevealed = false;
}

function revealAnswer() {
  state.answerRevealed = true;
  dom.modalAnswerSec.classList.add('visible');
  dom.revealBtn.style.display = 'none';
}

function updateScoreBtns() {
  dom.scoreBtnsRow.innerHTML = '';

  const labelRow = document.createElement('label');
  labelRow.textContent = 'Award / Deduct — score any teams, then click Done';
  dom.scoreBtnsRow.appendChild(labelRow);

  const value = state.currentClue ? state.currentClue.value : 0;

  state.teams.forEach((team, i) => {
    const name = team.name || `Team ${i + 1}`;
    const scored = state.scoredTeams[i]; // 'awarded' | 'deducted' | undefined

    const row = document.createElement('div');
    row.className = 'score-team-row' + (scored ? ' scored' : '');
    row.id = `score-row-${i}`;

    const nameLabel = document.createElement('span');
    nameLabel.className = 'score-team-name';
    nameLabel.textContent = name;

    const statusBadge = document.createElement('span');
    statusBadge.className = 'score-status-badge';
    if (scored === 'awarded')  { statusBadge.textContent = `✓ +$${value}`; statusBadge.classList.add('badge-award'); }
    if (scored === 'deducted') { statusBadge.textContent = `✓ -$${value}`; statusBadge.classList.add('badge-deduct'); }

    const award = document.createElement('button');
    award.className = 'award-btn';
    award.textContent = `+$${value}`;
    award.title = `Award $${value} to ${name}`;
    award.disabled = !!scored;
    award.addEventListener('click', () => { awardPoints(i, value); refreshScoreRow(i, 'awarded', value); });

    const deduct = document.createElement('button');
    deduct.className = 'deduct-btn';
    deduct.textContent = `-$${value}`;
    deduct.title = `Deduct $${value} from ${name}`;
    deduct.disabled = !!scored;
    deduct.addEventListener('click', () => { deductPoints(i, value); refreshScoreRow(i, 'deducted', value); });

    row.appendChild(nameLabel);
    if (scored) {
      row.appendChild(statusBadge);
    } else {
      row.appendChild(award);
      row.appendChild(deduct);
    }
    dom.scoreBtnsRow.appendChild(row);
  });

  // Done button — marks cell used and closes
  const doneBtn = document.createElement('button');
  doneBtn.className = 'done-clue-btn';
  doneBtn.textContent = '✓ Done with this clue';
  doneBtn.addEventListener('click', doneWithClue);
  dom.scoreBtnsRow.appendChild(doneBtn);
}

function refreshScoreRow(teamIdx, result, value) {
  state.scoredTeams[teamIdx] = result;
  // Swap out just that row
  const row = $(`score-row-${teamIdx}`);
  if (!row) return;
  const name = state.teams[teamIdx].name || `Team ${teamIdx + 1}`;
  row.className = 'score-team-row scored';
  row.innerHTML = '';

  const nameLabel = document.createElement('span');
  nameLabel.className = 'score-team-name';
  nameLabel.textContent = name;

  const badge = document.createElement('span');
  badge.className = 'score-status-badge ' + (result === 'awarded' ? 'badge-award' : 'badge-deduct');
  badge.textContent = result === 'awarded' ? `✓ +$${value}` : `✓ -$${value}`;

  row.appendChild(nameLabel);
  row.appendChild(badge);
}

function awardPoints(teamIdx, value) {
  state.teams[teamIdx].score += value;
  updateTeamScore(teamIdx);
  renderFinalScores();
  const name = state.teams[teamIdx].name || `Team ${teamIdx + 1}`;
  showToast(`<span class="toast-award">+${formatScore(value)}</span> awarded to <strong>${name}</strong>!`);
  setActiveTeam(teamIdx);
  saveState();
}

function deductPoints(teamIdx, value) {
  state.teams[teamIdx].score -= value;
  updateTeamScore(teamIdx);
  renderFinalScores();
  const name = state.teams[teamIdx].name || `Team ${teamIdx + 1}`;
  showToast(`<span class="toast-deduct">${formatScore(-value)}</span> deducted from <strong>${name}</strong>.`);
  saveState();
}

function doneWithClue() {
  markCellUsed();
  closeModal();
}

function markCellUsed() {
  if (!state.currentClue) return;
  const { boardIdx, catIdx, clueIdx } = state.currentClue;
  state.usedCells[boardIdx][catIdx][clueIdx] = true;

  // Update cell in DOM without full re-render
  const cells = document.querySelectorAll(
    `.clue-cell[data-board="${boardIdx}"][data-cat="${catIdx}"][data-clue="${clueIdx}"]`
  );
  cells.forEach(cell => {
    cell.classList.add('used');
    cell.textContent = '✓';
    // Remove click listener by cloning
    const clone = cell.cloneNode(true);
    cell.parentNode.replaceChild(clone, cell);
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(html) {
  dom.toast.innerHTML = html;
  dom.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2800);
}

// ─── Final Scores ─────────────────────────────────────────────────────────────
function renderFinalScores() {
  const maxScore = Math.max(...state.teams.map(t => t.score));
  dom.finalScores.innerHTML = '';

  // Sort by score descending for display
  const sorted = state.teams
    .map((t, i) => ({ ...t, idx: i }))
    .sort((a, b) => b.score - a.score);

  sorted.forEach(team => {
    const item = document.createElement('div');
    item.className = 'final-score-item' + (team.score === maxScore && maxScore > 0 ? ' leader' : '');

    const nameEl = document.createElement('div');
    nameEl.className = 'fs-name';
    nameEl.textContent = team.name || `Team ${team.idx + 1}`;

    const scoreEl = document.createElement('div');
    scoreEl.className = 'fs-score' + (team.score < 0 ? ' negative' : '');
    scoreEl.textContent = formatScore(team.score);

    item.appendChild(nameEl);
    item.appendChild(scoreEl);
    dom.finalScores.appendChild(item);
  });
}

// ─── Reset ────────────────────────────────────────────────────────────────────
function resetGame() {
  if (!confirm('Reset all scores and mark all cells as unused? This cannot be undone.')) return;

  state.teams.forEach((t, i) => {
    t.score = 0;
    t.name = `Team ${i + 1}`;
  });
  state.activeTeam = 0;
  state.currentBoard = 0;
  state.usedCells = state.data.boards.map(board =>
    board.categories.map(cat => cat.clues.map(() => false))
  );

  buildTabs();
  buildTeams();
  renderBoard();
  renderFinalScores();
  clearSavedState();
  showToast('Game reset! Good luck!');
}

// ─── Persist State ────────────────────────────────────────────────────────────
function saveState() {
  try {
    const payload = {
      teams: state.teams,
      activeTeam: state.activeTeam,
      currentBoard: state.currentBoard,
      usedCells: state.usedCells,
    };
    localStorage.setItem('jeopardy_state', JSON.stringify(payload));
  } catch (e) { /* localStorage may be unavailable */ }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem('jeopardy_state');
    if (!raw) return;
    const saved = JSON.parse(raw);

    if (saved.teams && saved.teams.length === 4) {
      state.teams = saved.teams;
    }
    if (typeof saved.activeTeam === 'number') state.activeTeam = saved.activeTeam;
    if (typeof saved.currentBoard === 'number') state.currentBoard = saved.currentBoard;

    // Validate and restore usedCells shape
    if (saved.usedCells) {
      let valid = true;
      state.data.boards.forEach((board, bi) => {
        board.categories.forEach((cat, ci) => {
          cat.clues.forEach((_, li) => {
            if (!saved.usedCells[bi] || !saved.usedCells[bi][ci] || saved.usedCells[bi][ci][li] === undefined) {
              valid = false;
            }
          });
        });
      });
      if (valid) state.usedCells = saved.usedCells;
    }
  } catch (e) { /* ignore corrupted state */ }
}

function clearSavedState() {
  try { localStorage.removeItem('jeopardy_state'); } catch (e) {}
}

// ─── Edit Scores Modal ────────────────────────────────────────────────────────
function openEditScores() {
  dom.editScoresForm.innerHTML = '';

  state.teams.forEach((team, i) => {
    const name = team.name || `Team ${i + 1}`;

    const row = document.createElement('div');
    row.className = 'edit-score-row';

    const label = document.createElement('label');
    label.textContent = name;
    label.htmlFor = `edit-score-input-${i}`;

    const input = document.createElement('input');
    input.type = 'number';
    input.id = `edit-score-input-${i}`;
    input.className = 'edit-score-input';
    input.value = team.score;
    input.step = 100;

    row.appendChild(label);
    row.appendChild(input);
    dom.editScoresForm.appendChild(row);
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'edit-scores-save-btn';
  saveBtn.textContent = 'Save Scores';
  saveBtn.addEventListener('click', saveEditedScores);
  dom.editScoresForm.appendChild(saveBtn);

  dom.editScoresOverlay.classList.add('visible');
}

function saveEditedScores() {
  state.teams.forEach((team, i) => {
    const input = $(`edit-score-input-${i}`);
    if (input) {
      const val = parseInt(input.value, 10);
      if (!isNaN(val)) team.score = val;
    }
    updateTeamScore(i);
  });
  renderFinalScores();
  saveState();
  dom.editScoresOverlay.classList.remove('visible');
  showToast('Scores updated!');
}

function closeEditScores() {
  dom.editScoresOverlay.classList.remove('visible');
}

// ─── Global Listeners ─────────────────────────────────────────────────────────
function attachGlobalListeners() {
  dom.revealBtn.addEventListener('click', revealAnswer);
  dom.closeModalBtn.addEventListener('click', doneWithClue);
  dom.resetBtn.addEventListener('click', resetGame);
  dom.editScoresBtn.addEventListener('click', openEditScores);
  dom.editScoresClose.addEventListener('click', closeEditScores);

  // Close modal on overlay click (outside modal box)
  dom.modalOverlay.addEventListener('click', e => {
    if (e.target === dom.modalOverlay) doneWithClue();
  });
  dom.editScoresOverlay.addEventListener('click', e => {
    if (e.target === dom.editScoresOverlay) closeEditScores();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (dom.editScoresOverlay.classList.contains('visible')) { closeEditScores(); return; }
      doneWithClue();
    }
    if (e.key === 'Enter' && dom.modalOverlay.classList.contains('visible') && !state.answerRevealed) {
      revealAnswer();
    }
    // Tab switching: left/right arrow when modal closed
    if (!dom.modalOverlay.classList.contains('visible')) {
      if (e.key === 'ArrowRight') {
        const next = (state.currentBoard + 1) % state.data.boards.length;
        switchBoard(next);
      }
      if (e.key === 'ArrowLeft') {
        const prev = (state.currentBoard - 1 + state.data.boards.length) % state.data.boards.length;
        switchBoard(prev);
      }
    }
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
