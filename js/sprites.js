// === Premium Canvas-Drawn Sprites ===
// High-detail procedural sprite rendering with gradients, shading, and personality

const Sprites = {
  /**
   * Draw the Chef — cute chick (ひよこ) with chef hat, scarf, and spatula
   */
  drawChef(ctx, x, y, size, frame) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;
    const bounce = Math.sin(frame * 0.15) * 1.5;

    ctx.save();
    ctx.translate(cx, cy + bounce);

    // === Feet (orange, small) ===
    ctx.fillStyle = '#E8960C';
    ctx.beginPath();
    ctx.ellipse(-s * 0.08, s * 0.36, s * 0.06, s * 0.025, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.08, s * 0.36, s * 0.06, s * 0.025, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // === Body (small, round — kawaii proportions) ===
    const bodyGrad = ctx.createRadialGradient(-s * 0.03, s * 0.12, s * 0.02, 0, s * 0.15, s * 0.22);
    bodyGrad.addColorStop(0, '#FFF8D0');
    bodyGrad.addColorStop(0.4, '#FFE88A');
    bodyGrad.addColorStop(0.8, '#FFDD55');
    bodyGrad.addColorStop(1, '#E8C030');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.18, s * 0.20, s * 0.20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C0A020';
    ctx.lineWidth = s * 0.02;
    ctx.stroke();

    // === Red Scarf / Neckerchief ===
    ctx.fillStyle = '#DD2222';
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, s * 0.02);
    ctx.quadraticCurveTo(-s * 0.08, s * 0.08, -s * 0.03, s * 0.04);
    ctx.lineTo(0, s * 0.06);
    ctx.lineTo(s * 0.03, s * 0.04);
    ctx.quadraticCurveTo(s * 0.08, s * 0.08, s * 0.14, s * 0.02);
    ctx.quadraticCurveTo(s * 0.10, -s * 0.01, s * 0.06, -s * 0.02);
    ctx.lineTo(0, -s * 0.01);
    ctx.lineTo(-s * 0.06, -s * 0.02);
    ctx.quadraticCurveTo(-s * 0.10, -s * 0.01, -s * 0.14, s * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#AA1111';
    ctx.lineWidth = s * 0.01;
    ctx.stroke();
    // Scarf tail
    ctx.fillStyle = '#CC1111';
    ctx.beginPath();
    ctx.moveTo(s * 0.01, s * 0.05);
    ctx.lineTo(s * 0.04, s * 0.18);
    ctx.lineTo(-s * 0.02, s * 0.16);
    ctx.closePath();
    ctx.fill();

    // === Wings (tiny, at sides) ===
    ctx.fillStyle = '#FFDD55';
    ctx.strokeStyle = '#C0A020';
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.ellipse(-s * 0.20, s * 0.14, s * 0.05, s * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s * 0.20, s * 0.14, s * 0.05, s * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // === HEAD (BIG — kawaii style, ~60% of sprite) ===
    const headGrad = ctx.createRadialGradient(-s * 0.03, -s * 0.18, s * 0.02, 0, -s * 0.12, s * 0.28);
    headGrad.addColorStop(0, '#FFF8D0');
    headGrad.addColorStop(0.3, '#FFE88A');
    headGrad.addColorStop(0.7, '#FFDD55');
    headGrad.addColorStop(1, '#E8C030');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -s * 0.12, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C0A020';
    ctx.lineWidth = s * 0.02;
    ctx.stroke();

    // === Chef Hat ===
    // Hat band
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#BBAA88';
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.34, s * 0.22, s * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hat puff
    const hatGrad = ctx.createLinearGradient(0, -s * 0.58, 0, -s * 0.32);
    hatGrad.addColorStop(0, '#FFFFFF');
    hatGrad.addColorStop(0.7, '#F8F8F4');
    hatGrad.addColorStop(1, '#F0F0E8');
    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.20, -s * 0.34);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.44, -s * 0.18, -s * 0.52);
    ctx.quadraticCurveTo(-s * 0.08, -s * 0.58, 0, -s * 0.56);
    ctx.quadraticCurveTo(s * 0.08, -s * 0.58, s * 0.18, -s * 0.52);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.44, s * 0.20, -s * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#BBAA88';
    ctx.lineWidth = s * 0.015;
    ctx.stroke();

    // === Eyes (BIG, simple black dots — kawaii!) ===
    // Left eye
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(-s * 0.10, -s * 0.14, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.arc(s * 0.10, -s * 0.14, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine (large white dot — makes them look alive)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-s * 0.085, -s * 0.155, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.115, -s * 0.155, s * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // === Beak (small, cute triangle) ===
    ctx.fillStyle = '#F0960C';
    ctx.beginPath();
    ctx.moveTo(-s * 0.025, -s * 0.07);
    ctx.lineTo(0, -s * 0.03);
    ctx.lineTo(s * 0.025, -s * 0.07);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#C07808';
    ctx.lineWidth = s * 0.008;
    ctx.stroke();

    // === Cheeks (blush — kawaii pink circles) ===
    const blushGrad1 = ctx.createRadialGradient(-s * 0.18, -s * 0.08, 0, -s * 0.18, -s * 0.08, s * 0.05);
    blushGrad1.addColorStop(0, 'rgba(255, 140, 140, 0.55)');
    blushGrad1.addColorStop(1, 'rgba(255, 140, 140, 0)');
    ctx.fillStyle = blushGrad1;
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
    const blushGrad2 = ctx.createRadialGradient(s * 0.18, -s * 0.08, 0, s * 0.18, -s * 0.08, s * 0.05);
    blushGrad2.addColorStop(0, 'rgba(255, 140, 140, 0.55)');
    blushGrad2.addColorStop(1, 'rgba(255, 140, 140, 0)');
    ctx.fillStyle = blushGrad2;
    ctx.beginPath();
    ctx.arc(s * 0.18, -s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // === Sparkle (decorative star — like reference image) ===
    const sparklePhase = (frame * 0.06) % (Math.PI * 2);
    const sparkleAlpha = Math.sin(sparklePhase) * 0.5 + 0.5;
    ctx.globalAlpha = sparkleAlpha;
    ctx.fillStyle = '#FFD700';
    this._drawStar(ctx, -s * 0.34, -s * 0.28, s * 0.04, 4);
    ctx.fillStyle = '#FFFFFF';
    this._drawStar(ctx, s * 0.32, -s * 0.06, s * 0.025, 4);
    ctx.globalAlpha = 1;

    ctx.restore();
  },

  /**
   * Draw Monster sprite — rich detail with unique personalities
   */
  drawMonster(ctx, x, y, size, state, frame, monsterIndex) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;
    const palettes = [
      { body: '#9B59B6', dark: '#6C3483', light: '#D2B4DE', glow: '#E8DAEF', eye: '#F1C40F', horn: '#7D3C98' },
      { body: '#27AE60', dark: '#1D6F42', light: '#82E0AA', glow: '#D5F5E3', eye: '#E74C3C', horn: '#196F3D' },
      { body: '#E74C3C', dark: '#922B21', light: '#F5B7B1', glow: '#FADBD8', eye: '#F39C12', horn: '#B03A2E' },
    ];
    const c = palettes[monsterIndex % palettes.length];

    ctx.save();
    ctx.translate(cx, cy);

    if (state === 'sleep') {
      this._drawSleepingMonster(ctx, s, c, frame);
    } else if (state === 'eating') {
      this._drawEatingMonster(ctx, s, c, frame, monsterIndex);
    } else if (state === 'lured') {
      this._drawLuredMonster(ctx, s, c, frame, monsterIndex);
    } else {
      this._drawNormalMonster(ctx, s, c, frame, monsterIndex, state === 'chase');
    }

    ctx.restore();
  },

  // === Monster States ===

  _drawNormalMonster(ctx, s, c, frame, idx, isChasing) {
    const wobble = Math.sin(frame * 0.1) * 2;
    const breathe = Math.sin(frame * 0.06) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.32, s * 0.22, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body gradient
    const bodyGrad = ctx.createRadialGradient(-s * 0.05, -s * 0.1, s * 0.05, 0, 0, s * 0.35);
    bodyGrad.addColorStop(0, c.light);
    bodyGrad.addColorStop(0.4, c.body);
    bodyGrad.addColorStop(1, c.dark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.34, s * 0.0, -s * 0.22, -s * 0.2);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.38 + wobble, 0, -s * 0.35 + wobble + breathe);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.38 + wobble, s * 0.22, -s * 0.2);
    ctx.quadraticCurveTo(s * 0.34, s * 0.0, s * 0.28, s * 0.3);
    ctx.closePath();
    ctx.fill();

    // Body outline
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Belly spot (lighter area)
    const bellyGrad = ctx.createRadialGradient(0, s * 0.06, 0, 0, s * 0.06, s * 0.16);
    bellyGrad.addColorStop(0, c.glow);
    bellyGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.06, s * 0.14, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots/patterns
    ctx.fillStyle = c.dark + '44';
    for (let i = 0; i < 4; i++) {
      const angle = i * 1.6 + 0.5;
      const dist = s * 0.18;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist * 0.6 - s * 0.05, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }

    // Horns
    this._drawHorns(ctx, s, c, wobble);

    // Arms (stubby)
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(-s * 0.30, s * 0.05, s * 0.06, s * 0.09, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s * 0.30, s * 0.05, s * 0.06, s * 0.09, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Claws
    ctx.fillStyle = c.dark;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(side * s * 0.34 + i * s * 0.015, s * 0.12, s * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Feet
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, s * 0.32, s * 0.08, s * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.12, s * 0.32, s * 0.08, s * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face
    this._drawMonsterFace(ctx, s, c, frame, isChasing);
  },

  _drawLuredMonster(ctx, s, c, frame, idx) {
    const wobble = Math.sin(frame * 0.15) * 3;
    const drool = Math.sin(frame * 0.2) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.32, s * 0.22, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (slightly leaning forward)
    const bodyGrad = ctx.createRadialGradient(-s * 0.05, -s * 0.1, s * 0.05, 0, 0, s * 0.35);
    bodyGrad.addColorStop(0, c.light);
    bodyGrad.addColorStop(0.4, c.body);
    bodyGrad.addColorStop(1, c.dark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.34, s * 0.0, -s * 0.22, -s * 0.2);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.38 + wobble, 0, -s * 0.35 + wobble);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.38 + wobble, s * 0.22, -s * 0.2);
    ctx.quadraticCurveTo(s * 0.34, s * 0.0, s * 0.28, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Belly
    const bellyGrad = ctx.createRadialGradient(0, s * 0.06, 0, 0, s * 0.06, s * 0.16);
    bellyGrad.addColorStop(0, c.glow);
    bellyGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.06, s * 0.14, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    this._drawHorns(ctx, s, c, wobble);

    // Arms reaching out
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(-s * 0.32, s * 0.0, s * 0.06, s * 0.09, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.32, s * 0.0, s * 0.06, s * 0.09, -0.6, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, s * 0.32, s * 0.08, s * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.12, s * 0.32, s * 0.08, s * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Star sparkle eyes
    ctx.fillStyle = '#FFD700';
    this._drawStar(ctx, -s * 0.08, -s * 0.12, s * 0.05, 5);
    this._drawStar(ctx, s * 0.08, -s * 0.12, s * 0.05, 5);

    // Open mouth (drooling)
    ctx.fillStyle = '#2C0A1E';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.02, s * 0.08, s * 0.06 + drool * 0.005, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tongue
    ctx.fillStyle = '#FF6B8A';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.06, s * 0.04, s * 0.03, 0, 0, Math.PI);
    ctx.fill();
    // Drool
    ctx.fillStyle = 'rgba(200,220,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(s * 0.04, s * 0.08 + drool, s * 0.015, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawEatingMonster(ctx, s, c, frame, idx) {
    const munch = Math.abs(Math.sin(frame * 0.3)) * s * 0.04;
    const happy = Math.sin(frame * 0.15) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.32, s * 0.24, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (fatter, satisfied)
    const bodyGrad = ctx.createRadialGradient(-s * 0.05, -s * 0.1, s * 0.05, 0, 0, s * 0.38);
    bodyGrad.addColorStop(0, c.light);
    bodyGrad.addColorStop(0.4, c.body);
    bodyGrad.addColorStop(1, c.dark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.36, s * 0.0, -s * 0.24, -s * 0.18);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.35 + happy, 0, -s * 0.33 + happy);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.35 + happy, s * 0.24, -s * 0.18);
    ctx.quadraticCurveTo(s * 0.36, s * 0.0, s * 0.3, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Belly
    const bellyGrad = ctx.createRadialGradient(0, s * 0.06, 0, 0, s * 0.06, s * 0.18);
    bellyGrad.addColorStop(0, c.glow);
    bellyGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.06, s * 0.16, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    this._drawHorns(ctx, s, c, happy);

    // Arms holding tummy
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(-s * 0.28, s * 0.1, s * 0.06, s * 0.09, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.28, s * 0.1, s * 0.06, s * 0.09, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, s * 0.32, s * 0.08, s * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.12, s * 0.32, s * 0.08, s * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Happy squint eyes ^_^
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-s * 0.08, -s * 0.12, s * 0.04, Math.PI + 0.4, -0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.08, -s * 0.12, s * 0.04, Math.PI + 0.4, -0.4);
    ctx.stroke();

    // Munching mouth
    ctx.fillStyle = '#2C0A1E';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.02, s * 0.06, s * 0.03 + munch, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crumbs
    ctx.fillStyle = '#DEB887';
    for (let i = 0; i < 3; i++) {
      const cx2 = Math.sin(frame * 0.1 + i) * s * 0.1;
      const cy2 = s * 0.06 + i * s * 0.025;
      ctx.beginPath();
      ctx.arc(cx2, cy2, s * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  _drawSleepingMonster(ctx, s, c, frame) {
    const breathe = Math.sin(frame * 0.04) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.18, s * 0.3, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Curled up body
    const bodyGrad = ctx.createRadialGradient(-s * 0.05, -s * 0.02, s * 0.05, 0, s * 0.02, s * 0.3);
    bodyGrad.addColorStop(0, c.light);
    bodyGrad.addColorStop(0.5, c.body);
    bodyGrad.addColorStop(1, c.dark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.04, s * 0.28 + breathe * 0.5, s * 0.18 + breathe * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Belly
    ctx.fillStyle = c.glow + '88';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.08, s * 0.2, s * 0.07, 0, 0, Math.PI);
    ctx.fill();

    // Horns (small, poking out)
    ctx.fillStyle = c.horn;
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.08);
    ctx.lineTo(-s * 0.2, -s * 0.18);
    ctx.lineTo(-s * 0.1, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.08);
    ctx.lineTo(s * 0.2, -s * 0.18);
    ctx.lineTo(s * 0.1, -s * 0.1);
    ctx.closePath();
    ctx.fill();

    // Closed eyes — peaceful
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-s * 0.08, -s * 0.02, s * 0.035, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.08, -s * 0.02, s * 0.035, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // Snot bubble
    const bubbleSize = s * 0.04 + Math.sin(frame * 0.06) * s * 0.015;
    ctx.fillStyle = 'rgba(200,220,255,0.5)';
    ctx.strokeStyle = 'rgba(160,190,240,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(s * 0.12, s * 0.04, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bubble shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(s * 0.11, s * 0.025, bubbleSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  // === Monster Helpers ===

  _drawHorns(ctx, s, c, wobble) {
    const hornGrad = ctx.createLinearGradient(0, -s * 0.4, 0, -s * 0.24);
    hornGrad.addColorStop(0, '#FFE4B5');
    hornGrad.addColorStop(0.5, c.horn);
    hornGrad.addColorStop(1, c.dark);

    ctx.fillStyle = hornGrad;
    // Left horn
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, -s * 0.22 + wobble * 0.3);
    ctx.lineTo(-s * 0.2, -s * 0.40 + wobble * 0.5);
    ctx.lineTo(-s * 0.05, -s * 0.24 + wobble * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.22 + wobble * 0.3);
    ctx.lineTo(s * 0.2, -s * 0.40 + wobble * 0.5);
    ctx.lineTo(s * 0.05, -s * 0.24 + wobble * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  _drawMonsterFace(ctx, s, c, frame, isChasing) {
    // Outer eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-s * 0.09, -s * 0.13, s * 0.06, s * 0.065, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.09, -s * 0.13, s * 0.06, s * 0.065, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Iris (follows based on state)
    const lookX = isChasing ? Math.sin(frame * 0.15) * s * 0.01 : 0;
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(-s * 0.08 + lookX, -s * 0.12, s * 0.035, 0, Math.PI * 2);
    ctx.arc(s * 0.1 + lookX, -s * 0.12, s * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.arc(-s * 0.08 + lookX, -s * 0.12, s * 0.02, 0, Math.PI * 2);
    ctx.arc(s * 0.1 + lookX, -s * 0.12, s * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-s * 0.07, -s * 0.135, s * 0.012, 0, Math.PI * 2);
    ctx.arc(s * 0.11, -s * 0.135, s * 0.012, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.fillStyle = '#2C0A1E';
    ctx.beginPath();
    if (isChasing) {
      // Wide open angry mouth
      ctx.ellipse(0, s * 0.02, s * 0.09, s * 0.06, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, s * 0.02, s * 0.06, 0.05, Math.PI - 0.05);
    }
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#FFFFFF';
    if (isChasing) {
      // Top teeth
      for (let i = -2; i <= 2; i++) {
        const tx = i * s * 0.03;
        ctx.beginPath();
        ctx.moveTo(tx - s * 0.012, s * -0.02);
        ctx.lineTo(tx, s * 0.01);
        ctx.lineTo(tx + s * 0.012, s * -0.02);
        ctx.closePath();
        ctx.fill();
      }
      // Bottom teeth
      for (let i = -1; i <= 1; i++) {
        const tx = i * s * 0.035;
        ctx.beginPath();
        ctx.moveTo(tx - s * 0.01, s * 0.06);
        ctx.lineTo(tx, s * 0.04);
        ctx.lineTo(tx + s * 0.01, s * 0.06);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Friendly teeth
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * s * 0.022 - s * 0.008, s * 0.02, s * 0.016, s * 0.022);
      }
    }
  },

  /**
   * Draw a donut
   */
  drawDonut(ctx, x, y, size, type) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;
    const donutConf = CONFIG.DONUTS[type];
    const r = s * 0.32;
    const holeR = s * 0.11;

    ctx.save();
    ctx.translate(cx, cy);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(2, 4, r + 2, r * 0.7 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dough base
    const doughGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
    doughGrad.addColorStop(0, '#F0D5A0');
    doughGrad.addColorStop(0.7, '#DEB887');
    doughGrad.addColorStop(1, '#C49A6C');
    ctx.fillStyle = doughGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Icing/topping
    ctx.fillStyle = donutConf.highlight;
    ctx.beginPath();
    ctx.arc(0, -1, r - 2, 0, Math.PI * 2);
    ctx.fill();

    // Icing main color
    const icingGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.3, 0, 0, 0, r);
    icingGrad.addColorStop(0, donutConf.highlight);
    icingGrad.addColorStop(1, donutConf.color);
    ctx.fillStyle = icingGrad;
    ctx.beginPath();
    ctx.arc(0, -2, r - 3, 0, Math.PI * 2);
    ctx.fill();

    // Hole
    ctx.fillStyle = CONFIG.COLORS.FLOOR;
    ctx.beginPath();
    ctx.arc(0, 0, holeR, 0, Math.PI * 2);
    ctx.fill();
    // Hole inner shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, holeR, 0, Math.PI * 2);
    ctx.stroke();

    // Sprinkles for strawberry
    if (type === 'strawberry') {
      const sprinkleColors = ['#FF4444', '#FFEE44', '#44AAFF', '#44FF44', '#FF88FF'];
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const dist = r * 0.55 + Math.sin(i * 3) * r * 0.15;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle + 0.5);
        ctx.beginPath();
        ctx.roundRect(-2.5, -1, 5, 2, 1);
        ctx.fill();
        ctx.restore();
      }
    }

    // Chocolate drizzle for choco
    if (type === 'choco') {
      ctx.strokeStyle = '#3D2200';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const a1 = (i / 5) * Math.PI * 2;
        const a2 = a1 + 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, a1, a2);
        ctx.stroke();
      }
    }

    // Matcha powder dust
    if (type === 'matcha') {
      ctx.fillStyle = 'rgba(100, 160, 50, 0.3)';
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = holeR + Math.random() * (r - holeR - 3);
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.2, r * 0.1, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Draw floor tile
   */
  drawFloorTile(ctx, x, y, size, alt) {
    ctx.fillStyle = alt ? CONFIG.COLORS.FLOOR_ALT : CONFIG.COLORS.FLOOR;
    ctx.fillRect(x, y, size, size);

    // Subtle grid
    ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, size, size);

    // Candy pattern dots
    if ((Math.floor(x / size) + Math.floor(y / size)) % 5 === 0) {
      ctx.fillStyle = 'rgba(255,200,200,0.15)';
      ctx.beginPath();
      ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  /**
   * Draw wall tile (biscuit/wafer style)
   */
  drawWallTile(ctx, x, y, size) {
    // Base
    ctx.fillStyle = CONFIG.COLORS.WALL;
    ctx.fillRect(x, y, size, size);

    // Wafer pattern
    ctx.fillStyle = CONFIG.COLORS.WALL_DARK;
    const gap = size / 4;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x, y + i * gap, size, 1.5);
    }
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + i * gap, y, 1.5, size);
    }

    // Light edge (top, left)
    ctx.fillStyle = CONFIG.COLORS.WALL_LIGHT;
    ctx.fillRect(x, y, size, 2);
    ctx.fillRect(x, y, 2, size);

    // Dark edge (bottom, right)
    ctx.fillStyle = CONFIG.COLORS.WALL_DARK;
    ctx.fillRect(x, y + size - 2, size, 2);
    ctx.fillRect(x + size - 2, y, 2, size);
  },

  /**
   * Draw goal (cake house)
   */
  drawGoal(ctx, x, y, size, frame) {
    const s = size;
    const cx = x + s / 2;
    const glow = Math.sin(frame * 0.08) * 0.15 + 0.35;

    ctx.save();

    // Glow effect
    const gradient = ctx.createRadialGradient(cx, y + s / 2, s * 0.1, cx, y + s / 2, s * 0.6);
    gradient.addColorStop(0, `rgba(255, 136, 170, ${glow})`);
    gradient.addColorStop(1, 'rgba(255, 136, 170, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - s * 0.2, y - s * 0.2, s * 1.4, s * 1.4);

    // Cake base
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.roundRect(x + s * 0.1, y + s * 0.3, s * 0.8, s * 0.55, 4);
    ctx.fill();

    // Cream layer
    ctx.fillStyle = '#FFFAF0';
    ctx.beginPath();
    ctx.roundRect(x + s * 0.12, y + s * 0.45, s * 0.76, s * 0.12, 3);
    ctx.fill();

    // Roof (frosting)
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.05, y + s * 0.35);
    ctx.lineTo(cx, y + s * 0.05);
    ctx.lineTo(x + s * 0.95, y + s * 0.35);
    ctx.closePath();
    ctx.fill();

    // Door
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.roundRect(x + s * 0.37, y + s * 0.55, s * 0.26, s * 0.3, [4, 4, 0, 0]);
    ctx.fill();

    // Doorknob
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + s * 0.56, y + s * 0.72, s * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Cherry on top
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(cx, y + s * 0.05, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, y + s * 0.0);
    ctx.quadraticCurveTo(cx + s * 0.08, y - s * 0.05, cx + s * 0.05, y - s * 0.0);
    ctx.stroke();

    // Stars sparkle
    const starPhase = frame * 0.1;
    ctx.fillStyle = `rgba(255, 255, 200, ${Math.sin(starPhase) * 0.5 + 0.5})`;
    this._drawStar(ctx, x + s * 0.15, y + s * 0.15, 4, 4);
    ctx.fillStyle = `rgba(255, 255, 200, ${Math.sin(starPhase + 2) * 0.5 + 0.5})`;
    this._drawStar(ctx, x + s * 0.85, y + s * 0.2, 3, 4);

    ctx.restore();
  },

  /**
   * Draw effect overlays
   */
  drawEffect(ctx, x, y, size, type, frame) {
    const cx = x + size / 2;
    const topY = y - size * 0.15;
    ctx.save();

    if (type === 'alert') {
      const bobble = Math.sin(frame * 0.3) * 3;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(cx - 12, topY - 28 + bobble, 24, 24, 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 4, topY - 4 + bobble);
      ctx.lineTo(cx, topY + 4 + bobble);
      ctx.lineTo(cx + 4, topY - 4 + bobble);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FF4444';
      ctx.font = `bold ${size * 0.3}px 'M PLUS Rounded 1c', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('！', cx, topY - 16 + bobble);
    } else if (type === 'heart') {
      for (let i = 0; i < 3; i++) {
        const t = (frame * 0.03 + i * 0.33) % 1;
        const hx = cx + Math.sin(i * 2.5 + frame * 0.05) * 12;
        const hy = topY - t * size * 0.6;
        const alpha = 1 - t;
        ctx.fillStyle = `rgba(255, 100, 130, ${alpha})`;
        ctx.font = `${size * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('♥', hx, hy);
      }
    } else if (type === 'zzz') {
      const letters = ['Z', 'z', 'z'];
      for (let i = 0; i < 3; i++) {
        const t = (frame * 0.02 + i * 0.33) % 1;
        const zx = cx + size * 0.1 + i * 8;
        const zy = topY - t * size * 0.5 - i * 6;
        const alpha = 0.8 - t * 0.5;
        ctx.fillStyle = `rgba(150, 180, 255, ${alpha})`;
        ctx.font = `bold ${size * (0.18 + i * 0.05)}px 'M PLUS Rounded 1c', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(letters[i], zx, zy);
      }
    }

    ctx.restore();
  },

  // Helper: draw a star
  _drawStar(ctx, cx, cy, r, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const dist = i % 2 === 0 ? r : r * 0.4;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  },
};
