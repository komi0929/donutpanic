// === Monster AI with State Machine ===

let _monsterIdCounter = 0;

class Monster {
  constructor(gridX, gridY, index) {
    this.id = _monsterIdCounter++;
    this.index = index; // For color variation
    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelX = gridX;
    this.pixelY = gridY;
    this.state = 'patrol'; // patrol, chase, lured, eating, sleep
    this.path = [];
    this.pathIndex = 0;
    this.frame = 0;
    this.patrolTimer = 0;
    this.patrolTarget = null;
    this.eatTimer = 0;
    this.targetDonut = null;
    this.alertTimer = 0;   // Show "!" for a brief moment
    this.effectType = null; // 'alert', 'heart', 'zzz'
    this.isWalkable = true;
  }

  /**
   * Main update loop
   */
  update(dt, grid, player, donuts, monsters, rows, cols) {
    this.frame++;

    switch (this.state) {
      case 'patrol':
        this._updatePatrol(dt, grid, player, donuts, rows, cols);
        break;
      case 'chase':
        this._updateChase(dt, grid, player, donuts, rows, cols);
        break;
      case 'lured':
        this._updateLured(dt, grid, rows, cols);
        break;
      case 'eating':
        this._updateEating(dt, grid);
        break;
      case 'sleep':
        // Do nothing - permanent obstacle
        this.effectType = 'zzz';
        break;
    }
  }

  /**
   * PATROL state: Random movement, check for player sight & donut lure
   */
  _updatePatrol(dt, grid, player, donuts, rows, cols) {
    this.effectType = null;

    // Check for donuts in range first (higher priority)
    const luredDonut = this._findNearbyDonut(donuts);
    if (luredDonut) {
      this._transitionToLured(luredDonut, grid, rows, cols);
      return;
    }

    // Check for player in line of sight
    if (this._canSeePlayer(player, grid, rows, cols)) {
      this.state = 'chase';
      return;
    }

    // Random patrol movement
    this.patrolTimer += dt * 1000;
    if (this.patrolTimer >= CONFIG.PATROL_CHANGE_DIR_INTERVAL || !this.patrolTarget || 
        (this.gridX === this.patrolTarget.x && this.gridY === this.patrolTarget.y)) {
      this.patrolTimer = 0;
      this._pickRandomPatrolTarget(grid, rows, cols);
    }

    this._moveAlongPath(dt, CONFIG.MONSTER_SPEED);
  }

  /**
   * CHASE state: Pursue the player
   */
  _updateChase(dt, grid, player, donuts, rows, cols) {
    this.effectType = null;

    // Check for donuts (higher priority than chasing)
    const luredDonut = this._findNearbyDonut(donuts);
    if (luredDonut) {
      this._transitionToLured(luredDonut, grid, rows, cols);
      return;
    }

    // If lost sight, go back to patrol
    if (!this._canSeePlayer(player, grid, rows, cols)) {
      this.state = 'patrol';
      this.patrolTimer = CONFIG.PATROL_CHANGE_DIR_INTERVAL; // Force new direction
      return;
    }

    // Recalculate path to player every 10 frames
    if (this.frame % 10 === 0) {
      this.path = findPath(grid, this.gridX, this.gridY, player.gridX, player.gridY, rows, cols);
      this.pathIndex = 0;
    }

    this._moveAlongPath(dt, CONFIG.MONSTER_CHASE_SPEED);
  }

  /**
   * LURED state: Moving toward a donut
   */
  _updateLured(dt, grid, rows, cols) {
    this.effectType = 'alert';

    if (!this.targetDonut || !this.targetDonut.active) {
      // Donut was removed or eaten by another monster
      this.state = 'patrol';
      this.targetDonut = null;
      this.effectType = null;
      return;
    }

    // Check if arrived at donut
    if (this.gridX === this.targetDonut.gridX && this.gridY === this.targetDonut.gridY) {
      this._transitionToEating();
      return;
    }

    // Recalculate path occasionally
    if (this.frame % 15 === 0) {
      this.path = findPath(grid, this.gridX, this.gridY, this.targetDonut.gridX, this.targetDonut.gridY, rows, cols);
      this.pathIndex = 0;
    }

    this._moveAlongPath(dt, CONFIG.MONSTER_SPEED);
  }

  /**
   * EATING state: Consuming donut
   */
  _updateEating(dt, grid) {
    this.effectType = 'heart';
    this.eatTimer -= dt * 1000;

    if (this.eatTimer <= 0) {
      // Done eating → Sleep
      this._transitionToSleep(grid);
    }
  }

  /**
   * Transition to LURED
   */
  _transitionToLured(donut, grid, rows, cols) {
    this.state = 'lured';
    this.targetDonut = donut;
    donut.reservedBy = this.id;
    this.effectType = 'alert';
    this.alertTimer = 60; // Show alert for ~1 second
    this.path = findPath(grid, this.gridX, this.gridY, donut.gridX, donut.gridY, rows, cols);
    this.pathIndex = 0;
  }

  /**
   * Transition to EATING
   */
  _transitionToEating() {
    this.state = 'eating';
    this.effectType = 'heart';
    
    if (this.targetDonut) {
      this.eatTimer = this.targetDonut.getEatDuration();
      
      // If donut causes instant sleep → reduce eat time drastically
      if (this.targetDonut.causesInstantSleep()) {
        this.eatTimer = 500; // Very quick
      }
      
      this.targetDonut.active = false; // Donut consumed
    } else {
      this.eatTimer = CONFIG.DEFAULT_EAT_DURATION;
    }
  }

  /**
   * Transition to SLEEP (permanent obstacle)
   */
  _transitionToSleep(grid) {
    this.state = 'sleep';
    this.isWalkable = false;
    this.effectType = 'zzz';
    this.targetDonut = null;
    
    // Mark this tile as unwalkable in the grid
    grid[this.gridY][this.gridX] = CONFIG.TILE.WALL;
  }

  /**
   * Find a nearby donut within lure radius
   */
  _findNearbyDonut(donuts) {
    let closest = null;
    let closestDist = Infinity;

    for (const donut of donuts) {
      if (!donut.active) continue;
      if (donut.reservedBy !== null && donut.reservedBy !== this.id) continue;

      const dist = gridDistance(this.gridX, this.gridY, donut.gridX, donut.gridY);
      const lureRadius = donut.getLureRadius();

      if (dist <= lureRadius && dist < closestDist) {
        closest = donut;
        closestDist = dist;
      }
    }

    return closest;
  }

  /**
   * Check if player is within line of sight
   */
  _canSeePlayer(player, grid, rows, cols) {
    const dist = gridDistance(this.gridX, this.gridY, player.gridX, player.gridY);
    if (dist > CONFIG.CHASE_SIGHT_RANGE) return false;

    // Simple line-of-sight: check if path exists (no walls between)
    // Use a simplified ray check
    const dx = player.gridX - this.gridX;
    const dy = player.gridY - this.gridY;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 1; i <= steps; i++) {
      const checkX = Math.round(this.gridX + (dx * i) / steps);
      const checkY = Math.round(this.gridY + (dy * i) / steps);
      if (grid[checkY] && grid[checkY][checkX] === CONFIG.TILE.WALL) {
        return false;
      }
    }
    return true;
  }

  /**
   * Pick random walkable tile nearby for patrol
   */
  _pickRandomPatrolTarget(grid, rows, cols) {
    const attempts = 10;
    for (let i = 0; i < attempts; i++) {
      const dx = Math.floor(Math.random() * 5) - 2;
      const dy = Math.floor(Math.random() * 5) - 2;
      const nx = this.gridX + dx;
      const ny = this.gridY + dy;
      if (isWalkable(grid, nx, ny, cols, rows)) {
        this.patrolTarget = { x: nx, y: ny };
        this.path = findPath(grid, this.gridX, this.gridY, nx, ny, rows, cols);
        this.pathIndex = 0;
        return;
      }
    }
  }

  /**
   * Move along current path
   */
  _moveAlongPath(dt, speed) {
    if (this.path.length === 0 || this.pathIndex >= this.path.length) return;

    const target = this.path[this.pathIndex];
    const moveSpeed = speed * dt;

    const dx = target.x - this.pixelX;
    const dy = target.y - this.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < moveSpeed) {
      this.pixelX = target.x;
      this.pixelY = target.y;
      this.gridX = target.x;
      this.gridY = target.y;
      this.pathIndex++;
    } else {
      this.pixelX += (dx / dist) * moveSpeed;
      this.pixelY += (dy / dist) * moveSpeed;
    }
  }

  /**
   * Draw monster
   */
  draw(ctx, tileSize, offsetX, offsetY) {
    const drawX = offsetX + this.pixelX * tileSize;
    const drawY = offsetY + this.pixelY * tileSize;

    // Map state to sprite state
    let spriteState = 'normal';
    if (this.state === 'lured') spriteState = 'lured';
    else if (this.state === 'eating') spriteState = 'eating';
    else if (this.state === 'sleep') spriteState = 'sleep';

    Sprites.drawMonster(ctx, drawX, drawY, tileSize, spriteState, this.frame, this.index);

    // Draw effect
    if (this.effectType) {
      Sprites.drawEffect(ctx, drawX, drawY, tileSize, this.effectType, this.frame);
    }
  }
}
