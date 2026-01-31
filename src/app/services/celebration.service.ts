import { Injectable, signal } from '@angular/core';
import confetti from 'canvas-confetti';
import { Fireworks } from 'fireworks-js';

@Injectable({
  providedIn: 'root'
})
export class CelebrationService {
  private _isActive = signal(false);
  readonly isActive = this._isActive.asReadonly();

  private fireworksInstance: Fireworks | null = null;
  private celebrationTimeout: ReturnType<typeof setTimeout> | null = null;

  triggerCelebration(consensusValue: string): void {
    if (this._isActive()) return;
    
    this._isActive.set(true);

    // Start all celebration effects
    this.launchConfettiBarrage();
    this.startFireworks();
    this.playVictoryEffects();

    // Auto-stop after 6 seconds
    this.celebrationTimeout = setTimeout(() => {
      this.stopCelebration();
    }, 6000);
  }

  stopCelebration(): void {
    this._isActive.set(false);
    
    if (this.celebrationTimeout) {
      clearTimeout(this.celebrationTimeout);
      this.celebrationTimeout = null;
    }

    this.stopFireworks();
  }

  private launchConfettiBarrage(): void {
    const duration = 5000;
    const end = Date.now() + duration;

    // Initial big burst from center
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      startVelocity: 45,
      gravity: 0.8,
      scalar: 1.2
    });

    // Emoji confetti burst
    const emojis = ['🎉', '⭐', '✨', '🎊', '🏆', '💯'];
    emojis.forEach((emoji, i) => {
      setTimeout(() => {
        const shape = confetti.shapeFromText({ text: emoji, scalar: 2 });
        confetti({
          shapes: [shape],
          scalar: 2,
          particleCount: 30,
          spread: 60,
          origin: { x: Math.random(), y: Math.random() * 0.5 }
        });
      }, i * 200);
    });

    // Continuous side cannons
    const frame = () => {
      if (Date.now() > end || !this._isActive()) return;

      // Left cannon
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#FF4500'],
        startVelocity: 60
      });

      // Right cannon
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#00CED1', '#20B2AA', '#48D1CC', '#40E0D0'],
        startVelocity: 60
      });

      requestAnimationFrame(frame);
    };

    // Delay start of continuous confetti
    setTimeout(frame, 500);

    // Random bursts throughout
    const burstInterval = setInterval(() => {
      if (Date.now() > end || !this._isActive()) {
        clearInterval(burstInterval);
        return;
      }

      confetti({
        particleCount: 80,
        spread: 360,
        startVelocity: 30,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5
        },
        colors: ['#FF1493', '#00FF7F', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'],
        ticks: 200,
        gravity: 0.6,
        decay: 0.94,
        scalar: 1.1
      });
    }, 400);

    // Star shaped confetti
    setTimeout(() => {
      const star = confetti.shapeFromPath({
        path: 'M12 0 L14.5 9.5 L24 9.5 L16.5 15.5 L19 24 L12 18.5 L5 24 L7.5 15.5 L0 9.5 L9.5 9.5 Z'
      });
      
      confetti({
        shapes: [star],
        particleCount: 50,
        spread: 180,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FFC107', '#FFEB3B'],
        scalar: 1.5,
        startVelocity: 35
      });
    }, 1000);
  }

  private startFireworks(): void {
    const container = document.getElementById('fireworks-container');
    if (!container) return;

    container.style.display = 'block';

    this.fireworksInstance = new Fireworks(container, {
      autoresize: true,
      opacity: 0.5,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 90,
      traceLength: 3,
      traceSpeed: 10,
      explosion: 6,
      intensity: 40,
      flickering: 50,
      lineStyle: 'round',
      hue: {
        min: 0,
        max: 360
      },
      delay: {
        min: 15,
        max: 30
      },
      rocketsPoint: {
        min: 30,
        max: 70
      },
      lineWidth: {
        explosion: { min: 1, max: 4 },
        trace: { min: 0.5, max: 1.5 }
      },
      brightness: {
        min: 50,
        max: 80
      },
      decay: {
        min: 0.015,
        max: 0.03
      },
      mouse: {
        click: false,
        move: false,
        max: 1
      }
    });

    this.fireworksInstance.start();
  }

  private stopFireworks(): void {
    if (this.fireworksInstance) {
      this.fireworksInstance.stop();
      this.fireworksInstance = null;
    }

    const container = document.getElementById('fireworks-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  private playVictoryEffects(): void {
    // Trigger CSS animations via custom event
    window.dispatchEvent(new CustomEvent('consensus-celebration'));
  }
}

