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

  /**
   * Initialize the game
   */
  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());

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
    document.getElementById('rank-save-btn').addEventListener('click', () => this._saveRanking());
    document.getElementById('rank-skip-btn').addEventListener('click', () => this._skipRanking());

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    document.body.addEventListener('contextmenu', e => e.preventDefault());

    // Initialize ranking system (Supabase or localStorage)
    Ranking.init();

    // Start
    this.state = 'title';
    document.getElementById('status-bar').style.display = 'none';
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  },

  /**
   * Resize canvas to fill screen
   */
  _resizeCanvas() {
    const container = document.getElementById('game-container');
    const actionBar = document.getElementById('action-bar');
    const abHeight = actionBar ? actionBar.offsetHeight : 80;

    this.width = container.clientWidth;
    this.height = container.clientHeight;

    // Device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Calculate tile size
    if (this.rows > 0 && this.cols > 0) {
      const availableHeight = this.height - abHeight - 20;
      const tileSizeW = Math.floor(this.width / this.cols);
      const tileSizeH = Math.floor(availableHeight / this.rows);
      this.tileSize = Math.min(tileSizeW, tileSizeH);
      this.offsetX = Math.floor((this.width - this.cols * this.tileSize) / 2);
      this.offsetY = Math.floor((availableHeight - this.rows * this.tileSize) / 2) + 10;
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
          this.monsters.push(new Monster(x, y, monsterIndex++));
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

    // Update level info text
    document.getElementById('level-info').textContent = level.name;
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

    if (this.state === 'title') {
      this._loadLevel(this.currentLevel);
      this.state = 'playing';
      this.timerStart = performance.now();
      this.timerElapsed = 0;
      document.getElementById('status-bar').style.display = '';
      return;
    }

    if (this.state === 'clear' || this.state === 'gameover') {
      this.state = 'title';
      this._titleMonsters = null;
      document.getElementById('status-bar').style.display = 'none';
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
      document.getElementById('ranking-modal').style.display = 'flex';
      this.rankingModalOpen = true;
    }
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
      // Update timer display
      this.timerElapsed = (performance.now() - this.timerStart) / 1000;
      document.getElementById('timer-display').textContent = '⏱ ' + Ranking.formatTime(this.timerElapsed);
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

    // Check win condition: player reached goal
    if (this.player.gridX === this.goalX && this.player.gridY === this.goalY) {
      this.clearTime = this.timerElapsed;
      this.state = 'clear';
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
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

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
      // Move
      m.x += m.vx;
      m.y += m.vy;
      // Bounce off edges
      if (m.x < 0.05 || m.x > 0.95) m.vx *= -1;
      if (m.y < 0.05 || m.y > 0.45) m.vy *= -1;
      // Randomly change direction
      if (Math.random() < 0.005) {
        m.vx = (Math.random() - 0.5) * 0.001;
        m.vy = (Math.random() - 0.5) * 0.0008;
      }

      const mx = m.x * w;
      const my = m.y * h;
      ctx.globalAlpha = 0.6;
      Sprites.drawMonster(ctx, mx - m.size / 2, my - m.size / 2, m.size, 'normal', this.frame + m.index * 30, m.index);
      ctx.globalAlpha = 1;
    }

    // Dark overlay for text readability
    const overlay = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.55);
    overlay.addColorStop(0, 'rgba(26, 10, 46, 0)');
    overlay.addColorStop(0.5, 'rgba(26, 10, 46, 0.85)');
    overlay.addColorStop(1, 'rgba(26, 10, 46, 0.6)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h * 0.35, w, h * 0.25);

    // Title
    const bounce = Math.sin(this.frame * 0.05) * 5;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = 'bold 38px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('ドーナツパニック', cx + 2, h * 0.42 + bounce + 2);

    // Title text — katakana with flair
    const titleGrad = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0);
    titleGrad.addColorStop(0, '#FF69B4');
    titleGrad.addColorStop(0.5, '#FFD700');
    titleGrad.addColorStop(1, '#FF6347');
    ctx.fillStyle = titleGrad;
    ctx.fillText('ドーナツパニック', cx, h * 0.42 + bounce);

    // Donut emoji accents
    ctx.font = '30px sans-serif';
    ctx.fillText('🍩', cx - 180, h * 0.42 + bounce);
    ctx.fillText('🍩', cx + 180, h * 0.42 + bounce);

    // Instructions
    ctx.fillStyle = '#CCBBDD';
    ctx.font = '14px "M PLUS Rounded 1c", sans-serif';
    const instructions = [
      '🎯 パティシエをケーキの家へ導こう！',
      '🍩 ドーナツボタンでモンスターを誘惑',
      '💤 食べたモンスターは眠って壁になる',
      '🕹️ 十字キーで移動',
    ];
    instructions.forEach((text, i) => {
      ctx.fillText(text, cx, h * 0.55 + i * 26);
    });

    // === Weekly Ranking ===
    const rankings = Ranking.getWeeklyRanking();
    if (rankings.length > 0) {
      const rankY = h * 0.66;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px "M PLUS Rounded 1c", sans-serif';
      ctx.fillText('🏆 今週のランキング', cx, rankY);

      ctx.font = '12px "M PLUS Rounded 1c", sans-serif';
      const maxShow = Math.min(rankings.length, 5);
      for (let i = 0; i < maxShow; i++) {
        const r = rankings[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        ctx.fillStyle = i < 3 ? '#FFD700' : '#CCBBDD';
        ctx.fillText(`${medal} ${r.name}  ${Ranking.formatTime(r.time)}`, cx, rankY + 20 + i * 18);
      }
    }

    // Start prompt
    const startY = rankings.length > 0 ? h * 0.82 : h * 0.78;
    const alpha = Math.sin(this.frame * 0.08) * 0.4 + 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText('タップしてスタート', cx, startY);
    ctx.globalAlpha = 1;

    // Draw chef at bottom
    Sprites.drawChef(ctx, cx - 35, h * 0.88, 70, this.frame);
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
