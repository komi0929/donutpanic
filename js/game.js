// === Main Game Controller ===

const Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,

  // Grid
  tileSize: 0,
  offsetX: 0,
  offsetY: 0,
  grid: [],
  rows: 0,
  cols: 0,

  // Entities
  player: null,
  monsters: [],
  donuts: [],

  // State
  state: 'title', // title, playing, clear, gameover
  frame: 0,
  lastTime: 0,
  selectedDonut: null,
  placingDonut: false,

  // Timer & Ranking
  timerStart: 0,
  timerElapsed: 0,
  clearTime: 0,
  pendingRank: 0,
  rankingModalOpen: false,

  // Inventory
  inventory: { choco: 0, strawberry: 0, matcha: 0 },

  // Level
  currentLevel: 0,
  goalX: 0,
  goalY: 0,

  // Touch
  touchStartX: 0,
  touchStartY: 0,

  // Particles for celebration
  particles: [],

  // Panic effects
  _shakeOffsetX: 0,
  _shakeOffsetY: 0,
  _closestMonsterDist: Infinity,
  _reinforcementTimer: 0,
  _reinforcementLastTime: 0,

  /**
   * Initialize the game
   */
  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this._resizeCanvas();
    // Resize handling — listen to both window.resize and visualViewport for mobile
    window.addEventListener('resize', () => this._resizeCanvas());
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this._resizeCanvas());
    }

    // Touch events on canvas
    this.canvas.addEventListener('touchstart', (e) => this._onTouch(e), { passive: false });
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));

    // Donut button clicks
    document.querySelectorAll('.donut-btn').forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._selectDonut(btn.dataset.type);
      }, { passive: false });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._selectDonut(btn.dataset.type);
      });
    });

    // D-pad button events — hold to move continuously
    this._dpadInterval = null;
    this._dpadDir = null;
    const startDpad = (dir) => {
      this._stopDpad();
      this._dpadDir = dir;
      this._movePlayer(dir);
      this._dpadInterval = setInterval(() => {
        this._movePlayer(this._dpadDir);
      }, 120);
    };
    this._stopDpad = () => {
      if (this._dpadInterval) {
        clearInterval(this._dpadInterval);
        this._dpadInterval = null;
      }
      this._dpadDir = null;
    };
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startDpad(dir);
      }, { passive: false });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this._stopDpad();
      }, { passive: false });
      btn.addEventListener('touchcancel', () => this._stopDpad());
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDpad(dir);
      });
    });
    document.addEventListener('mouseup', () => this._stopDpad());
    document.addEventListener('mouseleave', () => this._stopDpad());

    // Ranking modal buttons
    // Ranking modal buttons
    const rankSaveBtn = document.getElementById('rank-save-btn');
    if (rankSaveBtn) rankSaveBtn.addEventListener('click', () => this._saveRanking());
    
    const rankSkipBtn = document.getElementById('rank-skip-btn');
    if (rankSkipBtn) rankSkipBtn.addEventListener('click', () => this._skipRanking());

    // Ranking list close button
    const rankListCloseBtn = document.getElementById('ranking-list-close-btn');
    if (rankListCloseBtn) rankListCloseBtn.addEventListener('click', () => this._hideRankingList());

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    document.body.addEventListener('contextmenu', e => e.preventDefault());

    // Initialize ranking system (Supabase or localStorage)
    Ranking.init();

    // Initialize sound effects
    SE.init();

    // Setup resize handler and initial size
    const resizeHandler = () => this._resizeCanvas();
    window.addEventListener('resize', resizeHandler);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeHandler);
    }
    this._resizeCanvas();

    // Start
    this.state = 'title';
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  },

  /**
   * Resize canvas to match its flex-allocated size
   */
  _resizeCanvas() {
    const container = document.getElementById('game-container');

    // Use visualViewport for accurate mobile height (accounts for browser chrome)
    if (window.visualViewport) {
      container.style.height = window.visualViewport.height + 'px';
    } else {
      container.style.height = window.innerHeight + 'px';
    }

    // Read the actual size the flex layout gave the canvas
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    // Fallback: if container or canvas has no size, set explicit dimensions
    if (this.width <= 0 || this.height <= 0) {
      this.width = Math.min(window.innerWidth, 500);
      this.height = window.innerHeight;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      console.warn('[DonutPanic] Zero-size canvas fallback:', this.width, 'x', this.height);
    }

    // Device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Calculate tile size for game grid
    if (this.rows > 0 && this.cols > 0) {
      const availableHeight = this.height - 40;
      const tileSizeW = Math.floor(this.width / this.cols);
      const tileSizeH = Math.floor(availableHeight / this.rows);
      this.tileSize = Math.min(tileSizeW, tileSizeH);
      this.offsetX = Math.floor((this.width - this.cols * this.tileSize) / 2);
      this.offsetY = Math.floor((availableHeight - this.rows * this.tileSize) / 2) + 38;
    }
  },

  /**
   * Load a level
   */
  _loadLevel(levelIndex) {
    const level = LEVELS[levelIndex];
    this.grid = level.grid.map(row => [...row]);
    this.rows = CONFIG.ROWS;
    this.cols = CONFIG.COLS;

    // Reset
    this.player = null;
    this.monsters = [];
    this.donuts = [];
    this.selectedDonut = null;
    this.placingDonut = false;
    this.particles = [];

    // Deep copy inventory
    this.inventory = { ...level.donuts };

    // Parse grid
    let monsterIndex = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.grid[y][x];
        if (tile === CONFIG.TILE.PLAYER_START) {
          this.player = new Player(x, y);
          this.grid[y][x] = CONFIG.TILE.FLOOR;
        } else if (tile === CONFIG.TILE.MONSTER_START) {
          this.monsters.push(new Monster(x, y, monsterIndex++, false));
          this.grid[y][x] = CONFIG.TILE.FLOOR;
        } else if (tile === CONFIG.TILE.DASH_MONSTER_START) {
          this.monsters.push(new Monster(x, y, monsterIndex++, true));
          this.grid[y][x] = CONFIG.TILE.FLOOR;
        } else if (tile === CONFIG.TILE.GOAL) {
          this.goalX = x;
          this.goalY = y;
        }
      }
    }

    // Recalculate layout
    this._resizeCanvas();

    // Update UI
    this._updateUI();
  },

  /**
   * Update the inventory UI
   */
  _updateUI() {
    document.getElementById('donut-remaining').textContent = this.inventory.strawberry;

    // Disable button with 0 count
    const btn = document.getElementById('btn-strawberry');
    if (this.inventory.strawberry <= 0) {
      btn.classList.add('disabled');
    } else {
      btn.classList.remove('disabled');
    }

    // Render donut icon on button canvas (same sprite as in-game)
    const btnCanvas = document.getElementById('donut-btn-canvas');
    if (btnCanvas) {
      const bctx = btnCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      btnCanvas.width = 50 * dpr;
      btnCanvas.height = 50 * dpr;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, 50, 50);
      Sprites.drawDonut(bctx, 1, 1, 48, 'strawberry');
    }
  },

  /**
   * Select a donut type from the action bar → immediately place at player position
   */
  _selectDonut(type) {
    if (this.state !== 'playing') return;
    if (this.inventory[type] <= 0) return;
    if (!this.player) return;

    // Place donut at player's current grid position
    const gridX = this.player.gridX;
    const gridY = this.player.gridY;

    // Check if there's already a donut here
    for (const d of this.donuts) {
      if (d.active && d.gridX === gridX && d.gridY === gridY) return;
    }

    // Place donut
    this.donuts.push(new Donut(gridX, gridY, type));
    this.inventory[type]--;
    this._updateUI();
    SE.donutPlace();

    // Brief highlight animation on button
    const btn = document.getElementById('btn-' + type);
    btn.classList.add('selected');
    setTimeout(() => btn.classList.remove('selected'), 300);
  },

  /**
   * Handle touch on canvas
   */
  _onTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this._handleTap(x, y);
  },

  /**
   * Handle mouse click (for desktop testing)
   */
  _onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this._handleTap(x, y);
  },

  /**
   * Process a tap on screen (state transitions only)
   */
  _handleTap(screenX, screenY) {
    if (this.rankingModalOpen) return; // Block taps while modal is open
    if (this.rankingListOpen) return; // Block taps while ranking list is open

    if (this.state === 'title') {
      SE.resume(); // Resume AudioContext

      // Check for ranking tap (y around 0.54h)
      const cx = this.width / 2;
      const rankY = this.height * 0.54;
      if (Math.abs(screenY - rankY) < 35 && Math.abs(screenX - cx) < 100) {
        this._showRankingList();
        SE.click();
        return;
      }

      SE.gameStart();
      this._loadLevel(this.currentLevel);
      this._reinforcementLastTime = performance.now();
      this.state = 'playing';
      this.timerStart = performance.now();
      this.timerElapsed = 0;
      // Show game controls
      document.getElementById('controls-panel').style.display = '';
      document.getElementById('site-footer').classList.add('hidden');
      // Recalculate canvas size
      setTimeout(() => this._resizeCanvas(), 0);
      return;
    }

    if (this.state === 'clear' || this.state === 'gameover') {
      this.state = 'title';
      this._titleMonsters = null;
      // Hide controls
      document.getElementById('controls-panel').style.display = 'none';
      document.getElementById('site-footer').classList.remove('hidden');
      // Recalculate canvas size
      setTimeout(() => this._resizeCanvas(), 0);
      // Refresh rankings for title screen
      Ranking.preloadRankings();
      return;
    }
  },

  /**
   * Handle level clear — check ranking
   */
  async _onClear() {
    // Refresh cache before checking rank (fetch latest from Supabase)
    await Ranking.preloadRankings();
    const rank = Ranking.checkRank(this.clearTime);
    this.pendingRank = rank;
    if (rank > 0 && rank <= 10) {
      // Show ranking modal
      document.getElementById('rank-display').textContent = `第 ${rank} 位！`;
      document.getElementById('rank-time-display').textContent = Ranking.formatTime(this.clearTime);
      document.getElementById('rank-name-input').value = '';

      // Build animated ranking visualization
      this._buildRankAnimation(rank);

      document.getElementById('ranking-modal').style.display = 'flex';
      this.rankingModalOpen = true;
      SE.rankIn();
    }
  },

  /**
   * Build the animated ranking list showing all 10 slots with player highlighted
   */
  _buildRankAnimation(playerRank) {
    const container = document.getElementById('rank-animation-list');
    container.innerHTML = '';

    // Get current rankings and insert player entry
    const existingRankings = Ranking.getDailyRanking().slice(); // clone
    const entries = [];

    // Build the display list: insert player at their rank position
    for (let i = 0; i < 10; i++) {
      const displayRank = i + 1;
      if (displayRank === playerRank) {
        // This is where the player slots in
        entries.push({
          rank: displayRank,
          name: '▶ あなた',
          time: Ranking.formatTime(this.clearTime),
          isPlayer: true,
        });
      } else if (displayRank < playerRank) {
        // Entries above player — use existing ranking as-is
        const entry = existingRankings[i];
        entries.push({
          rank: displayRank,
          name: entry ? entry.name : '---',
          time: entry ? Ranking.formatTime(entry.time) : '--:--.--',
          isPlayer: false,
        });
      } else {
        // Entries below player — shifted down by 1
        const entry = existingRankings[i - 1];
        entries.push({
          rank: displayRank,
          name: entry ? entry.name : '---',
          time: entry ? Ranking.formatTime(entry.time) : '--:--.--',
          isPlayer: false,
        });
      }
    }

    // Create DOM elements with staggered animation
    entries.forEach((entry, idx) => {
      const div = document.createElement('div');
      div.className = 'rank-entry' + (entry.isPlayer ? ' is-player' : '');
      div.style.animationDelay = (idx * 0.08) + 's';
      div.innerHTML = `
        <span class="rank-num">${entry.rank}</span>
        <span class="rank-name">${entry.name}</span>
        <span class="rank-time">${entry.time}</span>
      `;
      container.appendChild(div);
    });

    // Auto-scroll to player entry after animation
    setTimeout(() => {
      const playerEntry = container.querySelector('.is-player');
      if (playerEntry) {
        playerEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, playerRank * 80 + 200);
  },

  async _saveRanking() {
    const name = document.getElementById('rank-name-input').value.trim() || 'ななし';
    // Disable buttons to prevent double-tap
    document.getElementById('rank-save-btn').disabled = true;
    document.getElementById('rank-skip-btn').disabled = true;
    await Ranking.addEntry(name, this.clearTime, this.currentLevel);
    document.getElementById('rank-save-btn').disabled = false;
    document.getElementById('rank-skip-btn').disabled = false;
    document.getElementById('ranking-modal').style.display = 'none';
    this.rankingModalOpen = false;
  },

  _skipRanking() {
    document.getElementById('ranking-modal').style.display = 'none';
    this.rankingModalOpen = false;
  },

  /**
   * Move player one tile in a direction via D-pad
   */
  _movePlayer(dir) {
    if (this.state !== 'playing') return;
    if (!this.player) return;
    if (this.player.moving) return; // Wait for current move to finish

    let nx = this.player.gridX;
    let ny = this.player.gridY;

    if (dir === 'up') ny--;
    else if (dir === 'down') ny++;
    else if (dir === 'left') nx--;
    else if (dir === 'right') nx++;

    // Bounds check
    if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) return;
    // Wall check
    if (this.grid[ny][nx] === CONFIG.TILE.WALL) return;
    // Sleeping monster check
    for (const m of this.monsters) {
      if (m.state === 'sleep' && m.gridX === nx && m.gridY === ny) return;
    }

    // Move player one tile
    this.player.setTarget(nx, ny, this.grid, this.rows, this.cols);
    SE.move();
  },

  /**
   * Main game loop
   */
  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Cap dt
    this.lastTime = timestamp;
    this.frame++;

    if (this.state === 'playing') {
      this._update(dt);
      // Update timer
      this.timerElapsed = (performance.now() - this.timerStart) / 1000;
    }

    this._draw();

    requestAnimationFrame((t) => this._loop(t));
  },

  /**
   * Update game logic
   */
  _update(dt) {
    // Update player
    this.player.update(dt);

    // Update donuts
    for (const donut of this.donuts) {
      donut.update();
    }

    // Update monsters
    for (const monster of this.monsters) {
      if (monster.state !== 'sleep') {
        monster.update(dt, this.grid, this.player, this.donuts, this.monsters, this.rows, this.cols);
      }
    }

    // Clean up expired donuts — release reservations
    for (const donut of this.donuts) {
      if (!donut.active && donut.reservedBy !== null) {
        donut.reservedBy = null;
      }
    }

    // Calculate closest active monster distance for panic effects
    this._closestMonsterDist = Infinity;
    for (const monster of this.monsters) {
      if (monster.state === 'sleep' || monster.state === 'eating') continue;
      const dist = gridDistance(monster.gridX, monster.gridY, this.player.gridX, this.player.gridY);
      if (dist < this._closestMonsterDist) {
        this._closestMonsterDist = dist;
      }
    }

    // Heartbeat SE based on proximity
    if (this._closestMonsterDist <= 5) {
      const rate = 1 - (this._closestMonsterDist - 1) / 4; // 1.0 at dist=1, 0.0 at dist=5
      SE.heartbeat(Math.max(0, Math.min(1, rate)));
    }

    // Screen shake when monster is close (distance <= 3)
    if (this._closestMonsterDist <= 3) {
      const intensity = (3 - this._closestMonsterDist) / 3; // 0→1
      this._shakeOffsetX = (Math.random() - 0.5) * intensity * 6;
      this._shakeOffsetY = (Math.random() - 0.5) * intensity * 6;
    } else {
      this._shakeOffsetX = 0;
      this._shakeOffsetY = 0;
    }

    // Reinforcement spawning
    if (!this._reinforcementLastTime) {
      this._reinforcementLastTime = performance.now();
    }
    const timeSinceLastReinforcement = performance.now() - this._reinforcementLastTime;
    if (timeSinceLastReinforcement >= CONFIG.REINFORCEMENT_INTERVAL) {
      this._reinforcementLastTime = performance.now();
      const activeMonsters = this.monsters.filter(m => m.state !== 'sleep').length;
      if (activeMonsters < CONFIG.REINFORCEMENT_MAX_MONSTERS) {
        this._spawnReinforcement();
      }
    }

    // Check win condition: player reached goal
    if (this.player.gridX === this.goalX && this.player.gridY === this.goalY) {
      this.clearTime = this.timerElapsed;
      this.state = 'clear';
      SE.clear();
      this._spawnCelebration();
      this._onClear();
    }

    // Check lose condition: monster catches player
    for (const monster of this.monsters) {
      if (monster.state === 'sleep') continue;
      if (monster.state === 'eating') continue;
      if (monster.gridX === this.player.gridX && monster.gridY === this.player.gridY) {
        this.state = 'gameover';
        this.player.alive = false;
        SE.gameOver();
      }
    }

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      return p.life > 0;
    });
  },

  /**
   * Spawn celebration particles
   */
  _spawnCelebration() {
    const cx = this.offsetX + this.goalX * this.tileSize + this.tileSize / 2;
    const cy = this.offsetY + this.goalY * this.tileSize + this.tileSize / 2;
    const colors = ['#FF69B4', '#FFD700', '#FF6347', '#00CED1', '#9370DB', '#FF8C00'];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * -12 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        life: Math.random() * 60 + 40,
      });
    }
  },

  /**
   * Spawn a reinforcement monster at a random floor tile
   */
  _spawnReinforcement() {
    // Find all floor tiles not occupied by player, monsters, donuts, or goal
    const candidates = [];
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cols - 1; x++) {
        if (this.grid[y][x] !== CONFIG.TILE.FLOOR) continue;
        if (x === this.goalX && y === this.goalY) continue;
        if (this.player && this.player.gridX === x && this.player.gridY === y) continue;
        // Not too close to player (at least 4 tiles away)
        if (this.player && gridDistance(x, y, this.player.gridX, this.player.gridY) < 4) continue;
        let occupied = false;
        for (const m of this.monsters) {
          if (m.gridX === x && m.gridY === y) { occupied = true; break; }
        }
        if (occupied) continue;
        candidates.push({ x, y });
      }
    }
    if (candidates.length === 0) return;

    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    // 30% chance of dash monster
    const isDash = Math.random() < 0.3;
    const monsterIndex = this.monsters.length;
    this.monsters.push(new Monster(pos.x, pos.y, monsterIndex, isDash));
    SE.reinforcement();

    // Spawn particles at location
    const cx = this.offsetX + pos.x * this.tileSize + this.tileSize / 2;
    const cy = this.offsetY + pos.y * this.tileSize + this.tileSize / 2;
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color: isDash ? '#FF4444' : '#9B59B6',
        size: 2 + Math.random() * 3,
        life: 30 + Math.random() * 20,
      });
    }
  },

  /**
   * Draw everything
   */
  _draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, w, h);

    if (this.state === 'title') {
      this._drawTitle();
      return;
    }

    // Apply screen shake during playing state
    if (this.state === 'playing') {
      ctx.save();
      ctx.translate(this._shakeOffsetX, this._shakeOffsetY);
    }

    // Draw grid
    this._drawGrid();

    // Draw donuts
    for (const donut of this.donuts) {
      donut.draw(ctx, this.tileSize, this.offsetX, this.offsetY);
    }

    // Draw player
    if (this.player) {
      this.player.draw(ctx, this.tileSize, this.offsetX, this.offsetY);
    }

    // Draw monsters
    for (const monster of this.monsters) {
      monster.draw(ctx, this.tileSize, this.offsetX, this.offsetY);
    }

    // (donut placement hints removed — donuts placed at player position)

    // Draw particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / 100;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // === FOG OF WAR ===
    if (this.state === 'playing' && this.player) {
      const fogCx = this.offsetX + this.player.pixelX * this.tileSize + this.tileSize / 2;
      const fogCy = this.offsetY + this.player.pixelY * this.tileSize + this.tileSize / 2;
      const fogRadius = this.tileSize * 3.5;
      const fogGrad = ctx.createRadialGradient(fogCx, fogCy, fogRadius * 0.6, fogCx, fogCy, fogRadius * 1.8);
      fogGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fogGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // === RED ALERT VIGNETTE ===
    if (this.state === 'playing' && this._closestMonsterDist <= 2) {
      const alertIntensity = (2 - this._closestMonsterDist) / 2; // 0→1
      const pulse = Math.sin(this.frame * 0.15) * 0.3 + 0.7;
      ctx.save();
      ctx.globalAlpha = alertIntensity * pulse * 0.4;
      // Draw red vignette on edges
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
      vigGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
      vigGrad.addColorStop(1, 'rgba(255, 0, 0, 1)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Draw HUD (timer, stage name)
    this._drawHUD();

    // Remove screen shake offset
    if (this.state === 'playing') {
      ctx.restore();
    }

    // Draw overlay screens
    if (this.state === 'clear') {
      this._drawClearScreen();
    } else if (this.state === 'gameover') {
      this._drawGameOverScreen();
    }
  },

  /**
   * Draw the title screen
   */
  // Title screen monsters for animation
  _titleMonsters: null,
  _initTitleMonsters() {
    if (this._titleMonsters) return;
    this._titleMonsters = [];
    for (let i = 0; i < 5; i++) {
      this._titleMonsters.push({
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.35 + 0.08,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0006,
        index: i % 3,
        size: 50 + Math.random() * 20,
      });
    }
  },

  /**
   * Draw in-game HUD (timer top-right, stage name top-left)
   */
  _drawHUD() {
    if (this.state !== 'playing') return;
    const ctx = this.ctx;
    const w = this.width;
    const pad = 12;

    // Semi-transparent top bar background
    ctx.fillStyle = 'rgba(26, 10, 46, 0.7)';
    ctx.fillRect(0, 0, w, 36);

    ctx.textBaseline = 'middle';

    // Stage name — top left
    ctx.textAlign = 'left';
    ctx.fillStyle = '#CCBBDD';
    ctx.font = '13px "M PLUS Rounded 1c", sans-serif';
    const level = LEVELS[this.currentLevel];
    ctx.fillText(level ? level.name : '', pad, 18);

    // Timer — top right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('⏱ ' + Ranking.formatTime(this.timerElapsed), w - pad, 18);

    ctx.textAlign = 'left';
  },

  _drawTitle() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;

    // Init title monsters
    this._initTitleMonsters();

    // Animated background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.3, '#2d1b4e');
    gradient.addColorStop(0.7, '#3d2060');
    gradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Animated roaming monsters in background
    for (const m of this._titleMonsters) {
      m.x += m.vx;
      m.y += m.vy;
      if (m.x < 0.05 || m.x > 0.95) m.vx *= -1;
      if (m.y < 0.05 || m.y > 0.55) m.vy *= -1;
      if (Math.random() < 0.005) {
        m.vx = (Math.random() - 0.5) * 0.001;
        m.vy = (Math.random() - 0.5) * 0.0008;
      }
      const mx = m.x * w;
      const my = m.y * h;
      ctx.globalAlpha = 0.5;
      Sprites.drawMonster(ctx, mx - m.size / 2, my - m.size / 2, m.size, 'normal', this.frame + m.index * 30, m.index);
      ctx.globalAlpha = 1;
    }


    // === Rich Title ===
    const bounce = Math.sin(this.frame * 0.05) * 5;
    const titleY = h * 0.35 + bounce;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.min(44, w * 0.11);
    ctx.font = `900 ${fontSize}px "M PLUS Rounded 1c", sans-serif`;

    // Glow layers
    ctx.save();
    const glowPulse = Math.sin(this.frame * 0.04) * 0.3 + 0.7;
    ctx.shadowColor = '#FF69B4';
    ctx.shadowBlur = 20 * glowPulse;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Outer stroke
    ctx.strokeStyle = 'rgba(255, 100, 180, 0.6)';
    ctx.lineWidth = 6;
    ctx.strokeText('ドーナツパニック', cx, titleY);

    // Gradient fill
    const titleGrad = ctx.createLinearGradient(cx - 160, titleY - 30, cx + 160, titleY + 30);
    titleGrad.addColorStop(0, '#FF69B4');
    titleGrad.addColorStop(0.3, '#FFD700');
    titleGrad.addColorStop(0.6, '#FF6347');
    titleGrad.addColorStop(1, '#FF69B4');
    ctx.fillStyle = titleGrad;
    ctx.fillText('ドーナツパニック', cx, titleY);

    // Inner white highlight stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeText('ドーナツパニック', cx, titleY);
    ctx.restore();


    // === Single instruction ===
    ctx.font = 'bold 18px "M PLUS Rounded 1c", sans-serif';
    ctx.fillStyle = '#CCBBDD';
    ctx.fillText('🍩 ドーナツでモンスターを誘惑！', cx, h * 0.48);

    // Ranking Link (Text-only, borderless, directly below instruction)
    ctx.font = 'bold 14px "M PLUS Rounded 1c", sans-serif';
    ctx.fillStyle = 'rgba(255, 220, 180, 0.6)';
    ctx.fillText('🏆 本日のランキング', cx, h * 0.54);

    // Start prompt
    const startY = h * 0.72;
    const alpha = Math.sin(this.frame * 0.08) * 0.4 + 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('タップしてスタート', cx, startY);
    ctx.globalAlpha = 1;
  },

  /**
   * Show the daily ranking list modal
   */
  _showRankingList() {
    this.rankingListOpen = true;
    const rankings = Ranking.getDailyRanking();
    const body = document.getElementById('ranking-list-body');
    if (rankings.length === 0) {
      body.innerHTML = '<div style="color:#CCBBDD; padding:20px 0; font-size:14px;">まだ記録がありません</div>';
    } else {
      let html = '<div class="ranking-list-table">';
      const maxShow = Math.min(rankings.length, 10);
      for (let i = 0; i < maxShow; i++) {
        const r = rankings[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const highlight = i < 3 ? ' style="color:#FFD700"' : ' style="color:#CCBBDD"';
        html += `<div class="ranking-list-row"${highlight}>${medal} ${r.name}　${Ranking.formatTime(r.time)}</div>`;
      }
      html += '</div>';
      body.innerHTML = html;
    }
    document.getElementById('ranking-list-modal').style.display = '';
  },

  /**
   * Hide the ranking list modal
   */
  _hideRankingList() {
    this.rankingListOpen = false;
    document.getElementById('ranking-list-modal').style.display = 'none';
  },

  /**
   * Draw the game grid
   */
  _drawGrid() {
    const ctx = this.ctx;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const drawX = this.offsetX + x * this.tileSize;
        const drawY = this.offsetY + y * this.tileSize;
        const tile = this.grid[y][x];

        if (tile === CONFIG.TILE.WALL) {
          Sprites.drawWallTile(ctx, drawX, drawY, this.tileSize);
        } else if (tile === CONFIG.TILE.GOAL) {
          Sprites.drawFloorTile(ctx, drawX, drawY, this.tileSize, (x + y) % 2 === 0);
          Sprites.drawGoal(ctx, drawX, drawY, this.tileSize, this.frame);
        } else {
          Sprites.drawFloorTile(ctx, drawX, drawY, this.tileSize, (x + y) % 2 === 0);
        }
      }
    }
  },

  // _drawPlacementHints removed: donuts placed at player position via button tap

  /**
   * Draw clear screen
   */
  _drawClearScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('🎉 ステージクリア！ 🎉', cx, this.height * 0.35);

    // Show clear time
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('⏱ ' + Ranking.formatTime(this.clearTime), cx, this.height * 0.45);

    ctx.fillStyle = '#CCBBDD';
    ctx.font = '16px "M PLUS Rounded 1c", sans-serif';
    if (this.pendingRank > 0) {
      ctx.fillStyle = '#FF69B4';
      ctx.fillText(`🏆 第 ${this.pendingRank} 位にランクイン！`, cx, this.height * 0.52);
    } else {
      ctx.fillText('おめでとうございます！', cx, this.height * 0.52);
    }

    if (!this.rankingModalOpen) {
      const alpha = Math.sin(this.frame * 0.08) * 0.4 + 0.6;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFCC88';
      ctx.font = '16px "M PLUS Rounded 1c", sans-serif';
      ctx.fillText('タップしてタイトルに戻る', cx, this.height * 0.62);
      ctx.globalAlpha = 1;
    }
  },

  /**
   * Draw game over screen
   */
  _drawGameOverScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(80, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 38px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('💀 ゲームオーバー 💀', this.width / 2, this.height * 0.4);

    ctx.fillStyle = '#FFCCCC';
    ctx.font = '18px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('モンスターに捕まった！', this.width / 2, this.height * 0.5);

    const alpha = Math.sin(this.frame * 0.08) * 0.4 + 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFAA88';
    ctx.font = '16px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('タップしてリトライ', this.width / 2, this.height * 0.6);
    ctx.globalAlpha = 1;
  },
};

// === Start the game when DOM is ready ===
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
