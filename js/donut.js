// === Donut Class ===
class Donut {
  constructor(gridX, gridY, type) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = type;  // 'choco', 'strawberry', 'matcha'
    this.active = true;
    this.reservedBy = null; // Monster ID that reserved this donut
    this.frame = 0;
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
  }

  draw(ctx, tileSize, offsetX, offsetY) {
    if (!this.active) return;
    const drawX = offsetX + this.gridX * tileSize;
    const drawY = offsetY + this.gridY * tileSize;

    // Subtle bounce
    const bounce = Math.sin(this.frame * 0.08) * 2;

    Sprites.drawDonut(ctx, drawX, drawY + bounce, tileSize, this.type);
  }
}
