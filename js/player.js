// === Player Class ===
class Player {
  constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelX = gridX;
    this.pixelY = gridY;
    this.path = [];
    this.pathIndex = 0;
    this.moving = false;
    this.frame = 0;
    this.alive = true;
  }

  /**
   * Set a new target and compute A* path
   */
  setTarget(targetX, targetY, grid, rows, cols) {
    const path = findPath(grid, this.gridX, this.gridY, targetX, targetY, rows, cols);
    if (path.length > 0) {
      this.path = path;
      this.pathIndex = 0;
      this.moving = true;
    }
  }

  /**
   * Update position along current path
   */
  update(dt) {
    this.frame++;

    if (!this.moving || this.path.length === 0) return;

    const target = this.path[this.pathIndex];
    const speed = CONFIG.PLAYER_SPEED * dt;

    const dx = target.x - this.pixelX;
    const dy = target.y - this.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
      this.pixelX = target.x;
      this.pixelY = target.y;
      this.gridX = target.x;
      this.gridY = target.y;
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        this.moving = false;
        this.path = [];
      }
    } else {
      this.pixelX += (dx / dist) * speed;
      this.pixelY += (dy / dist) * speed;
    }
  }

  /**
   * Draw player
   */
  draw(ctx, tileSize, offsetX, offsetY) {
    const drawX = offsetX + this.pixelX * tileSize;
    const drawY = offsetY + this.pixelY * tileSize;
    
    // Draw path preview
    if (this.path.length > 0 && this.pathIndex < this.path.length) {
      ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(drawX + tileSize / 2, drawY + tileSize / 2);
      for (let i = this.pathIndex; i < this.path.length; i++) {
        const px = offsetX + this.path[i].x * tileSize + tileSize / 2;
        const py = offsetY + this.path[i].y * tileSize + tileSize / 2;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    Sprites.drawChef(ctx, drawX, drawY, tileSize, this.frame);
  }
}
