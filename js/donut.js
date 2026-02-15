// === Donut Class ===
class Donut {
  constructor(gridX, gridY, type) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = type;  // 'choco', 'strawberry', 'matcha'
    this.active = true;
    this.reservedBy = null; // Monster ID that reserved this donut
    this.frame = 0;
    this.lifetime = CONFIG.DONUT_LIFETIME; // Frames until expiration
  }

  /**
   * Get the lure radius for this donut
   */
  getLureRadius() {
    const conf = CONFIG.DONUTS[this.type];
    return CONFIG.DEFAULT_LURE_RADIUS * conf.lureRadiusMultiplier;
  }

  /**
   * Get the eat duration for this donut
   */
  getEatDuration() {
    const conf = CONFIG.DONUTS[this.type];
    return CONFIG.DEFAULT_EAT_DURATION * conf.eatDurationMultiplier;
  }

  /**
   * Does this donut cause instant sleep?
   */
  causesInstantSleep() {
    return CONFIG.DONUTS[this.type].instantSleep;
  }

  update() {
    this.frame++;
    if (this.active) {
      this.lifetime--;
      if (this.lifetime <= 0) {
        this.active = false;
        this.reservedBy = null;
      }
    }
  }

  draw(ctx, tileSize, offsetX, offsetY) {
    if (!this.active) return;
    const drawX = offsetX + this.gridX * tileSize;
    const drawY = offsetY + this.gridY * tileSize;

    // Subtle bounce
    const bounce = Math.sin(this.frame * 0.08) * 2;

    // Blink when about to expire (last 2 seconds ≈ 120 frames)
    if (this.lifetime < 120) {
      const blinkRate = this.lifetime < 60 ? 0.4 : 0.2; // Faster blink when very low
      const blink = Math.sin(this.frame * blinkRate) > 0;
      if (!blink) {
        ctx.globalAlpha = 0.3;
      }
    }

    Sprites.drawDonut(ctx, drawX, drawY + bounce, tileSize, this.type);

    // Draw lifetime indicator (circular progress)
    if (this.lifetime < 180) { // Show when < 3 seconds remain
      const progress = this.lifetime / CONFIG.DONUT_LIFETIME;
      const cx = drawX + tileSize / 2;
      const cy = drawY + bounce + tileSize / 2;
      ctx.strokeStyle = progress < 0.2 ? '#FF4444' : '#FFAA00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}
