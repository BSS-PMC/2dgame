const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GRAVITY = 40;
const MOVE_SPEED = 12;
const JUMP_VELOCITY = 17.5;

const input = { left: false, right: false, jump: false, reset: false, menu: false };

const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");
const victoryEl = document.getElementById("victory");
const resumeBtn = document.getElementById("resume-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const resetGameBtn = document.getElementById("reset-game-btn");
const homeBtn = document.getElementById("home-btn");
const victoryHomeBtn = document.getElementById("victory-home-btn");
const timerIgtEl = document.getElementById("timer-igt");
const timerRtEl = document.getElementById("timer-rt");
const victoryIgtEl = document.getElementById("victory-igt");
const victoryRtEl = document.getElementById("victory-rt");
const speedrunToggle = document.getElementById("speedrun-toggle");
const timerEl = document.querySelector(".timer");
const usernameSection = document.getElementById("username-section");
const usernameInput = document.getElementById("username-input");
const usernameError = document.getElementById("username-error");
const usernameLock = document.getElementById("username-lock");
const usernameLockError = document.getElementById("username-lock-error");
const usernameDisplay = document.getElementById("username-display");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardEmpty = document.getElementById("leaderboard-empty");
const fullscreenBtn = document.getElementById("fullscreen-btn");
// Accessibility toggles removed

const LEVELS = [
  {
    start: { x: 60, y: HEIGHT - 120 },
    platforms: [
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 40, y: HEIGHT - 140, w: 180, h: 20 },
      { x: 260, y: HEIGHT - 220, w: 180, h: 20 },
      { x: 500, y: HEIGHT - 160, w: 220, h: 20 },
      { x: 740, y: HEIGHT - 260, w: 180, h: 20 },
      { x: 620, y: HEIGHT - 340, w: 140, h: 20 }
    ],
    exit: { x: WIDTH - 70, y: HEIGHT - 120, w: 40, h: 60 }
  },
  {
    start: { x: 80, y: HEIGHT - 200 },
    platforms: [
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 140, y: HEIGHT - 140, w: 200, h: 20 },
      { x: 420, y: HEIGHT - 220, w: 160, h: 20 },
      { x: 660, y: HEIGHT - 300, w: 200, h: 20 },
      { x: 260, y: HEIGHT - 320, w: 140, h: 20 }
    ],
    exit: { x: WIDTH - 120, y: HEIGHT - 140, w: 50, h: 70 }
  },
  {
    start: { x: 70, y: HEIGHT - 120 },
    platforms: [
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 80, y: HEIGHT - 120, w: 140, h: 20 },
      { x: 260, y: HEIGHT - 180, w: 140, h: 20 },
      { x: 440, y: HEIGHT - 240, w: 140, h: 20 },
      { x: 620, y: HEIGHT - 300, w: 140, h: 20 },
      { x: 300, y: HEIGHT - 340, w: 120, h: 20 },
      { x: 520, y: HEIGHT - 80, w: 280, h: 20 }
    ],
    exit: { x: WIDTH - 80, y: HEIGHT - 170, w: 40, h: 60 }
  },
  {
    start: { x: 120, y: HEIGHT - 140 },
    platforms: [
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 60, y: HEIGHT - 200, w: 200, h: 20 },
      { x: 320, y: HEIGHT - 280, w: 200, h: 20 },
      { x: 580, y: HEIGHT - 200, w: 200, h: 20 },
      { x: 360, y: HEIGHT - 120, w: 140, h: 20 }
    ],
    exit: { x: WIDTH - 160, y: HEIGHT - 240, w: 50, h: 70 }
  },
  {
    start: { x: 60, y: HEIGHT - 120 },
    platforms: [
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 120, y: HEIGHT - 140, w: 140, h: 20 },
      { x: 320, y: HEIGHT - 200, w: 160, h: 20 },
      { x: 540, y: HEIGHT - 260, w: 160, h: 20 },
      { x: 760, y: HEIGHT - 320, w: 140, h: 20 },
      { x: 420, y: HEIGHT - 360, w: 120, h: 20 }
    ],
    exit: { x: WIDTH - 90, y: HEIGHT - 180, w: 50, h: 70 }
  }
];

const hud = {
  coins: document.getElementById("coins"),
  status: document.getElementById("status")
};

function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    w: 36,
    h: 48,
    vx: 0,
    vy: 0,
    onGround: false
  };
}

let currentLevelIndex = 0;
let player = createPlayer(LEVELS[0].start);
let coins = [];
let isPaused = true;
let isHome = true;
let isSpeedrunMode = false;
let currentUsername = "";
let igtSeconds = 0;
let runStartMs = performance.now();
let lastWallMs = performance.now();
// username UI listeners will be attached on DOMContentLoaded

const settings = {
  bw: true,
  highContrast: false,
  reducedMotion: false,
  largeText: false
};

function getLeaderboard() {
  const data = localStorage.getItem("speedrun-leaderboard");
  return data ? JSON.parse(data) : [];
}

function saveLeaderboardEntry(username, igt) {
  const leaderboard = getLeaderboard();
  leaderboard.push({ username, igt, timestamp: Date.now() });
  leaderboard.sort((a, b) => a.igt - b.igt);
  leaderboard.splice(10); // Keep only top 10
  localStorage.setItem("speedrun-leaderboard", JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  if (leaderboard.length === 0) {
    if (leaderboardEmpty) leaderboardEmpty.classList.remove("hidden");
    if (leaderboardBody) leaderboardBody.innerHTML = "";
    return;
  }
  if (leaderboardEmpty) leaderboardEmpty.classList.add("hidden");
  if (leaderboardBody) leaderboardBody.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${entry.username}</td><td>${entry.igt.toFixed(2)}s</td>`;
    if (leaderboardBody) leaderboardBody.appendChild(row);
  });
}

function updateCoinText(collected, total) {
  hud.coins.textContent = `Coins: ${collected}/${total}`;
}

function setStatus(text) {
  hud.status.textContent = text;
}

function handleKey(e, down) {
  if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = down;
  if (e.code === "ArrowRight" || e.code === "KeyD") input.right = down;
  if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") input.jump = down;
  if (e.code === "KeyR") input.reset = down;
  if (e.code === "Escape") input.menu = down;
}

document.addEventListener("keydown", (e) => handleKey(e, true));
document.addEventListener("keyup", (e) => handleKey(e, false));

function aabbIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resolveCollisions(body, platforms) {
  body.onGround = false;

  for (const p of platforms) {
    if (!aabbIntersect(body, p)) continue;

    const overlapLeft = body.x + body.w - p.x;
    const overlapRight = p.x + p.w - body.x;
    const overlapTop = body.y + body.h - p.y;
    const overlapBottom = p.y + p.h - body.y;

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft) {
      body.x = p.x - body.w;
      body.vx = 0;
    } else if (minOverlap === overlapRight) {
      body.x = p.x + p.w;
      body.vx = 0;
    } else if (minOverlap === overlapTop) {
      body.y = p.y - body.h;
      body.vy = 0;
      body.onGround = true;
    } else {
      body.y = p.y + p.h;
      body.vy = 0;
    }
  }
}

function loadLevel(index) {
  currentLevelIndex = index;
  const data = LEVELS[currentLevelIndex];
  player = createPlayer(data.start);
  coins = [];
  setStatus(`Level ${currentLevelIndex + 1}/${LEVELS.length}`);
}

function resetLevel() {
  loadLevel(currentLevelIndex);
}

let lastTime = performance.now();
setStatus(`Level ${currentLevelIndex + 1}/${LEVELS.length}`);

function updateUsernameUI() {
  const toggle = document.getElementById("speedrun-toggle");
  const section = document.getElementById("username-section");
  const input = document.getElementById("username-input");
  const lockEl = document.getElementById("username-lock");
  const errEl = document.getElementById("username-error");
  const lockErrEl = document.getElementById("username-lock-error");
  if (!toggle || !section || !input) return;

  const checked = !!toggle.checked;
  // Ensure visibility both via class and inline style to avoid timing/CSS edge cases
  if (checked) {
    section.classList.remove("hidden");
    section.style.display = 'block';
  } else {
    section.classList.add("hidden");
    section.style.display = 'none';
  }
  input.disabled = !checked;

  if (checked) {
    if (lockEl) lockEl.classList.add("hidden");
    if (errEl) errEl.classList.add("hidden");
    if (lockErrEl) lockErrEl.classList.add("hidden");
    try { input.focus(); } catch (e) {}
  } else {
    if (lockEl) lockEl.classList.remove("hidden");
  }
  console.log('updateUsernameUI:', { checked, sectionDisplayed: section.style.display, classList: section.className });
}
// Attach handlers now and on DOMContentLoaded to be robust across load timing
updateUsernameUI();
const _toggleNow = document.getElementById("speedrun-toggle");
if (_toggleNow) _toggleNow.addEventListener("change", updateUsernameUI);

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "speedrun-toggle") updateUsernameUI();
});

document.addEventListener("DOMContentLoaded", () => {
  updateUsernameUI();
  const toggle = document.getElementById("speedrun-toggle");
  const section = document.getElementById("username-section");
  const input = document.getElementById("username-input");
  const lockErrEl = document.getElementById("username-lock-error");

  if (toggle) toggle.addEventListener("change", updateUsernameUI);

  if (section) {
    section.addEventListener("click", (e) => {
      if (input && input.disabled) {
        e.preventDefault();
        if (lockErrEl) lockErrEl.classList.remove("hidden");
      }
    });
  }

  if (input) {
    input.addEventListener("input", () => {
      if (!input.disabled && lockErrEl) lockErrEl.classList.add("hidden");
    });
  }
});

// Extra robust bindings: multiple events + MutationObserver + short polling fallback
function bindSpeedrunToggleRobust() {
  const toggle = document.getElementById('speedrun-toggle');
  if (!toggle) return;

  // multiple event types to be safe across browsers
  ['change', 'input', 'click'].forEach(ev => toggle.addEventListener(ev, updateUsernameUI));

  // Observe attribute changes (some frameworks change 'checked' via attributes)
  try {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'checked') {
          updateUsernameUI();
        }
      }
    });
    mo.observe(toggle, { attributes: true, attributeFilter: ['checked'] });
  } catch (e) {
    // ignore if MutationObserver not available
  }

  // Short polling fallback for 3 seconds in case the state changes in non-standard ways
  const start = Date.now();
  let last = toggle.checked;
  const poll = setInterval(() => {
    if (Date.now() - start > 3000) {
      clearInterval(poll);
      return;
    }
    if (toggle.checked !== last) {
      last = toggle.checked;
      updateUsernameUI();
    }
  }, 150);
}

bindSpeedrunToggleRobust();
document.addEventListener('DOMContentLoaded', bindSpeedrunToggleRobust);

// Home/start logic
if (startBtn) startBtn.addEventListener("click", () => {
  const toggle = document.getElementById("speedrun-toggle");
  isSpeedrunMode = !!(toggle && toggle.checked);

  // Validate username if speedrun mode is enabled
  if (isSpeedrunMode) {
    const username = usernameInput && usernameInput.value ? usernameInput.value.trim() : "";
    if (!username) {
      if (usernameError) usernameError.classList.remove("hidden");
      if (usernameLockError) usernameLockError.classList.add("hidden");
      return;
    }
    currentUsername = username;
    if (usernameDisplay) usernameDisplay.classList.remove("hidden");
    if (usernameDisplay) usernameDisplay.textContent = username;
    if (usernameError) usernameError.classList.add("hidden");
    if (usernameLockError) usernameLockError.classList.add("hidden");
    if (timerEl) timerEl.classList.remove("hidden");
  } else {
    currentUsername = "";
    if (usernameDisplay) usernameDisplay.classList.add("hidden");
    if (timerEl) timerEl.classList.add("hidden");
  }
  
  isHome = false;
  isPaused = false;
  homeEl.classList.add("hidden");
  menuEl.classList.add("hidden");
  igtSeconds = 0;
  runStartMs = performance.now();
  lastWallMs = runStartMs;
  loadLevel(0);
});

function update(dt) {
  // Always keep wall clock in sync to prevent big catch-up deltas after pause
  const nowMs = performance.now();
  const wallDelta = (nowMs - lastWallMs) / 1000;
  lastWallMs = nowMs;

  // Menu toggle
  if (input.menu) {
    // If still at home screen, ignore ESC; otherwise toggle compact in-game menu
    if (!isHome) {
      toggleMenu();
    }
    input.menu = false;
  }

  if (isPaused) {
    return;
  }

  // Timers (IGT only when unpaused)
  igtSeconds += wallDelta;

  if (input.reset) {
    resetLevel();
    input.reset = false;
  }

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.vx = dir * MOVE_SPEED;

  if (input.jump && player.onGround) {
    player.vy = -JUMP_VELOCITY;
  }

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt * 60;
  player.y += player.vy * dt * 60;

  resolveCollisions(player, LEVELS[currentLevelIndex].platforms);

  // Keep player inside the viewport
  player.x = Math.max(0, Math.min(player.x, WIDTH - player.w));
  player.y = Math.max(0, Math.min(player.y, HEIGHT - player.h));

  const exitBox = LEVELS[currentLevelIndex].exit;
  if (aabbIntersect(player, exitBox)) {
    const isLastLevel = currentLevelIndex === LEVELS.length - 1;
    if (isLastLevel) {
      // achievements removed
      isPaused = true;
      const finalIgt = igtSeconds;
      const finalRt = (performance.now() - runStartMs) / 1000;
      if (isSpeedrunMode) {
        saveLeaderboardEntry(currentUsername, finalIgt);
        renderLeaderboard();
        if (victoryIgtEl) victoryIgtEl.textContent = finalIgt.toFixed(2);
        if (victoryRtEl) victoryRtEl.textContent = finalRt.toFixed(2);
      } else {
        if (victoryIgtEl) victoryIgtEl.textContent = "";
        if (victoryRtEl) victoryRtEl.textContent = "";
      }
      victoryEl.classList.remove("hidden");
    } else {
      loadLevel(currentLevelIndex + 1);
      setStatus(`Level ${currentLevelIndex + 1}/${LEVELS.length}`);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background (black)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Platforms (white)
  ctx.fillStyle = "#ffffff";
  for (const p of LEVELS[currentLevelIndex].platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  // Exit (white outer, black inner)
  const ex = LEVELS[currentLevelIndex].exit;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.fillStyle = "#000000";
  ctx.fillRect(ex.x + 6, ex.y + 6, ex.w - 12, ex.h - 12);

  // Player (yellow rectangle with black eyes)
  ctx.fillStyle = "#ffd400";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#000000";
  ctx.fillRect(player.x + 10, player.y + 10, 6, 6);
  ctx.fillRect(player.x + 20, player.y + 10, 6, 6);
  ctx.fillRect(player.x + 12, player.y + 28, 12, 6);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  draw();

  // Update timers display (RT uses wall clock since run start; IGT accumulates only while unpaused)
  const rtSeconds = (performance.now() - runStartMs) / 1000;
  if (timerIgtEl) timerIgtEl.textContent = `IGT: ${igtSeconds.toFixed(2)}`;
  if (timerRtEl) timerRtEl.textContent = `RT: ${rtSeconds.toFixed(2)}`;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

function resizeCanvas() {
  // Keep internal canvas resolution fixed, but scale CSS size to fit viewport while preserving aspect ratio
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / WIDTH, vh / HEIGHT);
  const cssW = Math.round(WIDTH * scale);
  const cssH = Math.round(HEIGHT * scale);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('fullscreenchange', resizeCanvas);
resizeCanvas();

function toggleMenu(forceState) {
  const next = forceState !== undefined ? forceState : !isPaused;
  isPaused = next;
  // If entering menu while in-game, show compact panel; otherwise full panel
  if (!isHome) {
    menuEl.classList.toggle("hidden", !isPaused);
    const panel = menuEl.querySelector('.menu-panel');
    if (panel) panel.classList.toggle('compact', isPaused);
  } else {
    // if home, use homeEl
    homeEl.classList.toggle('hidden', !isPaused);
    menuEl.classList.add('hidden');
  }
}

if (resumeBtn) resumeBtn.addEventListener("click", () => toggleMenu(false));
if (restartBtn) restartBtn.addEventListener("click", () => {
  resetLevel();
  toggleMenu(false);
});
if (resetGameBtn) resetGameBtn.addEventListener("click", () => {
  loadLevel(0);
  igtSeconds = 0;
  runStartMs = performance.now();
  lastWallMs = runStartMs;
  toggleMenu(false);
});

if (homeBtn) homeBtn.addEventListener("click", () => {
  loadLevel(0);
  igtSeconds = 0;
  runStartMs = performance.now();
  lastWallMs = runStartMs;
  isHome = true;
  isPaused = true;
  currentUsername = "";
  if (usernameDisplay) usernameDisplay.classList.add("hidden");
  if (timerEl) timerEl.classList.add("hidden");
  renderLeaderboard();
  homeEl.classList.remove("hidden");
  menuEl.classList.add("hidden");
  victoryEl.classList.add("hidden");
});

if (victoryHomeBtn) victoryHomeBtn.addEventListener("click", () => {
  loadLevel(0);
  igtSeconds = 0;
  runStartMs = performance.now();
  lastWallMs = runStartMs;
  isHome = true;
  isPaused = true;
  currentUsername = "";
  if (usernameDisplay) usernameDisplay.classList.add("hidden");
  if (timerEl) timerEl.classList.add("hidden");
  renderLeaderboard();
  homeEl.classList.remove("hidden");
  menuEl.classList.add("hidden");
  victoryEl.classList.add("hidden");
});

// Fullscreen toggle: attach reliably when element exists
function attachFullscreenToggle() {
  const btn = document.getElementById("fullscreen-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    console.log('fullscreen button clicked');
    const target = document.getElementById('game') || document.documentElement;
    try {
      // If not fullscreen, request it on canvas first (better UX), otherwise exit
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFs) {
        if (target.requestFullscreen) await target.requestFullscreen();
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        else throw new Error('No requestFullscreen API');
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else throw new Error('No exitFullscreen API');
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
      // Helpful hint for debugging in console
      console.info('Document protocol:', location.protocol, 'Is secure context:', window.isSecureContext);
    }
  });
}

attachFullscreenToggle();
document.addEventListener("DOMContentLoaded", attachFullscreenToggle);

// Log fullscreen change events for diagnostics
document.addEventListener('fullscreenchange', () => {
  console.log('fullscreenchange ->', !!document.fullscreenElement);
});
document.addEventListener('webkitfullscreenchange', () => {
  console.log('webkitfullscreenchange ->', !!document.webkitFullscreenElement);
});

function applySettings() {
  document.body.classList.toggle("high-contrast", settings.highContrast);
  document.body.classList.toggle("reduced-motion", settings.reducedMotion);
  document.body.classList.toggle("large-text", settings.largeText);
  document.body.classList.toggle("bw", settings.bw);
  // canvas/filter handled via CSS class; ensure immediate repaint for accessibility
  if (settings.reducedMotion) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
}

// start paused with menu open
toggleMenu(true);
applySettings();
renderLeaderboard();

// Initialize timer as hidden (only shows if speedrun mode is enabled)
if (timerEl) timerEl.classList.add("hidden");
updateUsernameUI();

// Also run once when DOM is fully ready to catch any late elements
document.addEventListener("DOMContentLoaded", () => {
  updateUsernameUI();
});

// Version badge: persist and allow bumping patch number
function parseVersion(v) {
  if (!v) return [0,1,0];
  // accept 'v.0.1.0' or 'v0.1.0' or '0.1.0'
  v = String(v).trim();
  v = v.replace(/^v\.?/i, '');
  const parts = v.split('.').map(p => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0,3);
}

function formatVersion(parts) {
  return `v.${parts[0]}.${parts[1]}.${parts[2]}`;
}

function getStoredVersion() {
  return localStorage.getItem('srg-version') || 'v.0.1.0';
}

function setStoredVersion(ver) {
  localStorage.setItem('srg-version', ver);
}

function bumpVersion() {
  const cur = getStoredVersion();
  const parts = parseVersion(cur);
  parts[2] = (parts[2] || 0) + 1; // bump patch
  const nv = formatVersion(parts);
  const el = document.getElementById('version-display');
  if (el) el.textContent = nv;
  setStoredVersion(nv);
  return nv;
}

// Initialize version display and expose bump function
function initVersionBadge() {
  const el = document.getElementById('version-display');
  if (!el) return;
  const cur = getStoredVersion();
  el.textContent = cur;
  el.addEventListener('click', () => {
    const nv = bumpVersion();
    console.log('Version bumped to', nv);
  });
  // expose for programmatic use
  window.bumpVersion = bumpVersion;
}

initVersionBadge();

let simpleToggleAttached = false;
function attachSpeedrunToggle() {
  const toggle = document.getElementById("speedrun-toggle");
  const section = document.getElementById("username-section");
  const input = document.getElementById("username-input");
  const lockEl = document.getElementById("username-lock");
  const errEl = document.getElementById("username-error");
  const lockErrEl = document.getElementById("username-lock-error");
  if (!toggle || !section || !input) return;
  if (simpleToggleAttached) return;

  const handler = () => {
    if (toggle.checked) {
      section.classList.remove("hidden");
      section.style.display = 'block';
      input.disabled = false;
      if (lockEl) lockEl.classList.add("hidden");
      try { input.focus(); } catch (e) {}
    } else {
      section.classList.add("hidden");
      section.style.display = 'none';
      input.disabled = true;
      if (lockEl) lockEl.classList.remove("hidden");
    }
    if (errEl) errEl.classList.add("hidden");
    if (lockErrEl) lockErrEl.classList.add("hidden");
  };

  toggle.addEventListener("change", handler);
  handler();
  simpleToggleAttached = true;
}

// Attach immediately and also when DOM is ready (redundant-safe)
attachSpeedrunToggle();
document.addEventListener("DOMContentLoaded", () => attachSpeedrunToggle());
