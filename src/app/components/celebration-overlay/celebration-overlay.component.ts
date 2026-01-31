import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelebrationService } from '../../services/celebration.service';

@Component({
  selector: 'app-celebration-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './celebration-overlay.component.html',
  styleUrl: './celebration-overlay.component.scss'
})
export class CelebrationOverlayComponent implements OnChanges {
  @Input() hasConsensus = false;
  @Input() consensusValue: string | null = null;

  showBanner = false;
  private hasTriggered = false;

  constructor(private celebrationService: CelebrationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasConsensus']) {
      if (this.hasConsensus && !this.hasTriggered && this.consensusValue) {
        this.triggerCelebration();
      } else if (!this.hasConsensus) {
        this.hasTriggered = false;
        this.showBanner = false;
      }
    }
  }

  private triggerCelebration(): void {
    this.hasTriggered = true;
    this.showBanner = true;
    this.celebrationService.triggerCelebration(this.consensusValue!);

    // Hide banner after animation
    setTimeout(() => {
      this.showBanner = false;
    }, 5000);
  }

  @HostListener('window:consensus-celebration')
  onCelebrationEvent(): void {
    // This triggers CSS animations via the event
  }

  get isActive(): boolean {
    return this.celebrationService.isActive();
  }
}

